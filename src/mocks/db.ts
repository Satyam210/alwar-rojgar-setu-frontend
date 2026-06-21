import type {
  Application,
  CandidateProfile,
  EmployerDocument,
  EmployerProfile,
  Job,
  Role,
} from '@/api/types';
import { createSeedDb } from './seed';

/** A mock auth account. The access token in the app encodes `userId`. */
export interface MockUser {
  userId: string;
  phone: string;
  role: Role;
  profileCompleted: boolean;
  isActive: boolean;
}

export interface MockDb {
  users: MockUser[];
  candidateProfiles: CandidateProfile[];
  employerProfiles: EmployerProfile[];
  employerDocuments: EmployerDocument[];
  jobs: Job[];
  applications: Application[];
  /** Emulates the httpOnly refresh cookie so sessions survive page reloads. */
  sessionUserId: string | null;
  /** phone → role chosen at OTP-request time (verify carries no role). */
  pendingRole: Record<string, Role>;
}

const STORAGE_KEY = 'ars_mock_db_v2';

let db: MockDb | null = null;

function persistRaw(value: MockDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
}

function load(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    /* fall through to seed */
  }
  const seeded = createSeedDb();
  persistRaw(seeded);
  return seeded;
}

export function getDb(): MockDb {
  if (!db) db = load();
  return db;
}

/** Write the current in-memory DB back to localStorage. */
export function persist(): void {
  if (db) persistRaw(db);
}

/** Load (and seed if absent) — called once at install time. */
export function ensureSeeded(): void {
  getDb();
}

/** Wipe back to the original seed data. */
export function resetDb(): void {
  db = createSeedDb();
  persistRaw(db);
}
