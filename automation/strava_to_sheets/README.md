# Strava -> Google Sheets (Webhook-based, production-ready)

This service listens to **Strava webhook events** and writes each activity into a Google Sheet.
It is designed for reliability and low maintenance:

- ✅ automatic near-real-time sync (webhooks, not polling)
- ✅ duplicate prevention (event-level and activity-level)
- ✅ token refresh handling
- ✅ logging + persisted state
- ✅ clear deploy and troubleshooting steps

---

## 1) Implementation choice (quick comparison)

### Option A: Python (Strava API + Google Sheets API)
- **Pros**: Full control, robust error handling, custom logic, best for long-term maintainability.
- **Cons**: You host and monitor it.

### Option B: Google Apps Script
- **Pros**: Simple to start, native to Sheets.
- **Cons**: Harder Strava webhook handling, auth/token management gets messy, weaker observability.

### Option C: Zapier/Make
- **Pros**: Fastest no-code setup.
- **Cons**: Ongoing cost, vendor lock-in, less control over dedupe and retries.

## Chosen approach
**Python + Strava Webhook + Google Sheets API** is the best practical balance for your requirements (automation, duplicate prevention, reliability, maintainability).

---

## 2) Required credentials, keys, and permissions

## Strava
1. Create Strava API app: <https://www.strava.com/settings/api>
2. Collect:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
3. OAuth scope needed:
   - `activity:read_all`
4. Generate long-lived refresh token using `get_strava_refresh_token.py`.
5. Choose a random `STRAVA_VERIFY_TOKEN` (shared secret for webhook verification).

## Google
1. Create Google Cloud project.
2. Enable **Google Sheets API**.
3. Create a **Service Account**.
4. Create JSON key and download as `service-account.json`.
5. Share your target Google Sheet with service account email (Editor permission).
6. Capture:
   - `GOOGLE_SHEET_ID` (from sheet URL)
   - optional worksheet/tab name (default `Activities`)

---

## 3) Google Sheet column structure

The service enforces this header row:

1. `activity_id`
2. `date`
3. `activity_name`
4. `sport_type`
5. `distance_km`
6. `moving_time_min`
7. `elapsed_time_min`
8. `average_speed_kmh`
9. `max_speed_kmh`
10. `elevation_gain_m`
11. `avg_heart_rate`
12. `max_heart_rate`
13. `calories`
14. `description`
15. `gear_name`
16. `gear_id`
17. `athlete_id`
18. `source`
19. `last_synced_utc`

---

## 4) Full code files

- `app.py` — FastAPI webhook service, token refresh, dedupe, sheet upsert.
- `get_strava_refresh_token.py` — one-time helper script for refresh token.
- `.env.example` — environment template.
- `requirements.txt` — Python dependencies.

---

## 5) Setup (step by step)

### Step 1: Install dependencies
```bash
cd automation/strava_to_sheets
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Step 2: Configure environment
```bash
cp .env.example .env
```
Fill `.env` values.

### Step 3: Place Google credentials file
Save your service account key as:
```text
automation/strava_to_sheets/service-account.json
```
(or set `GOOGLE_SERVICE_ACCOUNT_FILE` to your custom path)

### Step 4: Get Strava refresh token (one-time)
```bash
source .venv/bin/activate
export STRAVA_CLIENT_ID=...
export STRAVA_CLIENT_SECRET=...
python get_strava_refresh_token.py
```
Copy the resulting `STRAVA_REFRESH_TOKEN` into `.env`.

### Step 5: Run service locally
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Step 6: Expose service publicly (for webhook callbacks)
For local testing with ngrok:
```bash
ngrok http 8000
```
Use generated HTTPS URL (example `https://abc123.ngrok-free.app`).

### Step 7: Create Strava webhook subscription
```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=$STRAVA_CLIENT_ID \
  -F client_secret=$STRAVA_CLIENT_SECRET \
  -F callback_url=https://YOUR_PUBLIC_URL/strava/webhook \
  -F verify_token=$STRAVA_VERIFY_TOKEN
```

Verify subscription:
```bash
curl "https://www.strava.com/api/v3/push_subscriptions?client_id=$STRAVA_CLIENT_ID&client_secret=$STRAVA_CLIENT_SECRET"
```

---

## 6) Deploy for automatic operation

Recommended options:
- **Railway / Render / Fly.io / Cloud Run** (always-on container)

Deployment checklist:
1. Deploy `app.py` service.
2. Set all `.env` variables in host secrets manager.
3. Upload `service-account.json` securely (or inject JSON via secret file).
4. Ensure public HTTPS URL is stable.
5. Create Strava subscription with that stable callback URL.
6. Monitor logs and keep service running 24/7.

---

## 7) How duplicate prevention works

1. **Webhook event dedupe:** each `event_id` is stored in SQLite (`processed_events`). Duplicate events are skipped.
2. **Activity dedupe in sheet:** service searches `activity_id` in column A:
   - if found → row updated
   - if missing → row appended

This handles retries, updates, and idempotency cleanly.

---

## 8) Error handling and logging behavior

- Token refresh is automatic on startup/use and on 401 responses.
- All processing failures are logged to:
  - stdout
  - rotating file `sync.log`
- Failed events are marked in SQLite with error details.
- Non-activity or delete events are explicitly ignored and logged.

---

## 9) Testing checklist

### Functional test
1. Start service.
2. Confirm health endpoint:
```bash
curl http://localhost:8000/health
```
3. Upload a new activity in Strava.
4. Check:
   - app log shows `mode=inserted`
   - row appears in sheet
5. Edit activity name/description in Strava.
6. Check:
   - app log shows `mode=updated`
   - same row updated (not duplicated)

### Duplicate test
- Replay the same webhook payload with identical `event_id`.
- Confirm log: "Skipping duplicate event_id".

### Failure test
- Temporarily break `GOOGLE_SHEET_ID`.
- Trigger event.
- Confirm failure logged and stored in `processed_events` with status `failed`.

---

## 10) Troubleshooting

### Webhook verification fails (403)
- `STRAVA_VERIFY_TOKEN` mismatch between your app and subscription request.

### 401 from Strava activity endpoint
- Invalid/expired refresh token.
- Regenerate via helper script and update `.env`.

### Rows not added to sheet
- Service account email not shared on sheet.
- Wrong `GOOGLE_SHEET_ID` or tab name.

### `CellNotFound` then no append
- Usually worksheet permission or API quota issue. Check logs in `sync.log`.

### No webhook events arriving
- Callback URL not public HTTPS.
- Old subscription pointing to outdated URL.
- Confirm with Strava push subscription listing endpoint.

---

## 11) Maintenance notes

- Keep dependencies updated periodically.
- Rotate service account keys per your security policy.
- Backup `state.db` if you need historical event processing records.
- If migrating hosts, recreate Strava webhook subscription with new callback URL.
