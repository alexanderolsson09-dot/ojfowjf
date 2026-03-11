"""Strava -> Google Sheets webhook sync service.

Production-minded implementation using FastAPI:
- Strava webhook endpoint (verification + event ingestion)
- OAuth token refresh for Strava API
- Duplicate prevention with local SQLite state + Sheet upsert by Activity ID
- Structured logging and robust error handling
"""

from __future__ import annotations

import json
import logging
from logging.handlers import RotatingFileHandler
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import gspread
import httpx
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

# -------------------------------
# Config
# -------------------------------
load_dotenv()

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID", "")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET", "")
STRAVA_REFRESH_TOKEN = os.getenv("STRAVA_REFRESH_TOKEN", "")
STRAVA_VERIFY_TOKEN = os.getenv("STRAVA_VERIFY_TOKEN", "")

GOOGLE_SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "")
GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "")
GOOGLE_WORKSHEET_NAME = os.getenv("GOOGLE_WORKSHEET_NAME", "Activities")

SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "state.db")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
STRAVA_ACTIVITY_URL = "https://www.strava.com/api/v3/activities/{activity_id}"

SHEET_HEADERS = [
    "activity_id",
    "date",
    "activity_name",
    "sport_type",
    "distance_km",
    "moving_time_min",
    "elapsed_time_min",
    "average_speed_kmh",
    "max_speed_kmh",
    "elevation_gain_m",
    "avg_heart_rate",
    "max_heart_rate",
    "calories",
    "description",
    "gear_name",
    "gear_id",
    "athlete_id",
    "source",
    "last_synced_utc",
]


# -------------------------------
# Logging
# -------------------------------
def setup_logging() -> logging.Logger:
    logger = logging.getLogger("strava_sync")
    logger.setLevel(LOG_LEVEL.upper())

    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)

    file_handler = RotatingFileHandler("sync.log", maxBytes=2_000_000, backupCount=3)
    file_handler.setFormatter(formatter)

    logger.addHandler(stream_handler)
    logger.addHandler(file_handler)
    return logger


logger = setup_logging()


