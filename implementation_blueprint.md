# Personal Retirement Planner (AU) — Implementation Blueprint (Stage 1)

## 1) Product architecture summary

### High-level architecture
A **local-only single-page application (SPA)** built with React + TypeScript + Vite. All data and configuration persist in `localStorage`; all modelling is computed in-browser using a deterministic calculation engine.

**Layers**
1. **Presentation/UI Layer**
   - Tabbed dashboard shell (desktop-first).
   - Form-driven inputs (people, household, scenarios, assumptions).
   - Tables and Recharts visualisations.
2. **State Layer**
   - Central app state via React Context + `useReducer` (or Zustand equivalent; recommended: Context+Reducer for zero extra deps).
   - Derived selectors for scenario comparisons and summary cards.
   - Debounced persistence adapter to `localStorage`.
3. **Domain/Calculation Engine Layer**
   - Pure functions for annual accumulation and drawdown simulation.
   - Scenario-driven projection runs.
   - Deterministic outputs to support snapshot/unit testing.
4. **Persistence Layer**
   - Versioned profile schemas persisted to `localStorage`.
   - CRUD for named profiles (save/load/delete/duplicate).

### Runtime model
- Recalculate projections on relevant state changes.
- Maintain one canonical input model and compute per-scenario outputs.
- Keep the combined household view as default landing context.

---

## 2) Recommended file and folder structure

```text
financial_planner/
  src/
    main.tsx
    App.tsx
    index.css

    app/
      AppShell.tsx
      routes.ts (if simple tab routing)
      tabs.ts (tab metadata)

    components/
      layout/
        DashboardLayout.tsx
        TabNav.tsx
      common/
        Card.tsx
        Field.tsx
        NumberInput.tsx
        CurrencyInput.tsx
        PercentInput.tsx
        InlineAlert.tsx
        ScenarioBadge.tsx
      charts/
        BalanceOverTimeChart.tsx
        ContributionsBreakdownChart.tsx
        ScenarioComparisonChart.tsx
        DrawdownChart.tsx
      tables/
        ProjectionTable.tsx
        ContributionsTable.tsx
        ScenarioSummaryTable.tsx

    features/
      overview/
        OverviewTab.tsx
      inputs/
        InputsTab.tsx
        PersonInputForm.tsx
        HouseholdInputForm.tsx
      contributions/
        ContributionsTab.tsx
      projection/
        ProjectionTab.tsx
      retirement/
        RetirementSufficiencyTab.tsx
      scenarios/
        ScenariosTab.tsx
        ScenarioEditor.tsx
      charts/
        ChartsTab.tsx
      data-table/
        DataTableTab.tsx
      assumptions/
        AssumptionsTab.tsx
      profiles/
        ProfilesTab.tsx

    domain/
      constants.ts
      types.ts
      validation.ts
      formatters.ts
      calculations/
        annualization.ts
        contributions.ts
        taxesFees.ts
        accumulation.ts
        drawdown.ts
        requiredLumpSum.ts
        scenarioRunner.ts
        selectors.ts

    state/
      appState.ts
      appReducer.ts
      appActions.ts
      appSelectors.ts
      AppStateProvider.tsx

    persistence/
      storageKeys.ts
      profileStorage.ts
      migrations.ts

    test/
      fixtures/
        baseProfile.ts
        scenarioFixtures.ts
      unit/
        contributions.test.ts
        accumulation.test.ts
        drawdown.test.ts
        requiredLumpSum.test.ts
        scenarioRunner.test.ts
        validation.test.ts
      integration/
        profilePersistence.test.ts
        tabDataFlow.test.ts

  public/
  vitest.config.ts
  tailwind.config.ts
  postcss.config.js
  tsconfig.json
```

---

## 3) TypeScript types and interfaces required

