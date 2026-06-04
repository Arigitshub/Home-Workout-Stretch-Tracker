import { UserProfile, Routine, WorkoutLog } from './types';

const API_BASE = 'http://localhost:3001/api';

function getHeaders(): HeadersInit {
  const userId = localStorage.getItem('fittrack_user_id') || '';
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId
  };
}

export async function login(email: string, pin: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pin })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to log in');
  }
  return res.json(); // returns { userId, email, phone }
}

export async function signup(email: string, pin: string, phone: string) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pin, phone })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to sign up');
  }
  return res.json(); // returns { userId, email, phone }
}

export async function syncUserData(
  profile: UserProfile,
  customRoutines: Routine[],
  logs: WorkoutLog[]
) {
  const res = await fetch(`${API_BASE}/auth/sync`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ profile, customRoutines, logs })
  });
  if (!res.ok) throw new Error('Failed to sync local data');
  return res.json();
}

export async function fetchProfile(): Promise<UserProfile> {
  const userId = localStorage.getItem('fittrack_user_id');
  if (!userId) {
    const cached = localStorage.getItem('fittrack_profile');
    if (cached) return JSON.parse(cached);
    return {
      name: 'Champion Athlete',
      xp: 0,
      dailyMinutesGoal: 15,
      dailyStretchesGoal: 1,
      weightKg: 70
    };
  }
  const res = await fetch(`${API_BASE}/profile`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfileOnServer(profile: UserProfile): Promise<UserProfile> {
  const userId = localStorage.getItem('fittrack_user_id');
  if (!userId) {
    localStorage.setItem('fittrack_profile', JSON.stringify(profile));
    return profile;
  }
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function fetchCustomRoutines(): Promise<Routine[]> {
  const userId = localStorage.getItem('fittrack_user_id');
  if (!userId) {
    const cached = localStorage.getItem('fittrack_custom_routines');
    return cached ? JSON.parse(cached) : [];
  }
  const res = await fetch(`${API_BASE}/custom-routines`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch custom routines');
  return res.json();
}

export async function saveCustomRoutine(routine: Routine): Promise<Routine> {
  const userId = localStorage.getItem('fittrack_user_id');
  if (!userId) {
    const cached = localStorage.getItem('fittrack_custom_routines');
    const routines: Routine[] = cached ? JSON.parse(cached) : [];
    routines.push(routine);
    localStorage.setItem('fittrack_custom_routines', JSON.stringify(routines));
    return routine;
  }
  const res = await fetch(`${API_BASE}/custom-routines`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(routine)
  });
  if (!res.ok) throw new Error('Failed to save custom routine');
  return res.json();
}

export async function fetchLogs(): Promise<WorkoutLog[]> {
  const userId = localStorage.getItem('fittrack_user_id');
  if (!userId) {
    const cached = localStorage.getItem('fittrack_logs');
    return cached ? JSON.parse(cached) : [];
  }
  const res = await fetch(`${API_BASE}/logs`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function saveLog(log: WorkoutLog): Promise<WorkoutLog> {
  const userId = localStorage.getItem('fittrack_user_id');
  if (!userId) {
    const cached = localStorage.getItem('fittrack_logs');
    const logs: WorkoutLog[] = cached ? JSON.parse(cached) : [];
    logs.push(log);
    localStorage.setItem('fittrack_logs', JSON.stringify(logs));
    return log;
  }
  const res = await fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(log)
  });
  if (!res.ok) throw new Error('Failed to save log');
  return res.json();
}

export async function deleteLog(id: string): Promise<void> {
  const userId = localStorage.getItem('fittrack_user_id');
  if (!userId) {
    const cached = localStorage.getItem('fittrack_logs');
    const logs: WorkoutLog[] = cached ? JSON.parse(cached) : [];
    const filtered = logs.filter((l) => l.id !== id);
    localStorage.setItem('fittrack_logs', JSON.stringify(filtered));
    return;
  }
  const res = await fetch(`${API_BASE}/logs/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete log');
}
