export type ItemStatus = 'pending' | 'marketplace' | 'sold' | 'recycling' | 'recycled';

export interface SustainabilityScore {
  itemsResold: number;
  itemsRecycled: number;
  co2Saved: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  sustainabilityScore: SustainabilityScore;
  role: 'user' | 'admin' | 'recycler';
}

export interface AIAnalysis {
  condition: 'New' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
  suggestedPrice: number;
  confidence: number;
  notes: string;
}

export interface LifecycleEvent {
  status: ItemStatus;
  timestamp: string;
  note: string;
}

export interface LeatherItem {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  brand?: string;
  images: string[];
  aiAnalysis?: AIAnalysis;
  listedPrice?: number;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  lifecycleHistory: LifecycleEvent[];
}

export interface ItemTransaction {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  createdAt: string;
  status: 'completed' | 'refunded';
}