```ts
// domain/types.ts
export type PersonId = 'personA' | 'personB';
export type ScenarioId = 'optimistic' | 'base' | 'pessimistic';

export interface PersonInputs {
  id: PersonId;
  name: string;
  currentAge: number;
  retirementAge: number;      // default 65
  lifeExpectancy: number;
  currentSuperBalance: number;
  annualSalary: number;
  employerContributionRate: number; // decimal e.g. 0.115
  salarySacrificeMonthly: number;
  personalDeductibleMonthly: number;
  nonConcessionalMonthly: number;
}

export interface HouseholdInputs {
  monthlyLivingExpensesToday: number;
}

export interface GlobalSettings {
  concessionalCapAnnual: number; // default 30000
}

export interface ScenarioSettings {
  id: ScenarioId;
  label: string;
  nominalReturn: number;       // decimal
  inflation: number;           // decimal
  salaryGrowth: number;        // decimal
  annualPercentFee: number;    // decimal
  fixedAnnualFee: number;      // dollars
}

export interface AppInputs {
  people: [PersonInputs, PersonInputs];
  household: HouseholdInputs;
  settings: GlobalSettings;
  scenarios: Record<ScenarioId, ScenarioSettings>;
}

export interface AnnualPersonProjectionRow {
  age: number;
  salary: number;
  openingBalance: number;
  employerContributionGross: number;
  employerContributionCapped: number;
  salarySacrificeAnnual: number;
  personalDeductibleAnnual: number;
  concessionalGross: number;
  concessionalTax: number;
  concessionalNet: number;
  nonConcessionalAnnual: number;
  investmentEarningsGross: number;
  earningsTax: number;
  annualPercentFeeAmount: number;
  fixedAnnualFeeAmount: number;
  closingBalance: number;
  concessionalCapExceeded: boolean;
  concessionalExcessAmount: number;
}

export interface PersonProjectionResult {
  personId: PersonId;
  rows: AnnualPersonProjectionRow[];
  balanceAtRetirement: number;
  balanceAtLifeExpectancy: number;
  warnings: string[];
}

export interface CombinedProjectionPoint {
  ageYearIndex: number;
  personABalance: number;
  personBBalance: number;
  combinedBalance: number;
}

export interface DrawdownYearRow {
  yearIndex: number;
  agePersonA: number;
  agePersonB: number;
  openingCombinedBalance: number;
  requiredSpendingNominal: number;
  investmentReturnGross: number;
  earningsTax: number;
  annualPercentFeeAmount: number;
  fixedAnnualFeeAmountCombined: number;
  closingCombinedBalance: number;
}

export interface DrawdownResult {
  startsAtRetirementCombinedBalance: number;
  firstYearIncomeRequirement: number;
  endingBalanceAtMaxLifeExpectancy: number;
  fundsLastToLifeExpectancy: boolean;
  ageMoneyRunsOut?: number;
  shortfallOrSurplusAtLifeExpectancy: number;
  requiredLumpSumAtRetirement: number;
  rows: DrawdownYearRow[];
}

export interface ScenarioResult {
  scenarioId: ScenarioId;
  personResults: Record<PersonId, PersonProjectionResult>;
  combinedSeries: CombinedProjectionPoint[];
  drawdown: DrawdownResult;
  summary: {
    combinedAtRetirement: number;
    combinedAtLifeExpectancy: number;
    fundsLast: boolean;
    shortfallOrSurplus: number;
  };
}

export interface PlannerProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  inputs: AppInputs;
}

export interface PersistedState {
  activeProfileId: string | null;
  profiles: PlannerProfile[];
}
```

---

## 4) State model and persistence approach

### State slices
- `inputs`: canonical live form values.
- `validation`: per-field validation and warnings.
- `resultsByScenario`: derived (not manually edited).
- `profiles`: saved snapshots.
- `ui`: active tab, selected scenario focus, table pagination toggles.

### Storage strategy (`localStorage`)
- Keys:
  - `retirementPlanner.persistedState.v1`
  - `retirementPlanner.lastOpenedProfileId`
- Save format: JSON with schema version.
- Autosave: debounced (e.g., 300–500ms) on state changes.
- On app load:
  1. read storage;
  2. run migrations;
  3. hydrate state;
  4. fallback to default starter profile if parse fails.

