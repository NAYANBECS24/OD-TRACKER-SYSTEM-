# OD Tracker WebApp

A lightweight, no-backend OD (On-Duty) tracker for student request workflows.

## What is included
- Create OD requests with student and event details
- Date-range validation (`fromDate <= toDate`)
- Approve / Reject / Delete per request
- Live status dashboard (Total / Pending / Approved / Rejected)
- Search + status filtering
- Export filtered rows to CSV
- Persistent browser storage with LocalStorage

## Run locally
### Option 1
Open `index.html` directly in a browser.

### Option 2 (recommended)
```bash
python3 -m http.server 8080
```
Then open: `http://localhost:8080`

## Notes
This is a front-end prototype intended for quick demos and departmental pilots. For institution-wide rollout, connect this UI to an API + database with authentication.
