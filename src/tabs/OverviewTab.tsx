import { useAppState } from '../state/AppState';
import { ccy } from '../domain/format';

export default function OverviewTab() {
  const { results, scenarioId, setScenarioId } = useAppState();
  const result = results[scenarioId];

  return (
    <div className="space-y-4">
      <div className="rounded bg-white p-4 shadow">
        <h2 className="mb-2 text-xl font-semibold">What this tool does</h2>
        <p className="text-sm text-slate-700">
          This planner projects two super accounts, combines them for household retirement testing, and runs
          optimistic/base/pessimistic scenarios. It includes concessional tax, earnings tax, annual fees, and
          retirement drawdown. It excludes Age Pension, property, and other non-super assets.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span>Scenario</span>
        <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value as typeof scenarioId)} className="rounded border p-1">
          <option value="optimistic">Optimistic</option>
          <option value="base">Base</option>
          <option value="pessimistic">Pessimistic</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Card title="Combined at retirement" value={ccy(result.combinedAtRetirement)} />
        <Card title="Balance at life expectancy" value={ccy(result.drawdown.balanceAtLifeExpectancy)} />
        <Card title="Annual retirement spending target" value={ccy(result.annualRetirementSpendingTarget)} />
        <Card title="First-year income required" value={ccy(result.drawdown.firstYearIncomeRequirement)} />
        <Card title="Shortfall / Surplus" value={ccy(result.drawdown.shortfallOrSurplus)} />
        <Card title="Age money runs out" value={result.drawdown.ageMoneyRunsOut ? String(result.drawdown.ageMoneyRunsOut) : 'Funds last'} />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
