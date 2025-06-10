export interface Person {
  id: number;
  name: string;
  present: boolean;
  win_count: number;
  last_win: string | null;
  last_win_reset: string | null;
  created_at: string;
  updated_at: string;
}

export interface Winner {
  id: number;
  person_id: number;
  person: Person;
  won_at: string;
  created_at: string;
}

export interface SpinResult {
  winner: Person;
  total_participants: number;
}