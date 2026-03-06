import Field from '../components/Field';
import { PersonInputs } from '../domain/types';
import { useAppState } from '../state/AppState';

type PersonNumericField =
  | 'currentAge'
  | 'retirementAge'
  | 'lifeExpectancy'
  | 'currentSuperBalance'
  | 'annualSalary'
  | 'employerContributionRate'
  | 'salarySacrificeMonthly'
  | 'personalDeductibleMonthly'
  | 'nonConcessionalMonthly';

const numericFields: [PersonNumericField, string][] = [
  ['currentAge', 'Current age'],
  ['retirementAge', 'Retirement age'],
  ['lifeExpectancy', 'Life expectancy'],
  ['currentSuperBalance', 'Current super balance'],
  ['annualSalary', 'Annual salary'],
  ['employerContributionRate', 'Employer contribution rate (decimal)'],
  ['salarySacrificeMonthly', 'Salary sacrifice per month'],
  ['personalDeductibleMonthly', 'Personal deductible per month'],
  ['nonConcessionalMonthly', 'Non-concessional per month']
];

export default function InputsTab() {
  const { inputs, updateInputs } = useAppState();

  const updatePerson = <K extends keyof PersonInputs>(idx: number, field: K, value: PersonInputs[K]) => {
    updateInputs((old) => {
      const people = [...old.people] as typeof old.people;
      people[idx] = { ...people[idx], [field]: value };
      return { ...old, people };
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {inputs.people.map((person, idx) => (
        <div key={person.id} className="space-y-2 rounded bg-white p-4 shadow">
          <h3 className="font-semibold">{person.name}</h3>
          <Field label="Name" type="text" value={person.name} onChange={(v) => updatePerson(idx, 'name', v)} />
          {numericFields.map(([field, label]) => (
            <Field
              key={field}
              label={label}
              value={person[field] as number}
              onChange={(v) => updatePerson(idx, field, Number(v) as PersonInputs[typeof field])}
            />
          ))}
        </div>
      ))}
      <div className="rounded bg-white p-4 shadow">
        <h3 className="font-semibold">Household</h3>
        <Field
          label="Monthly living expenses today"
          value={inputs.household.monthlyLivingExpensesToday}
          onChange={(v) =>
            updateInputs((old) => ({ ...old, household: { monthlyLivingExpensesToday: Number(v) || 0 } }))
          }
        />
      </div>
    </div>
  );
}
