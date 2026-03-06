import {
  CONTRIBUTION_TAX_RATE,
  EARNINGS_TAX_RATE,
  EMPLOYER_CAP
} from './constants';
import {
  AnnualRow,
  DrawdownResult,
  DrawdownRow,
  InputsState,
  PersonInputs,
  PersonProjection,
  ScenarioResult,
  ScenarioSettings
} from './types';

export const annualize = (monthly: number) => monthly * 12;

export function calcEmployerContribution(salary: number, rate: number): number {
  return Math.min(salary * rate, EMPLOYER_CAP);
}

export function calcConcessionalTotal(
  employer: number,
  salarySacrificeAnnual: number,
  personalDeductibleAnnual: number
): number {
  return employer + salarySacrificeAnnual + personalDeductibleAnnual;
}

export function calcConcessionalTax(concessionalTotal: number): number {
  return concessionalTotal * CONTRIBUTION_TAX_RATE;
}

export function calcEarningsTax(earningsGross: number): number {
  return earningsGross > 0 ? earningsGross * EARNINGS_TAX_RATE : 0;
}

export function calcAnnualFees(baseBalance: number, pctFee: number, fixedFee: number) {
  return {
    percentFee: baseBalance * pctFee,
    fixedFee
  };
}

export function projectPerson(
  person: PersonInputs,
  scenario: ScenarioSettings,
  concessionalCapAnnual: number
): PersonProjection {
  let salary = person.annualSalary;
  let balance = person.currentSuperBalance;
  const warnings: string[] = [];
  const rows: AnnualRow[] = [];

  for (let age = person.currentAge; age <= person.lifeExpectancy; age += 1) {
    if (age > person.currentAge) salary *= 1 + scenario.salaryGrowth;

    const openingBalance = balance;
    const employerContribution = calcEmployerContribution(salary, person.employerContributionRate);
    const salarySacrificeAnnual = annualize(person.salarySacrificeMonthly);
    const personalDeductibleAnnual = annualize(person.personalDeductibleMonthly);
    const nonConcessionalAnnual = annualize(person.nonConcessionalMonthly);

    const concessionalTotal = calcConcessionalTotal(
      employerContribution,
      salarySacrificeAnnual,
      personalDeductibleAnnual
    );

    const concessionalCapExceeded = concessionalTotal > concessionalCapAnnual;
    if (concessionalCapExceeded) warnings.push(`${person.name} exceeds concessional cap at age ${age}`);

    const concessionalTax = calcConcessionalTax(concessionalTotal);
    const netContributions = concessionalTotal - concessionalTax + nonConcessionalAnnual;

    const baseBalance = openingBalance + netContributions;
    const earningsGross = baseBalance * scenario.nominalReturn;
    const earningsTax = calcEarningsTax(earningsGross);
    const { percentFee, fixedFee } = calcAnnualFees(baseBalance, scenario.annualPercentFee, scenario.fixedAnnualFee);

    const closingBalance = Math.max(0, baseBalance + earningsGross - earningsTax - percentFee - fixedFee);

    rows.push({
      age,
      salary,
      openingBalance,
      employerContribution,
      salarySacrificeAnnual,
      personalDeductibleAnnual,
      nonConcessionalAnnual,
      concessionalTotal,
      concessionalTax,
      netContributions,
      earningsGross,
      earningsTax,
      percentFee,
      fixedFee,
      closingBalance,
      concessionalCapExceeded
    });

    balance = closingBalance;
  }

  const retirementRow = rows.find((r) => r.age === person.retirementAge) ?? rows[rows.length - 1];
  return {
    personId: person.id,
    rows,
    warnings,
    balanceAtRetirement: retirementRow?.closingBalance ?? 0,
    balanceAtLifeExpectancy: rows[rows.length - 1]?.closingBalance ?? 0
  };
}

