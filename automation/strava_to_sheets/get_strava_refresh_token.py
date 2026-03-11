"""One-time helper to get Strava refresh token.

Usage:
1) Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in env.
2) Run this script and open printed authorization URL.
3) Approve app and paste `code` query param.
"""

from __future__ import annotations

import os
import urllib.parse

import httpx

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID", "")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET", "")
REDIRECT_URI = os.getenv("STRAVA_REDIRECT_URI", "http://localhost/exchange_token")

if not STRAVA_CLIENT_ID or not STRAVA_CLIENT_SECRET:
    raise SystemExit("Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET first.")

params = {
    "client_id": STRAVA_CLIENT_ID,
    "redirect_uri": REDIRECT_URI,
    "response_type": "code",
    "approval_prompt": "force",
    "scope": "activity:read_all",
}
authorize_url = f"https://www.strava.com/oauth/authorize?{urllib.parse.urlencode(params)}"
print("Open this URL and authorize:\n")
print(authorize_url)

code = input("\nPaste the `code` query parameter from redirected URL: ").strip()

payload = {
    "client_id": STRAVA_CLIENT_ID,
    "client_secret": STRAVA_CLIENT_SECRET,
    "code": code,
    "grant_type": "authorization_code",
}

resp = httpx.post("https://www.strava.com/oauth/token", data=payload, timeout=30)
resp.raise_for_status()
data = resp.json()
print("\nSave these values:")
print(f"STRAVA_REFRESH_TOKEN={data.get('refresh_token')}")
print(f"(Access token expires at: {data.get('expires_at')})")
