# Local Retirement Planner (Australia)

Desktop-first local web dashboard to model superannuation for two people and a combined household retirement view.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Recharts
- localStorage persistence
- Vitest unit tests

## Features
- Two person super input model
- Combined household retirement drawdown sufficiency
- Three editable scenarios: optimistic/base/pessimistic
- Annual projection engine with:
  - employer contribution cap ($30,000)
  - concessional cap warning (editable cap)
  - 15% concessional contribution tax
  - 15% earnings tax when earnings are positive
  - annual % fee and fixed fee
- Tabs:
  - Overview
  - Inputs
  - Contributions
  - Projection
  - Retirement Sufficiency
  - Scenarios
  - Charts
  - Data Table
  - Assumptions
  - Profiles / Save Load
- Profiles in localStorage:
  - create, duplicate, rename, delete
  - export JSON, import JSON

## Run locally
```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Test
```bash
npm test
```

## Build
```bash
npm run build
npm run preview
```

## Notes
- This is a personal-use planner, no backend and no cloud sync.
- Outputs are nominal dollars.
- Excludes Age Pension, non-super assets, property, spouse contribution splitting, and pension phase tax modelling.
