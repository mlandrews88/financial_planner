import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { runAllScenarios } from '../domain/calculations';
import { InputsState, PlannerProfile, ScenarioId } from '../domain/types';
import {
  createProfile,
  exportProfile,
  importProfile,
  loadProfiles,
  PersistedProfiles,
  saveProfiles
} from '../persistence/profiles';

interface AppStateValue {
  profiles: PlannerProfile[];
  activeProfileId: string;
  activeProfile: PlannerProfile;
  inputs: InputsState;
  scenarioId: ScenarioId;
  results: ReturnType<typeof runAllScenarios>;
  setScenarioId: (id: ScenarioId) => void;
  updateInputs: (updater: (old: InputsState) => InputsState) => void;
  createNewProfile: (name: string) => void;
  duplicateProfile: () => void;
  renameProfile: (id: string, name: string) => void;
  deleteProfile: (id: string) => void;
  switchProfile: (id: string) => void;
  exportActiveProfile: () => string;
  importNewProfile: (raw: string) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const initial = loadProfiles();
  const [persisted, setPersisted] = useState<PersistedProfiles>(initial);
  const [scenarioId, setScenarioId] = useState<ScenarioId>('base');

  const activeProfile =
    persisted.profiles.find((p) => p.id === persisted.activeProfileId) ?? persisted.profiles[0];

  const inputs = activeProfile.inputs;

  const results = useMemo(() => runAllScenarios(inputs), [inputs]);

  useEffect(() => {
    saveProfiles(persisted);
  }, [persisted]);

  const updateInputs = (updater: (old: InputsState) => InputsState) => {
    setPersisted((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId
          ? { ...p, inputs: updater(p.inputs), updatedAt: new Date().toISOString() }
          : p
      )
    }));
  };

  const createNewProfile = (name: string) => {
    setPersisted((prev) => {
      const profile = createProfile(name, activeProfile.inputs);
      return { profiles: [...prev.profiles, profile], activeProfileId: profile.id };
    });
  };

  const duplicateProfile = () => createNewProfile(`${activeProfile.name} Copy`);

  const renameProfile = (id: string, name: string) => {
    setPersisted((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, name } : p))
    }));
  };

  const deleteProfile = (id: string) => {
    setPersisted((prev) => {
      const profiles = prev.profiles.filter((p) => p.id !== id);
      if (!profiles.length) {
        const seeded = loadProfiles();
        return seeded;
      }
      return {
        profiles,
        activeProfileId: prev.activeProfileId === id ? profiles[0].id : prev.activeProfileId
      };
    });
  };

  const switchProfile = (id: string) => setPersisted((p) => ({ ...p, activeProfileId: id }));

  const exportActiveProfile = () => exportProfile(activeProfile);

  const importNewProfile = (raw: string) => {
    const profile = importProfile(raw);
    setPersisted((prev) => ({ profiles: [...prev.profiles, profile], activeProfileId: profile.id }));
  };

  return (
    <AppStateContext.Provider
      value={{
        profiles: persisted.profiles,
        activeProfileId: persisted.activeProfileId,
        activeProfile,
        inputs,
        scenarioId,
        results,
        setScenarioId,
        updateInputs,
        createNewProfile,
        duplicateProfile,
        renameProfile,
        deleteProfile,
        switchProfile,
        exportActiveProfile,
        importNewProfile
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside provider');
  return ctx;
}
