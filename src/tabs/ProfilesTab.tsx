import { useState } from 'react';
import { useAppState } from '../state/AppState';

export default function ProfilesTab() {
  const {
    profiles,
    activeProfileId,
    switchProfile,
    createNewProfile,
    duplicateProfile,
    renameProfile,
    deleteProfile,
    exportActiveProfile,
    importNewProfile
  } = useAppState();
  const [newName, setNewName] = useState('');
  const [importText, setImportText] = useState('');

  return (
    <div className="space-y-4 rounded bg-white p-4 shadow">
      <h2 className="text-lg font-semibold">Profiles / Save Load</h2>
      <div className="flex gap-2">
        <input className="rounded border p-1" placeholder="New profile name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={() => createNewProfile(newName || 'New Profile')}>Create</button>
        <button className="rounded bg-slate-700 px-3 py-1 text-white" onClick={duplicateProfile}>Duplicate</button>
      </div>
      <div className="space-y-2">
        {profiles.map((p) => (
          <div key={p.id} className={`flex items-center gap-2 rounded border p-2 ${p.id === activeProfileId ? 'border-blue-600' : 'border-slate-200'}`}>
            <button className="rounded bg-slate-200 px-2" onClick={() => switchProfile(p.id)}>Load</button>
            <input className="flex-1 rounded border p-1" value={p.name} onChange={(e) => renameProfile(p.id, e.target.value)} />
            <button className="rounded bg-red-600 px-2 text-white" onClick={() => deleteProfile(p.id)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <button className="rounded bg-emerald-700 px-3 py-1 text-white" onClick={() => navigator.clipboard.writeText(exportActiveProfile())}>Copy export JSON</button>
        <textarea className="h-32 w-full rounded border p-2" placeholder="Paste profile JSON here" value={importText} onChange={(e) => setImportText(e.target.value)} />
        <button className="rounded bg-indigo-600 px-3 py-1 text-white" onClick={() => importNewProfile(importText)}>Import JSON</button>
      </div>
    </div>
  );
}
