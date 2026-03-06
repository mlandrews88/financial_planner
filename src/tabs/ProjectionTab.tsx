import { ccy } from '../domain/format';
import { useAppState } from '../state/AppState';

export default function ProjectionTab() {
  const { results, scenarioId } = useAppState();
  const r = results[scenarioId];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {[r.personA, r.personB].map((p) => (
        <div key={p.personId} className="rounded bg-white p-4 shadow">
          <h3 className="mb-2 font-semibold">{p.personId} projection snapshot</h3>
          <div>Retirement balance: {ccy(p.balanceAtRetirement)}</div>
          <div>Life expectancy balance: {ccy(p.balanceAtLifeExpectancy)}</div>
          <table className="mt-2 w-full text-xs">
            <thead><tr><th>Age</th><th>Open</th><th>Contrib</th><th>Close</th></tr></thead>
            <tbody>
              {p.rows.slice(0, 8).map((row) => <tr key={row.age}><td>{row.age}</td><td>{ccy(row.openingBalance)}</td><td>{ccy(row.netContributions)}</td><td>{ccy(row.closingBalance)}</td></tr>)}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
