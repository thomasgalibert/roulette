import type { Person, Winner, SpinResult } from '../types/index';

const API_BASE = 'http://localhost:8080/api';

export const api = {
  // Person endpoints
  async getPersons(): Promise<Person[]> {
    const response = await fetch(`${API_BASE}/persons`);
    if (!response.ok) throw new Error('Failed to fetch persons');
    return response.json();
  },

  async createPerson(name: string): Promise<Person> {
    const response = await fetch(`${API_BASE}/persons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create person');
    return response.json();
  },

  async updatePerson(id: number, updates: Partial<Person>): Promise<Person> {
    const response = await fetch(`${API_BASE}/persons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update person');
    return response.json();
  },

  async deletePerson(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/persons/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete person');
  },

  async updatePresence(id: number, present: boolean): Promise<Person> {
    const response = await fetch(`${API_BASE}/persons/${id}/presence`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ present }),
    });
    if (!response.ok) throw new Error('Failed to update presence');
    return response.json();
  },

  async toggleAllPresence(present: boolean): Promise<void> {
    const response = await fetch(`${API_BASE}/persons/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ present }),
    });
    if (!response.ok) throw new Error('Failed to toggle all presence');
  },

  // Roulette endpoints
  async spinRoulette(): Promise<SpinResult> {
    const response = await fetch(`${API_BASE}/roulette/spin`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to spin roulette');
    }
    return response.json();
  },

  async getWinHistory(): Promise<Winner[]> {
    const response = await fetch(`${API_BASE}/roulette/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  async resetWinCounts(): Promise<void> {
    const response = await fetch(`${API_BASE}/roulette/reset`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset win counts');
  },

  async resetPersonWins(id: number): Promise<Person> {
    const response = await fetch(`${API_BASE}/persons/${id}/reset-wins`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset person wins');
    return response.json();
  },
};