# The Silent Forest

A data story visualizing **SDG 4 (Quality Education)**. Every tree in this forest represents a country — its trunk height encodes years in school, and its canopy density encodes how much children actually learn.

## Project Structure

```
silent-forest/
├── data/           Python data pipeline
│   ├── raw/        Source CSV data
│   ├── src/        Pipeline code (Pydantic models, transforms)
│   └── output/     Generated education.json consumed by the frontend
└── web/            Next.js App Router frontend
    ├── app/        Pages and layouts
    ├── components/ Forest visualization + shadcn/ui
    └── lib/        Types, constants, utilities
```

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **pnpm** — install with `npm install -g pnpm` if you don't have it

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Leonardo-Notargiacomo/silent-forest.git
cd silent-forest
```

### 2. Run the data pipeline

```bash
cd data
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r <(echo "pandas\npydantic")  # or: pip install pandas pydantic
python -m src.pipeline
```

This reads `raw/education.csv`, validates every row with Pydantic, and writes `output/education.json`.

### 3. Run the frontend

```bash
cd web
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
cd web
pnpm build
pnpm start
```

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Data pipeline  | Python 3.11+, pandas, Pydantic          |
| Frontend       | Next.js 16 (App Router), React 19       |
| Styling        | Tailwind CSS 4, shadcn/ui (new-york)    |
| Animation      | Framer Motion                           |
| Icons          | Lucide React                            |

## Data Sources

- [World Bank Human Capital Index](https://www.worldbank.org/en/publication/human-capital)
- [UNESCO UIS](https://uis.unesco.org/)
- [World Bank Learning Poverty](https://www.worldbank.org/en/topic/education/brief/learning-poverty)

## Contributing

Contributions are welcome! Whether it's fixing a bug, improving the visualization, adding new data, or refining the narrative — every bit helps.

### How to contribute

1. **Fork** the repository
2. **Create a branch** for your change:
   ```bash
   git checkout -b feat/your-feature
   ```
3. **Make your changes** — see the sections below for area-specific guidance
4. **Test locally** — make sure the pipeline runs and the frontend builds:
   ```bash
   cd data && python -m src.pipeline
   cd ../web && pnpm build
   ```
5. **Commit** with a clear message describing what and why
6. **Open a Pull Request** against `master`

### Areas you can help with

- **Data** — Add more countries, update metrics with newer sources, add new indicators to the CSV and pipeline
- **Visualization** — Improve the tree rendering, add new interaction modes, enhance mobile responsiveness
- **Narrative** — Refine chapter text, add new story chapters, improve accessibility
- **Infrastructure** — CI/CD, testing, performance, documentation

### Code style

- **Python** — follow PEP 8; Pydantic models for all data structures
- **TypeScript** — strict mode; prefer `"use client"` only where hooks or browser APIs are needed
- **CSS** — use Tailwind utilities; custom CSS goes in `globals.css`
- **Commits** — concise messages focused on the "why" (e.g. `fix: correct canopy scaling for edge cases`)

### Adding or updating education data

1. Edit `data/raw/education.csv` with the new or updated rows
2. Run the pipeline to validate: `cd data && python -m src.pipeline`
3. The pipeline will reject invalid rows (bad region names, out-of-range values, etc.)
4. Commit both the CSV and the regenerated `output/education.json`

## License

This project is open source. See the repository for license details.
