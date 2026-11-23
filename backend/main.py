
import json
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    UserProfile,
    ApplicationCreate,
    ApplicationUpdate,
    ChecklistItem
)
from eligibility import match_schemes
from ai_service import extract_profile
from languages import LANGUAGES


# ---------------------------------
# APP SETUP
# ---------------------------------

app = FastAPI(
    title="PRAPTI API",
    description="Government Scheme Discovery and Eligibility Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------
# FILE STORAGE
# ---------------------------------

BASE_DIR = Path(__file__).resolve().parent

SCHEMES_FILE = BASE_DIR / "schemes.json"
APPLICATIONS_FILE = BASE_DIR / "applications.json"
CHECKLIST_FILE = BASE_DIR / "checklists.json"
PROFILES_FILE = BASE_DIR / "profiles.json"


def load_json(file_path, default):
    if not file_path.exists():
        return default

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return default


def save_json(file_path, data):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4, ensure_ascii=False)


def load_schemes():
    return load_json(SCHEMES_FILE, [])


# ---------------------------------
# HOME AND HEALTH
# ---------------------------------

@app.get("/")
def home():
    return {
        "success": True,
        "message": "Welcome to PRAPTI API",
        "docs": "/docs"
    }


@app.get("/api/health")
def health():
    return {
        "success": True,
        "message": "PRAPTI backend is running"
    }


# ---------------------------------
# LANGUAGES
# ---------------------------------

@app.get("/api/languages")
def get_languages():
    return {
        "success": True,
        "total": len(LANGUAGES),
        "languages": LANGUAGES
    }


@app.post("/api/language")
def set_language(language_code: str):
    valid_codes = [item["code"] for item in LANGUAGES]

    if language_code not in valid_codes:
        raise HTTPException(
            status_code=400,
            detail="Unsupported language"
        )

    return {
        "success": True,
        "preferred_language": language_code
    }


# ---------------------------------
# USER PROFILE
# ---------------------------------

@app.post("/api/profile")
def save_profile(profile: UserProfile):
    profiles = load_json(PROFILES_FILE, [])

    profile_data = profile.model_dump()

    profiles.append(profile_data)
    save_json(PROFILES_FILE, profiles)

    return {
        "success": True,
        "message": "Profile saved successfully",
        "profile": profile_data
    }


@app.get("/api/profile")
def get_profiles():
    return {
        "success": True,
        "profiles": load_json(PROFILES_FILE, [])
    }


@app.post("/api/profile/extract")
def extract_user_profile(payload: dict):
    user_text = payload.get("text", "")

    if not user_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Please provide profile text"
        )

    extracted = extract_profile(user_text)

    return {
        "success": True,
        "profile": extracted
    }


# ---------------------------------
# SCHEMES
# ---------------------------------

@app.get("/api/schemes")
def get_schemes():
    schemes = [
        scheme for scheme in load_schemes()
        if scheme.get("verification_status") == "verified"
    ]

    return {
        "success": True,
        "total": len(schemes),
        "schemes": schemes
    }


@app.get("/api/schemes/{scheme_id}")
def get_scheme(scheme_id: str):
    scheme = next(
        (
            item for item in load_schemes()
            if item.get("id") == scheme_id
            and item.get("verification_status") == "verified"
        ),
        None
    )

    if not scheme:
        raise HTTPException(
            status_code=404,
            detail="Verified scheme not found"
        )

    return {
        "success": True,
        "scheme": scheme
    }


# ---------------------------------
# SCHEME MATCHING
# ---------------------------------

@app.post("/api/schemes/match")
def match_user_schemes(profile: UserProfile):
    profile_data = profile.model_dump()

    schemes = [
        scheme for scheme in load_schemes()
        if scheme.get("verification_status") == "verified"
    ]

    results = match_schemes(profile_data, schemes)

    return {
        "success": True,
        "results": results,
        "disclaimer": (
            "This is a preliminary assessment only. "
            "Final eligibility is determined by the official authority."
        )
    }


# ---------------------------------
# DOCUMENT CHECKLIST
# ---------------------------------

@app.get("/api/checklist/{scheme_id}")
def get_checklist(scheme_id: str):
    scheme = next(
        (
            item for item in load_schemes()
            if item.get("id") == scheme_id
            and item.get("verification_status") == "verified"
        ),
        None
    )

    if not scheme:
        raise HTTPException(
            status_code=404,
            detail="Verified scheme not found"
        )

    checklists = load_json(CHECKLIST_FILE, {})

    if scheme_id not in checklists:
        checklists[scheme_id] = [
            {
                "document": document,
                "completed": False
            }
            for document in scheme.get("documents", [])
        ]

        save_json(CHECKLIST_FILE, checklists)

    return {
        "success": True,
        "checklist": checklists[scheme_id]
    }


@app.put("/api/checklist/{scheme_id}")
def update_checklist(
    scheme_id: str,
    items: List[ChecklistItem]
):
    scheme = next(
        (
            item for item in load_schemes()
            if item.get("id") == scheme_id
            and item.get("verification_status") == "verified"
        ),
        None
    )

    if not scheme:
        raise HTTPException(
            status_code=404,
            detail="Verified scheme not found"
        )

    allowed_documents = set(scheme.get("documents", []))

    if any(item.document not in allowed_documents for item in items):
        raise HTTPException(
            status_code=400,
            detail="Unknown document in checklist"
        )

    checklists = load_json(CHECKLIST_FILE, {})

    checklists[scheme_id] = [
        item.model_dump() for item in items
    ]

    save_json(CHECKLIST_FILE, checklists)

    return {
        "success": True,
        "message": "Checklist updated",
        "checklist": checklists[scheme_id]
    }


# ---------------------------------
# APPLICATION TRACKER
# ---------------------------------

@app.post("/api/applications")
def create_application(application: ApplicationCreate):
    schemes = load_schemes()

    scheme = next(
        (
            item for item in schemes
            if item.get("id") == application.scheme_id
            and item.get("verification_status") == "verified"
        ),
        None
    )

    if not scheme:
        raise HTTPException(
            status_code=404,
            detail="Verified scheme not found"
        )

    applications = load_json(APPLICATIONS_FILE, [])

    new_id = max(
        [item.get("id", 0) for item in applications],
        default=0
    ) + 1

    record = {
        "id": new_id,
        "scheme_id": application.scheme_id,
        "scheme_name": scheme["name"],
        "status": application.status
    }

    applications.append(record)
    save_json(APPLICATIONS_FILE, applications)

    return {
        "success": True,
        "message": "Application added",
        "application": record
    }


@app.get("/api/applications")
def get_applications():
    return {
        "success": True,
        "applications": load_json(APPLICATIONS_FILE, [])
    }


@app.patch("/api/applications/{application_id}")
def update_application(
    application_id: int,
    update: ApplicationUpdate
):
    applications = load_json(APPLICATIONS_FILE, [])

    application = next(
        (
            item for item in applications
            if item.get("id") == application_id
        ),
        None
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application["status"] = update.status

    save_json(APPLICATIONS_FILE, applications)

    return {
        "success": True,
        "message": "Application updated",
        "application": application
    }


# ---------------------------------
# RUN SERVER
# ---------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