export function runDrawdown(
  startingBalance: number,
  firstYearSpending: number,
  startAge: number,
  maxLifeExpectancy: number,
  scenario: ScenarioSettings
): DrawdownResult {
  const years = Math.max(0, maxLifeExpectancy - startAge + 1);
  const rows: DrawdownRow[] = [];
  let spending = firstYearSpending;
  let balance = startingBalance;
  let ageMoneyRunsOut: number | null = null;

  for (let y = 0; y < years; y += 1) {
    const age = startAge + y;
    const openingBalance = balance;
    const earningsGross = openingBalance * scenario.nominalReturn;
    const earningsTax = calcEarningsTax(earningsGross);
    const { percentFee, fixedFee } = calcAnnualFees(openingBalance, scenario.annualPercentFee, scenario.fixedAnnualFee * 2);
    const closingBalance = Math.max(0, openingBalance + earningsGross - earningsTax - percentFee - fixedFee - spending);

    if (ageMoneyRunsOut === null && closingBalance <= 0) ageMoneyRunsOut = age;

    rows.push({
      year: y,
      householdAge: age,
      openingBalance,
      spending,
      earningsGross,
      earningsTax,
      percentFee,
      fixedFee,
      closingBalance
    });

    balance = closingBalance;
    spending *= 1 + scenario.inflation;
  }

  const balanceAtLifeExpectancy = rows[rows.length - 1]?.closingBalance ?? 0;
  return {
    firstYearIncomeRequirement: firstYearSpending,
    ageMoneyRunsOut,
    fundsLastToLifeExpectancy: ageMoneyRunsOut === null,
    balanceAtLifeExpectancy,
    shortfallOrSurplus: balanceAtLifeExpectancy,
    requiredLumpSumAtRetirement: requiredLumpSumAtRetirement(firstYearSpending, startAge, maxLifeExpectancy, scenario),
    rows
  };
}

export function requiredLumpSumAtRetirement(
  firstYearSpending: number,
  startAge: number,
  maxLifeExpectancy: number,
  scenario: ScenarioSettings
): number {
  let low = 0;
  let high = 50_000_000;
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const result = runDrawdownNoLump(mid, firstYearSpending, startAge, maxLifeExpectancy, scenario);
    if (result >= 0) high = mid;
    else low = mid;
  }
  return high;
}

function runDrawdownNoLump(
  startingBalance: number,
  firstYearSpending: number,
  startAge: number,
  maxLifeExpectancy: number,
  scenario: ScenarioSettings
): number {
  const years = Math.max(0, maxLifeExpectancy - startAge + 1);
  let spending = firstYearSpending;
  let balance = startingBalance;

  for (let y = 0; y < years; y += 1) {
    const earningsGross = balance * scenario.nominalReturn;
    const earningsTax = calcEarningsTax(earningsGross);
    const fees = calcAnnualFees(balance, scenario.annualPercentFee, scenario.fixedAnnualFee * 2);
    balance = balance + earningsGross - earningsTax - fees.percentFee - fees.fixedFee - spending;
    spending *= 1 + scenario.inflation;
  }
  return balance;
}

export function runScenario(inputs: InputsState, scenario: ScenarioSettings): ScenarioResult {
  const [personA, personB] = inputs.people;
  const a = projectPerson(personA, scenario, inputs.assumptions.concessionalCapAnnual);
  const b = projectPerson(personB, scenario, inputs.assumptions.concessionalCapAnnual);
  const householdRetirementAge = Math.max(personA.retirementAge, personB.retirementAge);
  const maxLife = Math.max(personA.lifeExpectancy, personB.lifeExpectancy);
  const yearsToRetirement = Math.max(0, householdRetirementAge - Math.min(personA.currentAge, personB.currentAge));
  const annualTarget = inputs.household.monthlyLivingExpensesToday * 12 * (1 + scenario.inflation) ** yearsToRetirement;

  const drawdown = runDrawdown(a.balanceAtRetirement + b.balanceAtRetirement, annualTarget, householdRetirementAge, maxLife, scenario);

  return {
    scenarioId: scenario.id,
    personA: a,
    personB: b,
    combinedAtRetirement: a.balanceAtRetirement + b.balanceAtRetirement,
    combinedAtLifeExpectancy: a.balanceAtLifeExpectancy + b.balanceAtLifeExpectancy,
    annualRetirementSpendingTarget: annualTarget,
    drawdown
  };
}

export function runAllScenarios(inputs: InputsState) {
  return {
    optimistic: runScenario(inputs, inputs.scenarios.optimistic),
    base: runScenario(inputs, inputs.scenarios.base),
    pessimistic: runScenario(inputs, inputs.scenarios.pessimistic)
  };
}
