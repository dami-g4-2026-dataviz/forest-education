import pandas as pd

from .models import CountryData


def load_and_validate(csv_path: str) -> list[CountryData]:
    """Read the raw CSV and return a list of validated CountryData models."""
    df = pd.read_csv(csv_path)

    required = [
        "code", "name", "region", "yearsInSchool", "lays",
        "learningPoverty", "enrollmentRate", "gpiPrimary", "spendingPctGDP",
    ]
    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns in CSV: {missing}")

    countries: list[CountryData] = []
    for idx, row in df.iterrows():
        try:
            country = CountryData(**row.to_dict())
            countries.append(country)
        except Exception as exc:
            raise ValueError(f"Row {idx} ({row.get('code', '?')}): {exc}") from exc

    return countries