### Profile workflows
- **Save New Profile**: clone current inputs into new profile id/name.
- **Update Existing Profile**: overwrite selected profile snapshot.
- **Load Profile**: replace `inputs` with selected profile data, trigger recompute.
- **Delete Profile**: remove by id; if active deleted, fallback to most recent profile or create default.

---

## 5) Detailed calculation engine design

### Core assumptions in v1
- Annual time-step.
- Monthly contributions annualized (`monthly * 12`).
- Concessional contributions taxed at 15% on contribution entry.
- Accumulation earnings taxed at 15% each year.
- Fees applied annually: percentage fee on balance basis + fixed fee.
- No pension-phase tax concessions in v1.
- Nominal dollars only for outputs (expenses inflated to retirement).

### Annual accumulation order (per person, per year)
For year `y` from `currentAge` to `lifeExpectancy - 1`:
1. Determine salary for year (`salary *= 1 + salaryGrowth` after first year).
2. Compute employer contribution = `salary * employerRate`, capped at 30,000 (rule-specific cap for employer leg).
3. Annualize salary sacrifice, personal deductible, non-concessional.
4. Compute concessional gross = capped employer + salary sacrifice + personal deductible.
5. Check concessional cap warning against configurable cap.
6. Apply concessional tax: `concessionalNet = concessionalGross * 0.85`.
7. Add contributions to balance base.
8. Compute gross earnings from applicable balance basis (implementation choice below).
9. Tax earnings at 15%.
10. Apply percent fee and fixed fee.
11. Produce closing balance (floor at 0).

### Balance basis choice (resolved)
For simplicity and transparency in v1:
- Earnings are calculated on `(openingBalance + concessionalNet + nonConcessionalAnnual)`.
- Percent fee also uses that same pre-earnings balance basis.
This keeps yearly flow deterministic and understandable.

### Pseudocode: annual accumulation
```pseudo
function projectPerson(person, scenario, settings):
  salary = person.annualSalary
  balance = person.currentSuperBalance
  rows = []

  for age in person.currentAge .. person.lifeExpectancy - 1:
    if age > person.currentAge:
      salary = salary * (1 + scenario.salaryGrowth)

    employerGross = salary * person.employerContributionRate
    employerCapped = min(employerGross, 30000) // specific rule

    salarySac = person.salarySacrificeMonthly * 12
    personalDed = person.personalDeductibleMonthly * 12
    nonConcessional = person.nonConcessionalMonthly * 12

    concessionalGross = employerCapped + salarySac + personalDed
    concessionalTax = concessionalGross * 0.15
    concessionalNet = concessionalGross - concessionalTax

    capExceeded = concessionalGross > settings.concessionalCapAnnual
    capExcess = max(0, concessionalGross - settings.concessionalCapAnnual)

    baseForEarningsAndPctFee = balance + concessionalNet + nonConcessional

    earningsGross = baseForEarningsAndPctFee * scenario.nominalReturn
    earningsTax = max(0, earningsGross * 0.15)

    pctFee = baseForEarningsAndPctFee * scenario.annualPercentFee
    fixedFee = scenario.fixedAnnualFee

    closing = baseForEarningsAndPctFee + (earningsGross - earningsTax) - pctFee - fixedFee
    closing = max(0, closing)

    rows.push(...all fields...)
    balance = closing

  return rows + summary metrics
```

### Drawdown model design
- Start balance: combined balance at household retirement start (default both 65; if different retirement ages, start from later/household retirement marker configurable as max retirement age for v1).
- First year spending at retirement (nominal):
  `monthlyLivingExpensesToday * 12 * (1 + inflation)^(yearsUntilRetirementHousehold)`
- For each drawdown year until max life expectancy of two people:
  - required spending grows with inflation.
  - return, earnings tax, fees applied similarly to accumulation model.
  - closing balance = opening + net earnings - fees - spending.
  - detect depletion year.

### Required lump sum at retirement
Use finite-horizon discounted spending model in nominal terms:
- Horizon years = years from retirement start to max life expectancy.
- Net nominal growth factor after earnings tax and fees approximated from scenario:
  `netReturnApprox = nominalReturn * (1 - 0.15) - annualPercentFee`
  (fixed fee handled iteratively or via simulation).
