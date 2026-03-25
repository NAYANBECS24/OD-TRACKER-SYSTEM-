const STORAGE_KEY = "od-tracker-requests";

const form = document.getElementById("odForm");
const tableBody = document.getElementById("requestsTableBody");
const clearAllBtn = document.getElementById("clearAll");
const rowTemplate = document.getElementById("rowTemplate");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const downloadCsvBtn = document.getElementById("downloadCsv");

function readRequests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function formatRange(from, to) {
  return `${from} → ${to}`;
}

function escapeCsv(value) {
  const safe = String(value ?? "").replaceAll('"', '""');
  return `"${safe}"`;
}

function getFilteredRequests(requests) {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  return requests.filter((request) => {
    const matchesStatus = status === "All" || request.status === status;
    const haystack = `${request.studentName} ${request.registerNo} ${request.eventName}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    return matchesStatus && matchesSearch;
  });
}

function renderStats(requests) {
  const counts = requests.reduce(
    (acc, request) => {
      acc.total += 1;
      if (request.status === "Pending") acc.pending += 1;
      if (request.status === "Approved") acc.approved += 1;
      if (request.status === "Rejected") acc.rejected += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );

  document.getElementById("totalCount").textContent = counts.total;
  document.getElementById("pendingCount").textContent = counts.pending;
  document.getElementById("approvedCount").textContent = counts.approved;
  document.getElementById("rejectedCount").textContent = counts.rejected;
}

function render() {
  const requests = readRequests();
  renderStats(requests);
  const filtered = getFilteredRequests(requests);

  tableBody.innerHTML = "";

  filtered.forEach((request) => {
    const fragment = rowTemplate.content.cloneNode(true);
    const row = fragment.querySelector("tr");

    row.querySelector("[data-name]").textContent = request.studentName;
    row.querySelector("[data-reg]").textContent = request.registerNo;
    row.querySelector("[data-dept]").textContent = request.department;
    row.querySelector("[data-event]").textContent = request.eventName;
    row.querySelector("[data-range]").textContent = formatRange(request.fromDate, request.toDate);
    row.querySelector("[data-reason]").textContent = request.reason;

    const statusPill = row.querySelector("[data-status]");
    statusPill.textContent = request.status;
    statusPill.classList.toggle("approved", request.status === "Approved");
    statusPill.classList.toggle("rejected", request.status === "Rejected");

    row.querySelector('[data-action="approve"]').addEventListener("click", () => updateStatus(request.id, "Approved"));
    row.querySelector('[data-action="reject"]').addEventListener("click", () => updateStatus(request.id, "Rejected"));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteRequest(request.id));

    tableBody.appendChild(fragment);
  });

  if (!filtered.length) {
    tableBody.innerHTML = '<tr><td colspan="8" class="empty">No requests found for the current filter.</td></tr>';
  }
}

function updateStatus(id, status) {
  const requests = readRequests();
  const updated = requests.map((request) => (request.id === id ? { ...request, status } : request));
  writeRequests(updated);
  render();
}

function deleteRequest(id) {
  const requests = readRequests();
  writeRequests(requests.filter((request) => request.id !== id));
  render();
}

function downloadCsv() {
  const requests = getFilteredRequests(readRequests());
  const header = ["Student Name", "Register No", "Department", "Event", "From Date", "To Date", "Reason", "Status"];
  const rows = requests.map((request) => [
    request.studentName,
    request.registerNo,
    request.department,
    request.eventName,
    request.fromDate,
    request.toDate,
    request.reason,
    request.status,
  ]);

  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "od-requests.csv";
  link.click();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  if (fromDate > toDate) {
    alert("From Date must be before or equal to To Date.");
    return;
  }

  const newRequest = {
    id: crypto.randomUUID(),
    studentName: document.getElementById("studentName").value.trim(),
    registerNo: document.getElementById("registerNo").value.trim(),
    department: document.getElementById("department").value.trim(),
    eventName: document.getElementById("eventName").value.trim(),
    fromDate,
    toDate,
    reason: document.getElementById("reason").value.trim(),
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  const requests = readRequests();
  requests.unshift(newRequest);
  writeRequests(requests);
  form.reset();
  render();
});

searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
downloadCsvBtn.addEventListener("click", downloadCsv);

clearAllBtn.addEventListener("click", () => {
  if (confirm("Delete all OD requests?")) {
    writeRequests([]);
    render();
  }
});

render();
