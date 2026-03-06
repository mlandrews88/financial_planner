export type PersonId = 'personA' | 'personB';
export type ScenarioId = 'optimistic' | 'base' | 'pessimistic';

export interface PersonInputs {
  id: PersonId;
  name: string;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSuperBalance: number;
  annualSalary: number;
  employerContributionRate: number;
  salarySacrificeMonthly: number;
  personalDeductibleMonthly: number;
  nonConcessionalMonthly: number;
}

export interface HouseholdInputs {
  monthlyLivingExpensesToday: number;
}

export interface ScenarioSettings {
  id: ScenarioId;
  label: string;
  nominalReturn: number;
  inflation: number;
  salaryGrowth: number;
  annualPercentFee: number;
  fixedAnnualFee: number;
}

export interface Assumptions {
  concessionalCapAnnual: number;
}

export interface InputsState {
  people: [PersonInputs, PersonInputs];
  household: HouseholdInputs;
  assumptions: Assumptions;
  scenarios: Record<ScenarioId, ScenarioSettings>;
}

export interface AnnualRow {
  age: number;
  salary: number;
  openingBalance: number;
  employerContribution: number;
  salarySacrificeAnnual: number;
  personalDeductibleAnnual: number;
  nonConcessionalAnnual: number;
  concessionalTotal: number;
  concessionalTax: number;
  netContributions: number;
  earningsGross: number;
  earningsTax: number;
  percentFee: number;
  fixedFee: number;
  closingBalance: number;
  concessionalCapExceeded: boolean;
}

export interface PersonProjection {
  personId: PersonId;
  rows: AnnualRow[];
  warnings: string[];
  balanceAtRetirement: number;
  balanceAtLifeExpectancy: number;
}

export interface DrawdownRow {
  year: number;
  householdAge: number;
  openingBalance: number;
  spending: number;
  earningsGross: number;
  earningsTax: number;
  percentFee: number;
  fixedFee: number;
  closingBalance: number;
}

export interface DrawdownResult {
  firstYearIncomeRequirement: number;
  ageMoneyRunsOut: number | null;
  fundsLastToLifeExpectancy: boolean;
  balanceAtLifeExpectancy: number;
  shortfallOrSurplus: number;
  requiredLumpSumAtRetirement: number;
  rows: DrawdownRow[];
}

export interface ScenarioResult {
  scenarioId: ScenarioId;
  personA: PersonProjection;
  personB: PersonProjection;
  combinedAtRetirement: number;
  combinedAtLifeExpectancy: number;
  annualRetirementSpendingTarget: number;
  drawdown: DrawdownResult;
}

export interface PlannerProfile {
  id: string;
  name: string;
  updatedAt: string;
  schemaVersion: number;
  inputs: InputsState;
}
