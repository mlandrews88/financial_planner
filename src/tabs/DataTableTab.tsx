import { ccy } from '../domain/format';
import { useAppState } from '../state/AppState';

export default function DataTableTab() {
  const { results, scenarioId } = useAppState();
  const r = results[scenarioId];
  return (
    <div className="rounded bg-white p-4 shadow">
      <h2 className="mb-2 text-lg font-semibold">Detailed data table</h2>
      <table className="w-full text-xs">
        <thead><tr><th>Age</th><th>A Close</th><th>B Close</th><th>Combined</th></tr></thead>
        <tbody>
          {r.personA.rows.slice(0, 20).map((row, i) => {
            const b = r.personB.rows[i];
            const combined = row.closingBalance + (b?.closingBalance ?? 0);
            return <tr key={row.age}><td>{row.age}</td><td>{ccy(row.closingBalance)}</td><td>{ccy(b?.closingBalance ?? 0)}</td><td>{ccy(combined)}</td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
