from typing import Literal

from pydantic import BaseModel, Field

Region = Literal[
    "Sub-Saharan Africa",
    "South Asia",
    "East Asia & Pacific",
    "Europe & Central Asia",
    "Latin America & Caribbean",
    "Middle East & North Africa",
    "North America",
]


class CountryData(BaseModel):
    code: str = Field(min_length=3, max_length=3)
    name: str
    region: Region
    years_in_school: float = Field(alias="yearsInSchool", gt=0, le=20)
    lays: float = Field(gt=0, le=20)
    learning_poverty: float = Field(alias="learningPoverty", ge=0, le=100)
    enrollment_rate: float = Field(alias="enrollmentRate", ge=0, le=100)
    gpi_primary: float = Field(alias="gpiPrimary", gt=0)
    spending_pct_gdp: float = Field(alias="spendingPctGDP", ge=0)

    model_config = {"populate_by_name": True}

    def to_frontend_dict(self) -> dict:
        """Serialize using camelCase keys expected by the Next.js frontend."""
        return {
            "code": self.code,
            "name": self.name,
            "region": self.region,
            "yearsInSchool": self.years_in_school,
            "lays": self.lays,
            "learningPoverty": self.learning_poverty,
            "enrollmentRate": self.enrollment_rate,
            "gpiPrimary": self.gpi_primary,
            "spendingPctGDP": self.spending_pct_gdp,
        }
