export const tabs = [
  'Overview',
  'Inputs',
  'Contributions',
  'Projection',
  'Retirement Sufficiency',
  'Scenarios',
  'Charts',
  'Data Table',
  'Assumptions',
  'Profiles / Save Load'
] as const;

export type TabName = (typeof tabs)[number];

export default function Tabs({ active, setActive }: { active: TabName; setActive: (tab: TabName) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-b pb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`rounded px-3 py-1 text-sm ${active === tab ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
