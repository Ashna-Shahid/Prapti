
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

# AI provider is optional.
# If no API key is configured, local extraction is used.

def extract_profile(user_text: str) -> dict:
    """
    Extract profile information from natural-language input.
    Never invent missing information.
    """

    profile = {
        "name": None,
        "age": None,
        "state": None,
        "city": None,
        "education_level": None,
        "course": None,
        "study_year": None,
        "annual_family_income": None,
        "category": None
    }

    text = user_text.lower()

    # Location extraction
    locations = {
        "delhi": ("Delhi", "Delhi"),
        "mumbai": ("Mumbai", "Maharashtra"),
        "bangalore": ("Bengaluru", "Karnataka"),
        "bengaluru": ("Bengaluru", "Karnataka"),
        "chennai": ("Chennai", "Tamil Nadu"),
        "kolkata": ("Kolkata", "West Bengal"),
        "hyderabad": ("Hyderabad", "Telangana"),
        "jaipur": ("Jaipur", "Rajasthan"),
        "lucknow": ("Lucknow", "Uttar Pradesh")
    }

    for city, (city_name, state_name) in locations.items():
        if city in text:
            profile["city"] = city_name
            profile["state"] = state_name
            break

    # Age extraction
    age_match = re.search(r"\b(\d{1,2})\s*(?:years old|year old|yrs old|yo)\b", text)
    if age_match:
        profile["age"] = int(age_match.group(1))

    # Income extraction
    income_match = re.search(
        r"(?:income|earn|family income)[^\d₹]{0,20}₹?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|k)?",
        text
    )

    if income_match:
        amount = float(income_match.group(1))
        unit = income_match.group(2)

        if unit in ("lakh", "lac"):
            amount *= 100000
        elif unit == "k":
            amount *= 1000

        profile["annual_family_income"] = amount

    # Education extraction
    if any(word in text for word in ["undergraduate", "btech", "b.tech", "bachelor"]):
        profile["education_level"] = "undergraduate"
    elif any(word in text for word in ["postgraduate", "master", "mtech", "m.tech"]):
        profile["education_level"] = "postgraduate"
    elif any(word in text for word in ["class 12", "12th", "senior secondary"]):
        profile["education_level"] = "school"

    # Course extraction
    courses = {
        "btech": "BTech",
        "b.tech": "BTech",
        "engineering": "Engineering",
        "bca": "BCA",
        "bsc": "BSc",
        "mbbs": "MBBS",
        "mba": "MBA",
        "mtech": "MTech"
    }

    for keyword, course in courses.items():
        if keyword in text:
            profile["course"] = course
            break

    # Study year
    year_match = re.search(r"(?:first|1st|second|2nd|third|3rd|fourth|4th)\s+year", text)

    if year_match:
        year_text = year_match.group(0)
        year_map = {
            "first": 1, "1st": 1,
            "second": 2, "2nd": 2,
            "third": 3, "3rd": 3,
            "fourth": 4, "4th": 4
        }

        for key, value in year_map.items():
            if key in year_text:
                profile["study_year"] = value
                break

    return profile


def explain_eligibility(result: dict) -> str:
    """
    Generate a readable explanation using actual
    eligibility engine results.
    """

    status = result.get("status")
    matched = result.get("matched_criteria", [])
    failed = result.get("failed_criteria", [])
    missing = result.get("missing_information", [])

    if status == "likely_eligible":
        return (
            "You appear to meet the recorded eligibility "
            "requirements. Final approval depends on the "
            "official scheme authority."
        )

    if status == "probably_not_eligible":
        return (
            "You may not qualify because: "
            + "; ".join(failed)
        )

    return (
        "We need a little more information: "
        + ", ".join(missing)
    )


def get_missing_fields(profile: dict) -> list:
    """
    Identify important profile fields that are missing.
    """

    important_fields = {
        "state": "Which state do you live in?",
        "education_level": "What is your current education level?",
        "annual_family_income": "What is your annual family income?"
    }

    missing_questions = []

    for field, question in important_fields.items():
        if profile.get(field) is None:
            missing_questions.append({
                "field": field,
                "question": question
            })

    return missing_questions
