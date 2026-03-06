import Field from '../components/Field';
import { useAppState } from '../state/AppState';

export default function AssumptionsTab() {
  const { inputs, updateInputs } = useAppState();
  return (
    <div className="space-y-3 rounded bg-white p-4 shadow text-sm">
      <h2 className="text-lg font-semibold">Assumptions & formulas</h2>
      <ul className="list-disc pl-6">
        <li>Annual model only. Monthly contribution fields are multiplied by 12.</li>
        <li>Employer contribution = salary × employer rate, capped at $30,000.</li>
        <li>Concessional contributions taxed at 15%.</li>
        <li>Earnings in accumulation/drawdown taxed at 15% when positive.</li>
        <li>Fees = annual % fee + fixed annual fee.</li>
        <li>Outputs shown in nominal dollars.</li>
      </ul>
      <Field
        label="Concessional cap annual"
        value={inputs.assumptions.concessionalCapAnnual}
        onChange={(v) =>
          updateInputs((old) => ({
            ...old,
            assumptions: { concessionalCapAnnual: Number(v) || 0 }
          }))
        }
      />
    </div>
  );
}
