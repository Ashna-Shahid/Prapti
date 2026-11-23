
from typing import Any


def normalise(value: Any) -> str:
    return str(value).strip().lower() if value is not None else ""


def check_eligibility(profile: dict, scheme: dict) -> dict:

    criteria = scheme.get("eligibility", {})

    matched = []
    failed = []
    missing = []

    # 1. State
    required_states = criteria.get("states", [])
    user_state = normalise(profile.get("state"))

    if required_states:
        if not user_state:
            missing.append("State")
        elif user_state in [normalise(s) for s in required_states]:
            matched.append("State requirement satisfied")
        else:
            failed.append("Scheme is not available in your state")

    # 2. Age
    age = profile.get("age")
    min_age = criteria.get("min_age")
    max_age = criteria.get("max_age")

    if min_age is not None or max_age is not None:
        if age is None:
            missing.append("Age")
        elif min_age is not None and age < min_age:
            failed.append(f"Minimum age required: {min_age}")
        elif max_age is not None and age > max_age:
            failed.append(f"Maximum age allowed: {max_age}")
        else:
            matched.append("Age requirement satisfied")

    # 3. Income
    income = profile.get("annual_family_income")
    max_income = criteria.get("max_income")

    if max_income is not None:
        if income is None:
            missing.append("Annual family income")
        elif income > max_income:
            failed.append(
                f"Income exceeds maximum limit of ₹{max_income:,.0f}"
            )
        else:
            matched.append("Income requirement satisfied")

    # 4. Education
    required_education = criteria.get("education_levels", [])
    education = normalise(profile.get("education_level"))

    if required_education:
        if not education:
            missing.append("Education level")
        elif education in [normalise(x) for x in required_education]:
            matched.append("Education requirement satisfied")
        else:
            failed.append("Education level does not match")

    # 5. Course
    required_courses = criteria.get("courses", [])
    course = normalise(profile.get("course"))

    if required_courses:
        if not course:
            missing.append("Course")
        elif course in [normalise(x) for x in required_courses]:
            matched.append("Course requirement satisfied")
        else:
            failed.append("Course does not match scheme criteria")

    # 6. Category
    required_categories = criteria.get("categories", [])
    category = normalise(profile.get("category"))

    if required_categories:
        if not category:
            missing.append("Category")
        elif category in [normalise(x) for x in required_categories]:
            matched.append("Category requirement satisfied")
        else:
            failed.append("Category requirement does not match")

    # 7. Class 12 percentile
    min_percentile = criteria.get("min_class12_percentile")
    percentile = profile.get("class12_percentile")

    if min_percentile is not None:
        if percentile is None:
            missing.append("Class 12 board percentile")
        elif percentile <= min_percentile:
            failed.append(
                f"Class 12 percentile must be above {min_percentile}"
            )
        else:
            matched.append("Class 12 percentile requirement satisfied")

    # 8. Regular course
    if criteria.get("regular_course_only"):
        course_mode = normalise(profile.get("course_mode"))

        if not course_mode:
            missing.append("Course mode (regular or distance)")
        elif course_mode == "regular":
            matched.append("Regular course requirement satisfied")
        elif course_mode in ["distance", "online"]:
            failed.append("Distance/online courses are not accepted")
        else:
            missing.append("Valid course mode")

    # 9. Other scholarship
    if criteria.get("no_other_scholarship"):
        receiving = profile.get("receiving_other_scholarship")

        if receiving is None:
            missing.append("Whether you receive another scholarship")
        elif receiving:
            failed.append("Receiving another scholarship is not permitted")
        else:
            matched.append("Other scholarship restriction satisfied")

    # 10. Gap after Class 12
    if criteria.get("no_gap_after_class12"):
        gap = profile.get("gap_after_class12")

        if gap is None:
            missing.append("Whether you had a gap after Class 12")
        elif gap:
            failed.append("A gap after Class 12 is not permitted")
        else:
            matched.append("Study continuity requirement satisfied")

    # 11. Female student requirement
    if criteria.get("requires_female_student"):
        gender = normalise(profile.get("gender"))

        if not gender:
            missing.append("Gender")
        elif gender in ["female", "woman", "girl"]:
            matched.append("Gender requirement satisfied")
        else:
            failed.append("This scheme is restricted to girl students")

    # 12. Disability percentage
    min_disability = criteria.get("minimum_disability_percent")

    if min_disability is not None:
        disability = profile.get("disability_percentage")

        if disability is None:
            missing.append("Disability percentage")
        elif disability < min_disability:
            failed.append(
                f"Minimum disability percentage required: {min_disability}%"
            )
        else:
            matched.append("Disability requirement satisfied")

    # 13. Swanath qualifying category
    required_statuses = criteria.get("swanath_qualifying_statuses", [])

    if required_statuses:
        qualifying_status = normalise(
            profile.get("swanath_qualifying_status")
        )

        if not qualifying_status:
            missing.append("Swanath qualifying category")
        elif qualifying_status in [
            normalise(x) for x in required_statuses
        ]:
            matched.append("Swanath qualifying category satisfied")
        else:
            failed.append("Swanath qualifying category does not match")

    # 14. AICTE-approved institution
    if criteria.get("aicte_approved_institution_only"):
        approved = profile.get("aicte_approved_institution")

        if approved is None:
            missing.append("AICTE institution approval")
        elif approved:
            matched.append("Institution approval requirement satisfied")
        else:
            failed.append("Institution must be AICTE-approved")

    # 15. Admission entry type
    if criteria.get("first_or_lateral_entry_only"):
        entry = normalise(profile.get("admission_entry_type"))

        if not entry:
            missing.append("Admission entry type")
        elif entry in ["first", "lateral"]:
            matched.append("Admission entry requirement satisfied")
        else:
            failed.append(
                "Only first-year or lateral-entry admission is accepted"
            )

    # 16. Family girl-child limit
    max_children = criteria.get("maximum_girl_children_per_family")

    if max_children is not None:
        count = profile.get("girl_children_count_in_family")

        if count is None:
            missing.append("Number of girl children in family")
        elif count > max_children:
            failed.append(
                f"Maximum permitted girl children in family: {max_children}"
            )
        else:
            matched.append("Family girl-child limit satisfied")

    # Final decision
    if failed:
        status = "probably_not_eligible"
    elif missing:
        status = "more_information_required"
    else:
        status = "likely_eligible"

    return {
        "scheme_id": scheme.get("id"),
        "scheme_name": scheme.get("name"),
        "status": status,
        "matched_criteria": matched,
        "failed_criteria": failed,
        "missing_information": missing,
        "explanation": generate_explanation(
            status, matched, failed, missing
        ),
        "disclaimer": (
            "This is a preliminary assessment, not an official "
            "eligibility confirmation. Final approval depends on "
            "the scheme authority."
        )
    }


def generate_explanation(status, matched, failed, missing):

    if status == "likely_eligible":
        return (
            "You appear to meet all eligibility criteria "
            "currently recorded for this scheme."
        )

    if status == "probably_not_eligible":
        return "You may not qualify because: " + "; ".join(failed)

    return (
        "More information is needed to assess your eligibility: "
        + ", ".join(missing)
    )


def match_schemes(profile: dict, schemes: list) -> dict:

    verified_schemes = [
        scheme for scheme in schemes
        if scheme.get("verification_status") == "verified"
    ]

    results = [
        check_eligibility(profile, scheme)
        for scheme in verified_schemes
    ]

    return {
        "total_schemes_checked": len(results),
        "likely_eligible": [
            r for r in results
            if r["status"] == "likely_eligible"
        ],
        "more_information_required": [
            r for r in results
            if r["status"] == "more_information_required"
        ],
        "probably_not_eligible": [
            r for r in results
            if r["status"] == "probably_not_eligible"
        ]
    }
