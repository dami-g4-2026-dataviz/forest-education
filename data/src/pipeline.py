"""
Silent Forest data pipeline.

Reads raw/education.csv, validates every row against the Pydantic model,
and writes output/education.json for consumption by the Next.js frontend.
"""

import json
from pathlib import Path

from .transforms import load_and_validate

ROOT = Path(__file__).resolve().parent.parent
RAW_CSV = ROOT / "raw" / "education.csv"
OUTPUT_JSON = ROOT / "output" / "education.json"


def main() -> None:
    countries = load_and_validate(str(RAW_CSV))

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    payload = [c.to_frontend_dict() for c in countries]

    OUTPUT_JSON.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(payload)} countries to {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
