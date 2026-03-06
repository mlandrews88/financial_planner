import { PROFILE_SCHEMA_VERSION, defaultInputs } from '../domain/constants';
import { InputsState, PlannerProfile } from '../domain/types';

const STORAGE_KEY = 'retirementPlanner.profiles.v1';
const ACTIVE_KEY = 'retirementPlanner.activeProfileId.v1';

export interface PersistedProfiles {
  profiles: PlannerProfile[];
  activeProfileId: string;
}

export const createProfile = (name: string, inputs: InputsState): PlannerProfile => ({
  id: crypto.randomUUID(),
  name,
  updatedAt: new Date().toISOString(),
  schemaVersion: PROFILE_SCHEMA_VERSION,
  inputs
});

export function seedPersistedProfiles(): PersistedProfiles {
  const profile = createProfile('Default Household', defaultInputs);
  return { profiles: [profile], activeProfileId: profile.id };
}

export function serializeProfiles(data: PersistedProfiles): string {
  return JSON.stringify(data);
}

export function parseProfiles(raw: string): PersistedProfiles {
  const parsed = JSON.parse(raw) as PersistedProfiles;
  if (!Array.isArray(parsed.profiles) || typeof parsed.activeProfileId !== 'string') {
    throw new Error('Invalid profile payload');
  }
  return parsed;
}

export function loadProfiles(): PersistedProfiles {
  const raw = localStorage.getItem(STORAGE_KEY);
  const active = localStorage.getItem(ACTIVE_KEY);
  if (!raw || !active) {
    const seeded = seedPersistedProfiles();
    saveProfiles(seeded);
    return seeded;
  }
  try {
    const parsed = parseProfiles(raw);
    return { ...parsed, activeProfileId: active };
  } catch {
    const seeded = seedPersistedProfiles();
    saveProfiles(seeded);
    return seeded;
  }
}

export function saveProfiles(data: PersistedProfiles): void {
  localStorage.setItem(STORAGE_KEY, serializeProfiles(data));
  localStorage.setItem(ACTIVE_KEY, data.activeProfileId);
}

export function exportProfile(profile: PlannerProfile): string {
  return JSON.stringify(profile, null, 2);
}

export function importProfile(raw: string): PlannerProfile {
  const parsed = JSON.parse(raw) as PlannerProfile;
  if (!parsed?.inputs || !parsed?.name) throw new Error('Invalid import file');
  return {
    ...parsed,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
    schemaVersion: PROFILE_SCHEMA_VERSION
  };
}
