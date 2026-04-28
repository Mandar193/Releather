import { UserProfile, LeatherItem } from '../types';

const API_BASE = '/api';

export const api = {
  // Users
  async getUser(uid: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/users/${uid}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  async upsertUser(user: Partial<UserProfile>): Promise<void> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Failed to save user');
  },

  // Items
  async getItems(sellerId?: string): Promise<LeatherItem[]> {
    const url = sellerId ? `${API_BASE}/items?sellerId=${sellerId}` : `${API_BASE}/items`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },

  async createItem(item: Partial<LeatherItem>): Promise<void> {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to create item');
  },

  async deleteItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete item');
  },

  async updateItem(id: string, updates: { status: string; note?: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update item');
  },

  async createTransaction(tx: { itemId: string; buyerId: string; sellerId: string; amount: number }): Promise<void> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    if (!res.ok) throw new Error('Failed to record transaction');
  }
};