# -------------------------------
# Database helpers
# -------------------------------
@contextmanager
def db_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    with db_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS oauth_tokens (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                access_token TEXT NOT NULL,
                refresh_token TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS processed_events (
                event_id TEXT PRIMARY KEY,
                activity_id TEXT,
                aspect_type TEXT,
                processed_at TEXT NOT NULL,
                status TEXT NOT NULL,
                error_message TEXT
            )
            """
        )
        conn.commit()


def get_cached_token() -> Optional[sqlite3.Row]:
    with db_conn() as conn:
        return conn.execute("SELECT * FROM oauth_tokens WHERE id = 1").fetchone()


def save_token(access_token: str, refresh_token: str, expires_at: int) -> None:
    with db_conn() as conn:
        conn.execute(
            """
            INSERT INTO oauth_tokens (id, access_token, refresh_token, expires_at, updated_at)
            VALUES (1, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                access_token = excluded.access_token,
                refresh_token = excluded.refresh_token,
                expires_at = excluded.expires_at,
                updated_at = excluded.updated_at
            """,
            (
                access_token,
                refresh_token,
                expires_at,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()


def mark_event(event_id: str, activity_id: str, aspect_type: str, status: str, error: str = "") -> None:
    with db_conn() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO processed_events
            (event_id, activity_id, aspect_type, processed_at, status, error_message)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                event_id,
                activity_id,
                aspect_type,
                datetime.now(timezone.utc).isoformat(),
                status,
                error,
            ),
        )
        conn.commit()


def is_event_processed(event_id: str) -> bool:
    with db_conn() as conn:
        row = conn.execute(
            "SELECT event_id FROM processed_events WHERE event_id = ?",
            (event_id,),
        ).fetchone()
        return row is not None


# -------------------------------
# Strava API
# -------------------------------
def env_ready() -> bool:
    required = [
        STRAVA_CLIENT_ID,
        STRAVA_CLIENT_SECRET,
        STRAVA_REFRESH_TOKEN,
        STRAVA_VERIFY_TOKEN,
        GOOGLE_SERVICE_ACCOUNT_FILE,
        GOOGLE_SHEET_ID,
    ]
    return all(required)


async def refresh_access_token() -> str:
    """Refresh Strava access token and persist it."""
    payload = {
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": STRAVA_REFRESH_TOKEN,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(STRAVA_TOKEN_URL, data=payload)

    if response.status_code != 200:
        logger.error("Failed token refresh: %s", response.text)
        raise HTTPException(status_code=502, detail="Strava token refresh failed")

    data = response.json()
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]
    expires_at = int(data["expires_at"])

    save_token(access_token, refresh_token, expires_at)
    logger.info("Strava access token refreshed. Expires at %s", expires_at)
    return access_token


async def get_valid_access_token() -> str:
    """Return cached token if valid, otherwise refresh."""
    cached = get_cached_token()
    now_ts = int(datetime.now(timezone.utc).timestamp())

    if cached and int(cached["expires_at"]) > now_ts + 60:
        return str(cached["access_token"])

    return await refresh_access_token()


async def get_activity(activity_id: int) -> Dict[str, Any]:
    token = await get_valid_access_token()

    url = STRAVA_ACTIVITY_URL.format(activity_id=activity_id)
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=headers)

    if response.status_code == 401:
        logger.warning("Token expired unexpectedly, retrying after refresh")
        token = await refresh_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(url, headers=headers)

    if response.status_code != 200:
        logger.error("Failed to fetch activity %s: %s", activity_id, response.text)
        raise HTTPException(status_code=502, detail="Failed to fetch Strava activity")

    return response.json()


# -------------------------------
# Google Sheets helpers
# -------------------------------
def get_worksheet():
    gc = gspread.service_account(filename=GOOGLE_SERVICE_ACCOUNT_FILE)
    sheet = gc.open_by_key(GOOGLE_SHEET_ID)
    worksheet = sheet.worksheet(GOOGLE_WORKSHEET_NAME)
    return worksheet


def ensure_headers() -> None:
    ws = get_worksheet()
    first_row = ws.row_values(1)
    if first_row != SHEET_HEADERS:
        ws.update("A1:S1", [SHEET_HEADERS])
        logger.info("Headers updated in worksheet '%s'", GOOGLE_WORKSHEET_NAME)


def build_row(activity: Dict[str, Any]) -> List[Any]:
    gear_name = ""
    if activity.get("gear") and isinstance(activity["gear"], dict):
        gear_name = activity["gear"].get("name", "")

    return [
        activity.get("id", ""),
        activity.get("start_date_local", ""),
        activity.get("name", ""),
        activity.get("sport_type", ""),
        round(float(activity.get("distance", 0)) / 1000, 3),
        round(float(activity.get("moving_time", 0)) / 60, 2),
        round(float(activity.get("elapsed_time", 0)) / 60, 2),
        round(float(activity.get("average_speed", 0)) * 3.6, 3),
        round(float(activity.get("max_speed", 0)) * 3.6, 3),
        round(float(activity.get("total_elevation_gain", 0)), 1),
        activity.get("average_heartrate", ""),
        activity.get("max_heartrate", ""),
        activity.get("calories", ""),
        activity.get("description", ""),
        gear_name,
        activity.get("gear_id", ""),
        activity.get("athlete", {}).get("id", ""),
        "strava_webhook",
        datetime.now(timezone.utc).isoformat(),
    ]


def upsert_activity_to_sheet(activity: Dict[str, Any]) -> str:
    """Insert if missing, otherwise update row by activity_id.

    Returns: "inserted" or "updated"
    """
    ws = get_worksheet()
    ensure_headers()

    activity_id = str(activity.get("id", ""))
    row_data = build_row(activity)

    try:
        cell = ws.find(activity_id, in_column=1)
    except gspread.exceptions.CellNotFound:
        cell = None

    if cell:
        ws.update(f"A{cell.row}:S{cell.row}", [row_data])
        return "updated"

    ws.append_row(row_data, value_input_option="USER_ENTERED")
    return "inserted"


# -------------------------------
# Webhook processing
# -------------------------------
async def process_webhook_event(payload: Dict[str, Any]) -> None:
    event_id = str(payload.get("event_id", ""))
    aspect_type = payload.get("aspect_type", "")
    object_type = payload.get("object_type", "")
    activity_id = str(payload.get("object_id", ""))

    if not event_id:
        logger.warning("Ignoring payload without event_id: %s", payload)
        return

    if is_event_processed(event_id):
        logger.info("Skipping duplicate event_id=%s", event_id)
        return

    if object_type != "activity":
        logger.info("Ignoring non-activity event_id=%s object_type=%s", event_id, object_type)
        mark_event(event_id, activity_id, aspect_type, "ignored", "non-activity")
        return

    if aspect_type == "delete":
        mark_event(event_id, activity_id, aspect_type, "ignored", "delete-event")
        logger.info("Ignoring delete event for activity_id=%s", activity_id)
        return

    try:
        activity = await get_activity(int(activity_id))
        mode = upsert_activity_to_sheet(activity)
        mark_event(event_id, activity_id, aspect_type, mode)
        logger.info(
            "Activity sync successful event_id=%s activity_id=%s mode=%s",
            event_id,
            activity_id,
            mode,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed processing event_id=%s: %s", event_id, exc)
        mark_event(event_id, activity_id, aspect_type, "failed", str(exc))


# -------------------------------
# FastAPI app
# -------------------------------
app = FastAPI(title="Strava to Google Sheets Sync", version="1.0.0")


@app.on_event("startup")
async def on_startup() -> None:
    init_db()
    if not env_ready():
        logger.warning("Environment variables are not fully configured.")
    else:
        logger.info("Service startup complete.")


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}


@app.get("/strava/webhook")
async def strava_webhook_verify(request: Request):
    """Strava subscription verification endpoint."""
    params = dict(request.query_params)
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == STRAVA_VERIFY_TOKEN:
        return JSONResponse({"hub.challenge": challenge})

    raise HTTPException(status_code=403, detail="Invalid verify token")


@app.post("/strava/webhook")
async def strava_webhook_event(request: Request, background_tasks: BackgroundTasks):
    """Receive events and process asynchronously."""
    payload = await request.json()
    logger.info("Received event payload: %s", json.dumps(payload))
    background_tasks.add_task(process_webhook_event, payload)
    return JSONResponse({"status": "accepted"}, status_code=200)
