import { InputsState } from './types';

export const EMPLOYER_CAP = 30000;
export const CONTRIBUTION_TAX_RATE = 0.15;
export const EARNINGS_TAX_RATE = 0.15;
export const PROFILE_SCHEMA_VERSION = 1;

export const defaultInputs: InputsState = {
  people: [
    {
      id: 'personA',
      name: 'Person A',
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 90,
      currentSuperBalance: 120000,
      annualSalary: 110000,
      employerContributionRate: 0.115,
      salarySacrificeMonthly: 500,
      personalDeductibleMonthly: 0,
      nonConcessionalMonthly: 0
    },
    {
      id: 'personB',
      name: 'Person B',
      currentAge: 33,
      retirementAge: 65,
      lifeExpectancy: 92,
      currentSuperBalance: 80000,
      annualSalary: 95000,
      employerContributionRate: 0.115,
      salarySacrificeMonthly: 300,
      personalDeductibleMonthly: 0,
      nonConcessionalMonthly: 0
    }
  ],
  household: { monthlyLivingExpensesToday: 6500 },
  assumptions: { concessionalCapAnnual: 30000 },
  scenarios: {
    optimistic: {
      id: 'optimistic',
      label: 'Optimistic',
      nominalReturn: 0.08,
      inflation: 0.025,
      salaryGrowth: 0.04,
      annualPercentFee: 0.007,
      fixedAnnualFee: 250
    },
    base: {
      id: 'base',
      label: 'Base',
      nominalReturn: 0.06,
      inflation: 0.028,
      salaryGrowth: 0.03,
      annualPercentFee: 0.01,
      fixedAnnualFee: 300
    },
    pessimistic: {
      id: 'pessimistic',
      label: 'Pessimistic',
      nominalReturn: 0.04,
      inflation: 0.035,
      salaryGrowth: 0.02,
      annualPercentFee: 0.013,
      fixedAnnualFee: 350
    }
  }
};
