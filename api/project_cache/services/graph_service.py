import os
from dotenv import load_dotenv
import requests
from msal import ConfidentialClientApplication

import json
from dotenv import load_dotenv
from urllib.parse import quote

load_dotenv()


TENANT_ID = os.getenv("AZURE_TENANT_ID")
CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")

TEAMS_APP_ID = os.getenv("TEAMS_APP_ID")
ANGULAR_APP_URL = os.getenv("ANGULAR_APP_URL")

# TENANT_ID = os.getenv("d21da106-c49f-4232-beb2-392b49819418")
# CLIENT_ID = os.getenv("fb2b3471-e81a-4a45-94e1-9acafa5fee05")
# CLIENT_SECRET = os.getenv("bb0ea09b-840d-496c-8dbd-e3bfd7a3e55c")
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["https://graph.microsoft.com/.default"]

app = ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)

def get_token():
    """Acquire Microsoft Graph token"""
    result = app.acquire_token_silent(SCOPE, account=None)
    if not result:
        result = app.acquire_token_for_client(scopes=SCOPE)
    if "access_token" not in result:
        raise Exception(f"Failed to acquire token: {result}")
    return result["access_token"]

def get_teams_deep_link(angular_url: str, title: str = "Mood Metrics") -> str:
    """Create a Teams deep link to open Angular app in Teams tab"""
    encoded_url = quote(angular_url, safe="")
    return f"https://teams.microsoft.com/l/task/{TEAMS_APP_ID}?url={encoded_url}&title={quote(title)}&webUrl={encoded_url}"

def create_chat(user_email: str) -> str:
    """Create or get a 1:1 chat between the app and a user"""
    token = get_token()
    url = "https://graph.microsoft.com/v1.0/chats"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "chatType": "oneOnOne",
        "members": [
            {
                "@odata.type": "#microsoft.graph.aadUserConversationMember",
                "roles": ["owner"],
                "user@odata.bind": f"https://graph.microsoft.com/v1.0/users('{CLIENT_ID}')"
            },
            {
                "@odata.type": "#microsoft.graph.aadUserConversationMember",
                "roles": ["owner"],
                "user@odata.bind": f"https://graph.microsoft.com/v1.0/users('{user_email}')"
            }
        ]
    }
    resp = requests.post(url, headers=headers, json=payload)
    resp.raise_for_status()
    chat_id = resp.json().get("id")
    return chat_id

def send_teams_mood_notification(user_email: str):
    """Send an Adaptive Card notification to a user in Teams"""
    token = get_token()
    chat_id = create_chat(user_email)
    url_msg = f"https://graph.microsoft.com/v1.0/chats/{chat_id}/messages"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    teams_link = get_teams_deep_link(ANGULAR_APP_URL)

    adaptive_card = {
        "body": [
            {
                "type": "message",
                "attachments": [
                    {
                        "contentType": "application/vnd.microsoft.card.adaptive",
                        "content": {
                            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                            "type": "AdaptiveCard",
                            "version": "1.4",
                            "body": [
                                {"type": "TextBlock",
                                 "text": "HR requested you to update your Mood Metrics",
                                 "wrap": True},
                                {"type": "ActionSet",
                                 "actions": [
                                     {"type": "Action.OpenUrl",
                                      "title": "Update Mood Metrics",
                                      "url": teams_link}
                                 ]}
                            ]
                        }
                    }
                ]
            }
        ]
    }
    resp = requests.post(url_msg, headers=headers, json=adaptive_card)
    resp.raise_for_status()
    print(f"Sent Teams notification to {user_email}")

def trigger_mood_notifications(employee_emails: list[str]):
    """Send mood metrics notification to a list of employees"""
    for email in employee_emails:
        try:
            send_teams_mood_notification(email)
        except Exception as e:
            print(f"Failed to send notification to {email}: {str(e)}")