- Preferred implementation: **binary search** on initial lump sum such that terminal balance at horizon is ~0 under drawdown simulation (with fixed fee included). This is robust and consistent with the main engine.

### Pseudocode: required lump sum via simulation
```pseudo
function requiredLumpSum(targetHorizonYears, scenario, firstYearExpense):
  low = 0
  high = 100_000_000
  for i in 1..80:
    mid = (low + high) / 2
    endBalance = simulateDrawdown(mid, targetHorizonYears, scenario, firstYearExpense).endingBalance
    if endBalance >= 0:
      high = mid
    else:
      low = mid
  return high
```

---

## 6) Scenario model design

### Fixed scenario set
Exactly three immutable IDs:
- `optimistic`
- `base`
- `pessimistic`

Labels editable optional, IDs not removable.

### Scenario-editable fields
- nominal return
- inflation
- salary growth
- annual percent fee
- fixed annual fee

### Behaviour
- Shared person/household inputs apply to all scenarios.
- Scenario deltas are only these macro parameters.
- Side-by-side comparison table/cards on key metrics.

### Defaults (sensible starters)
- optimistic: return 8.0%, inflation 2.5%, salary growth 4.0%, fee 0.7%, fixed $250
- base: return 6.0%, inflation 2.8%, salary growth 3.0%, fee 1.0%, fixed $300
- pessimistic: return 4.0%, inflation 3.5%, salary growth 2.0%, fee 1.3%, fixed $350

---

## 7) Tab-by-tab UI component plan

1. **Overview**
   - Plain-English explanation of what the model does/doesn’t include.
   - Household summary cards per scenario:
     - combined at retirement;
     - combined at life expectancy;
     - funds last yes/no;
     - shortfall/surplus;
     - required lump sum.
   - Highlight active warning count.

2. **Inputs**
   - Two side-by-side person forms.
   - Shared household expenses field.
   - Inline validation + sensible defaults.

3. **Contributions**
   - Annualized contribution breakdown per person and scenario.
   - Concessional cap warning panel (person + year).

4. **Projection**
   - Year-by-year accumulation table per person.
   - Combined balances with retirement/life expectancy markers.

5. **Retirement Sufficiency**
   - Drawdown result card set:
     - first-year retirement income requirement;
     - age money runs out (if any);
     - surplus/shortfall;
     - required lump sum.
   - Drawdown chart.

6. **Scenarios**
   - Editable scenario cards with numeric controls.
   - Comparison matrix for top metrics.

7. **Charts**
   - Combined balance trajectory (3 scenario lines).
   - Contribution composition chart.
   - Drawdown chart by scenario.

8. **Data Table**
   - Unified export-friendly table style (can include copy CSV text button in v1.1).
   - Toggle person/combined and scenario filters.

9. **Assumptions**
   - Explicit formulas and ordering rules.
   - Clarify exclusions: Age Pension, property, non-super assets, etc.

10. **Profiles / Save Load**
   - Profile list, create, overwrite, duplicate, delete.
   - Last-updated metadata.

---

## 8) Data flow plan from input to output

1. User edits field in UI component.
2. Dispatch action to reducer (`UPDATE_PERSON_FIELD`, etc.).
3. Reducer updates canonical `inputs` and validation status.
4. Selector triggers recalculation pipeline:
   - for each scenario -> run person projections -> combine -> drawdown -> summary.
5. Results memoized and sent to tabs/charts.
6. Debounced persistence saves active profile snapshot to `localStorage`.
7. On reload/load-profile, hydration runs and same pipeline recalculates.

**Key design principle:** calculation functions are pure and stateless; UI never performs business math directly.

---

## 9) Edge cases and validation rules

### Input bounds
- ages: `0 <= currentAge < retirementAge <= lifeExpectancy <= 120`
- balances/salary/contributions/fees/expenses: `>= 0`
- rates (return, inflation, salary growth, fee%, employer rate): allow range `-0.20` to `1.00` for flexibility; validate warnings if unusual.

