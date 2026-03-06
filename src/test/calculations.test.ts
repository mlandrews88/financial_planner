import { describe, expect, test } from 'vitest';
import {
  annualize,
  calcAnnualFees,
  calcConcessionalTax,
  calcConcessionalTotal,
  calcEarningsTax,
  calcEmployerContribution,
  projectPerson,
  requiredLumpSumAtRetirement,
  runDrawdown
} from '../domain/calculations';
import { defaultInputs, EMPLOYER_CAP } from '../domain/constants';
import { parseProfiles, serializeProfiles, seedPersistedProfiles } from '../persistence/profiles';

describe('core contribution maths', () => {
  test('employer contribution cap', () => {
    expect(calcEmployerContribution(1_000_000, 0.2)).toBe(EMPLOYER_CAP);
  });

  test('monthly to annual conversion', () => {
    expect(annualize(500)).toBe(6000);
  });

  test('concessional totals', () => {
    expect(calcConcessionalTotal(10000, 6000, 3000)).toBe(19000);
  });

  test('concessional contribution tax', () => {
    expect(calcConcessionalTax(10000)).toBe(1500);
  });

  test('earnings tax positive only', () => {
    expect(calcEarningsTax(1000)).toBe(150);
    expect(calcEarningsTax(-1000)).toBe(0);
  });

  test('annual fees', () => {
    expect(calcAnnualFees(100000, 0.01, 300)).toEqual({ percentFee: 1000, fixedFee: 300 });
  });
});

describe('projection and drawdown', () => {
  test('concessional cap warning exists', () => {
    const person = { ...defaultInputs.people[0], annualSalary: 500000 };
    const p = projectPerson(person, defaultInputs.scenarios.base, 30000);
    expect(p.rows.some((r) => r.concessionalCapExceeded)).toBe(true);
  });

  test('accumulation projection grows balances', () => {
    const p = projectPerson(defaultInputs.people[0], defaultInputs.scenarios.base, 30000);
    expect(p.rows.length).toBeGreaterThan(1);
    expect(p.balanceAtLifeExpectancy).toBeGreaterThan(0);
  });

  test('drawdown sufficiency and age money runs out', () => {
    const d = runDrawdown(100000, 80000, 65, 80, defaultInputs.scenarios.base);
    expect(d.fundsLastToLifeExpectancy).toBe(false);
    expect(d.ageMoneyRunsOut).not.toBeNull();
  });

  test('required lump sum estimate positive', () => {
    const required = requiredLumpSumAtRetirement(100000, 65, 90, defaultInputs.scenarios.base);
    expect(required).toBeGreaterThan(0);
  });
});

describe('profile serialization', () => {
  test('serialise and parse profiles', () => {
    const seeded = seedPersistedProfiles();
    const raw = serializeProfiles(seeded);
    const parsed = parseProfiles(raw);
    expect(parsed.activeProfileId).toBe(seeded.activeProfileId);
    expect(parsed.profiles.length).toBe(1);
  });
});
