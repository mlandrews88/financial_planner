import { ccy } from '../domain/format';
import { useAppState } from '../state/AppState';

export default function ContributionsTab() {
  const { results, scenarioId } = useAppState();
  const result = results[scenarioId];
  const rows = [result.personA.rows[0], result.personB.rows[0]];

  return (
    <div className="rounded bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-semibold">Annualized Contributions (first projection year)</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Person</th><th>Employer</th><th>Salary Sac</th><th>Personal Deductible</th><th>Concessional</th><th>Cap Warning</th></tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t">
              <td>{i === 0 ? result.personA.personId : result.personB.personId}</td>
              <td>{ccy(row.employerContribution)}</td>
              <td>{ccy(row.salarySacrificeAnnual)}</td>
              <td>{ccy(row.personalDeductibleAnnual)}</td>
              <td>{ccy(row.concessionalTotal)}</td>
              <td>{row.concessionalCapExceeded ? '⚠️ Exceeds cap' : 'OK'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
