import Field from '../components/Field';
import { useAppState } from '../state/AppState';

export default function ScenariosTab() {
  const { inputs, updateInputs } = useAppState();
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {(Object.keys(inputs.scenarios) as (keyof typeof inputs.scenarios)[]).map((key) => {
        const s = inputs.scenarios[key];
        return (
          <div key={key} className="space-y-2 rounded bg-white p-4 shadow">
            <h3 className="font-semibold">{s.label}</h3>
            {[
              ['nominalReturn', 'Nominal return'],
              ['inflation', 'Inflation'],
              ['salaryGrowth', 'Salary growth'],
              ['annualPercentFee', 'Annual % fee'],
              ['fixedAnnualFee', 'Fixed annual fee']
            ].map(([field, label]) => (
              <Field
                key={field}
                label={label}
                value={s[field as keyof typeof s] as number}
                onChange={(v) =>
                  updateInputs((old) => ({
                    ...old,
                    scenarios: {
                      ...old.scenarios,
                      [key]: { ...old.scenarios[key], [field]: Number(v) || 0 }
                    }
                  }))
                }
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
