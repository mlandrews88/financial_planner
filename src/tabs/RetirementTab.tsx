import { ccy } from '../domain/format';
import { useAppState } from '../state/AppState';

export default function RetirementTab() {
  const { results, scenarioId } = useAppState();
  const d = results[scenarioId].drawdown;
  return (
    <div className="space-y-3 rounded bg-white p-4 shadow">
      <h2 className="text-lg font-semibold">Retirement Sufficiency</h2>
      <div>First-year requirement: {ccy(d.firstYearIncomeRequirement)}</div>
      <div>Funds last: {d.fundsLastToLifeExpectancy ? 'Yes' : 'No'}</div>
      <div>Age money runs out: {d.ageMoneyRunsOut ?? 'N/A'}</div>
      <div>Shortfall/surplus: {ccy(d.shortfallOrSurplus)}</div>
      <div>Required lump sum at retirement: {ccy(d.requiredLumpSumAtRetirement)}</div>
    </div>
  );
}
