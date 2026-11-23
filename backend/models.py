
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import date


# ---------------------------------
# USER PROFILE
# ---------------------------------

class UserProfile(BaseModel):
    preferred_language: str = "en"

    name: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0, le=120)

    state: Optional[str] = None
    city: Optional[str] = None

    education_level: Optional[str] = None
    course: Optional[str] = None
    study_year: Optional[int] = None

    annual_family_income: Optional[float] = Field(default=None, ge=0)
    category: Optional[str] = None

    class12_percentile: Optional[float] = Field(
        default=None, ge=0, le=100
    )

    course_mode: Optional[str] = None
    receiving_other_scholarship: Optional[bool] = None
    gap_after_class12: Optional[bool] = None

    # AICTE eligibility information
    gender: Optional[str] = None
    disability_percentage: Optional[float] = Field(
        default=None, ge=0, le=100
    )
    aicte_approved_institution: Optional[bool] = None
    admission_entry_type: Optional[str] = None

    # Swanath eligibility information
    swanath_qualifying_status: Optional[str] = None

    # Pragati eligibility information
    girl_children_count_in_family: Optional[int] = Field(
        default=None, ge=0
    )


# ---------------------------------
# GOVERNMENT SCHEME
# ---------------------------------

class EligibilityCriteria(BaseModel):
    states: List[str] = Field(default_factory=list)

    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_income: Optional[float] = None

    education_levels: List[str] = Field(default_factory=list)
    courses: List[str] = Field(default_factory=list)
    categories: List[str] = Field(default_factory=list)

    min_class12_percentile: Optional[float] = None
    regular_course_only: bool = False
    no_other_scholarship: bool = False
    no_gap_after_class12: bool = False

    # AICTE-specific conditions
    requires_female_student: bool = False
    minimum_disability_percent: Optional[float] = None
    swanath_qualifying_statuses: List[str] = Field(
        default_factory=list
    )
    aicte_approved_institution_only: bool = False
    first_or_lateral_entry_only: bool = False
    maximum_girl_children_per_family: Optional[int] = None


class Scheme(BaseModel):
    id: str
    name: str
    authority: str
    description: str
    location: str

    official_url: Optional[str] = None
    application_url: Optional[str] = None

    deadline: Optional[date] = None

    verification_status: str
    last_verified: Optional[date] = None

    eligibility: EligibilityCriteria

    documents: List[str] = Field(default_factory=list)
    application_steps: List[str] = Field(default_factory=list)


# ---------------------------------
# ELIGIBILITY RESPONSE
# ---------------------------------

class EligibilityResult(BaseModel):
    scheme_id: str
    scheme_name: str

    status: Literal[
        "likely_eligible",
        "more_information_required",
        "probably_not_eligible"
    ]

    matched_criteria: List[str] = Field(default_factory=list)
    failed_criteria: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)

    explanation: str
    disclaimer: str


# ---------------------------------
# APPLICATION TRACKER
# ---------------------------------

class ApplicationCreate(BaseModel):
    scheme_id: str

    status: Literal[
        "Not Started",
        "Preparing Documents",
        "Ready to Apply",
        "Applied",
        "Awaiting Response",
        "Completed"
    ] = "Not Started"


class ApplicationUpdate(BaseModel):
    status: Literal[
        "Not Started",
        "Preparing Documents",
        "Ready to Apply",
        "Applied",
        "Awaiting Response",
        "Completed"
    ]


# ---------------------------------
# DOCUMENT CHECKLIST
# ---------------------------------

class ChecklistItem(BaseModel):
    document: str
    completed: bool = False


# ---------------------------------
# API RESPONSE
# ---------------------------------

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
