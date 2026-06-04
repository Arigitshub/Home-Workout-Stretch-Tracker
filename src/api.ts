import { UserProfile, Routine, WorkoutLog } from './types';

const API_BASE = 'http://localhost:3001/api';

export async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/profile`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfileOnServer(profile: UserProfile): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function fetchCustomRoutines(): Promise<Routine[]> {
  const res = await fetch(`${API_BASE}/custom-routines`);
  if (!res.ok) throw new Error('Failed to fetch custom routines');
  return res.json();
}

export async function saveCustomRoutine(routine: Routine): Promise<Routine> {
  const res = await fetch(`${API_BASE}/custom-routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routine)
  });
  if (!res.ok) throw new Error('Failed to save custom routine');
  return res.json();
}

export async function fetchLogs(): Promise<WorkoutLog[]> {
  const res = await fetch(`${API_BASE}/logs`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function saveLog(log: WorkoutLog): Promise<WorkoutLog> {
  const res = await fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  });
  if (!res.ok) throw new Error('Failed to save log');
  return res.json();
}

export async function deleteLog(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/logs/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete log');
}
