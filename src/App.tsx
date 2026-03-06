import { useState } from 'react';
import Tabs, { TabName } from './components/Tabs';
import { AppStateProvider } from './state/AppState';
import AssumptionsTab from './tabs/AssumptionsTab';
import ChartsTab from './tabs/ChartsTab';
import ContributionsTab from './tabs/ContributionsTab';
import DataTableTab from './tabs/DataTableTab';
import InputsTab from './tabs/InputsTab';
import OverviewTab from './tabs/OverviewTab';
import ProfilesTab from './tabs/ProfilesTab';
import ProjectionTab from './tabs/ProjectionTab';
import RetirementTab from './tabs/RetirementTab';
import ScenariosTab from './tabs/ScenariosTab';

function InnerApp() {
  const [tab, setTab] = useState<TabName>('Overview');

  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Australian Household Super Planner</h1>
      <Tabs active={tab} setActive={setTab} />
      {tab === 'Overview' && <OverviewTab />}
      {tab === 'Inputs' && <InputsTab />}
      {tab === 'Contributions' && <ContributionsTab />}
      {tab === 'Projection' && <ProjectionTab />}
      {tab === 'Retirement Sufficiency' && <RetirementTab />}
      {tab === 'Scenarios' && <ScenariosTab />}
      {tab === 'Charts' && <ChartsTab />}
      {tab === 'Data Table' && <DataTableTab />}
      {tab === 'Assumptions' && <AssumptionsTab />}
      {tab === 'Profiles / Save Load' && <ProfilesTab />}
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <InnerApp />
    </AppStateProvider>
  );
}
