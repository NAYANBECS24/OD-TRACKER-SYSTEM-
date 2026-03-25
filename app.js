const STORAGE_KEY = "od-tracker-requests";

const form = document.getElementById("odForm");
const tableBody = document.getElementById("requestsTableBody");
const clearAllBtn = document.getElementById("clearAll");
const rowTemplate = document.getElementById("rowTemplate");

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

function render() {
  const requests = readRequests();
  tableBody.innerHTML = "";

  requests.forEach((request) => {
    const fragment = rowTemplate.content.cloneNode(true);
    const row = fragment.querySelector("tr");

    row.querySelector("[data-name]").textContent = request.studentName;
    row.querySelector("[data-reg]").textContent = request.registerNo;
    row.querySelector("[data-dept]").textContent = request.department;
    row.querySelector("[data-event]").textContent = request.eventName;
    row.querySelector("[data-range]").textContent = formatRange(request.fromDate, request.toDate);

    const statusPill = row.querySelector("[data-status]");
    statusPill.textContent = request.status;
    statusPill.classList.toggle("approved", request.status === "Approved");
    statusPill.classList.toggle("rejected", request.status === "Rejected");

    row.querySelector('[data-action="approve"]').addEventListener("click", () => {
      updateStatus(request.id, "Approved");
    });

    row.querySelector('[data-action="reject"]').addEventListener("click", () => {
      updateStatus(request.id, "Rejected");
    });

    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      deleteRequest(request.id);
    });

    tableBody.appendChild(fragment);
  });
}

function updateStatus(id, status) {
  const requests = readRequests();
  const updated = requests.map((request) =>
    request.id === id ? { ...request, status } : request
  );
  writeRequests(updated);
  render();
}

function deleteRequest(id) {
  const requests = readRequests();
  writeRequests(requests.filter((request) => request.id !== id));
  render();
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
  };

  const requests = readRequests();
  requests.unshift(newRequest);
  writeRequests(requests);

  form.reset();
  render();
});

clearAllBtn.addEventListener("click", () => {
  if (confirm("Delete all OD requests?")) {
    writeRequests([]);
    render();
  }
});

render();
