import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppState } from '../state/AppState';

export default function ChartsTab() {
  const { results } = useAppState();
  const baseRows = results.base.personA.rows.map((r, i) => ({
    age: r.age,
    optimistic: results.optimistic.personA.rows[i]?.closingBalance ?? 0,
    base: results.base.personA.rows[i]?.closingBalance ?? 0,
    pessimistic: results.pessimistic.personA.rows[i]?.closingBalance ?? 0
  }));

  return (
    <div className="h-96 rounded bg-white p-4 shadow">
      <h2 className="mb-2 text-lg font-semibold">Scenario Balance Comparison (Person A)</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={baseRows}>
          <XAxis dataKey="age" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="optimistic" stroke="#16a34a" />
          <Line type="monotone" dataKey="base" stroke="#2563eb" />
          <Line type="monotone" dataKey="pessimistic" stroke="#dc2626" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