### Behavioural edge cases
- If retirement age < current age: block with validation error.
- If life expectancy <= retirement age: allow but warn (short/zero drawdown horizon).
- If salary = 0: employer contribution becomes 0.
- Negative return scenario: earnings tax should not create negative tax credit; floor at 0.
- Fees exceeding assets: balance floors at 0, never negative.
- Extremely high contributions: show cap warnings (do not auto-tax excess beyond defined rules in v1).
- Different retirement ages across persons:
  - v1 choice: household retirement sufficiency starts at `max(retirementAgeA, retirementAgeB)` for conservative view.
- Storage corruption: fallback to defaults and show recoverable warning.

---

## 10) Test strategy and test case list

### Test pyramid
1. **Unit tests (majority)** for pure calculation functions.
2. **Integration tests** for reducer + selectors + persistence adapter.
3. **Light UI tests** for critical tab rendering and warning visibility.

### Unit test cases

#### Contributions and caps
- Employer contribution capped at 30,000.
- Concessional gross = employer capped + salary sacrifice annual + personal deductible annual.
- Concessional tax exactly 15%.
- Concessional cap warning triggers at > cap and not at == cap.

#### Accumulation math
- Single-year deterministic golden case for one person.
- Multi-year compounding with salary growth.
- Zero return case.
- Negative return case (no negative earnings tax).
- High fee case floors balance at zero.

#### Drawdown
- Expenses inflated correctly to retirement start.
- Depletion detection returns expected age.
- Funds-last true/false toggles correctly.
- First-year retirement income requirement correctness.

#### Required lump sum
- Binary search converges within tolerance.
- Higher expenses => higher required lump sum monotonicity.
- Higher return => lower required lump sum monotonicity.

#### Scenario runner
- Exactly three scenario outputs present.
- Edits to one scenario do not mutate others.

### Integration tests
- Loading profile triggers recalculation and updates outputs.
- Deleting active profile selects fallback profile.
- Corrupt storage payload recovers to default profile.
- End-to-end state path: input change -> result change -> persisted update.

### Optional UI tests
- Concessional cap warning banner appears when expected.
- Overview displays combined metrics cards for all scenarios.

---

## 11) Suggested milestone order for development

1. **Scaffold & tooling**
   - Vite React TS setup, Tailwind, Recharts, Vitest config.
2. **Domain types + constants + defaults**
   - Core interfaces, default profile, scenario defaults.
3. **Calculation engine (pure functions)**
   - contributions, accumulation, drawdown, required lump sum, scenario runner.
4. **State management + persistence**
   - reducer/actions/selectors + localStorage adapter + migrations.
5. **Core tabs MVP**
   - Inputs, Overview, Scenarios, Projection.
6. **Retirement Sufficiency + Charts + Data Table**
   - advanced outputs and visual checks.
7. **Profiles tab**
   - save/load/delete/duplicate flows.
8. **Assumptions tab + UX polish**
   - formula transparency and warnings.
9. **Test hardening**
   - complete unit/integration suite and regression fixtures.

---

## 12) Risks, ambiguities, and resolved implementation choices

### Resolved choices
- **Employer contribution cap** interpreted exactly as requested: employer leg capped at $30,000 regardless of configurable concessional cap.
- **Configurable concessional cap** used for warning threshold only in v1 (no additional excess tax modelling).
- **Household retirement sufficiency start** uses the later retirement age to avoid optimistic underestimation.
- **Required lump sum** computed via simulation + binary search to align with engine assumptions including fixed fees.
- **Outputs in nominal dollars** while inflating spending from today’s dollars to retirement.

### Risks / known limitations
- Annual model smooths intra-year volatility/timing effects.
- Accumulation-phase tax on earnings (15%) is simplified and does not model fund-specific tax offsets.
- No pension-phase tax treatment may overstate post-retirement drag.
- No Age Pension may overstate required balances for some households.
- localStorage size limits and manual browser data clearing can remove profiles.

### Mitigations
- Assumptions tab explicitly documents limitations.
- Add export/import JSON in future version to improve backup resilience.
- Keep formulas visible and test coverage high for transparency.
