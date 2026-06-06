/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RelationshipArchetype = 
  | 'Romantic Interest' 
  | 'Forbidden Attraction' 
  | 'Former Connection' 
  | 'Unresolved Tension' 
  | 'Secret Admirer' 
  | 'Social Magnet' 
  | 'High-Status Figure'
  | 'Rival';

export interface AttractionMetrics {
  chemistry: number;      // 0 to 100
  trust: number;          // 0 to 100
  curiosity: number;      // 0 to 100
  closeness: number;      // 0 to 100
  interest: number;       // 0 to 100
  compatibility: number;  // 0 to 100
}

export interface CharacterChemistry {
  values: string[];
  ambitions: string[];
  preferences: string[];
  communicationStyle: string;
  emotionalTriggers: string[];
}

export interface UserProfile {
  name: string;
  age: number;
  interests: string[];
  personalityTraits: string[];
  goals: string;
  relationshipPreferences: string;
  careerStatus: string;
  avatarUrl: string;
  summary?: string; // AI generated summarizing personality
}

export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  timestamp: string;
  likes: number;
}

export interface Character {
  id: string;
  name: string;
  archetype: RelationshipArchetype;
  relationshipScore: number; // -100 to 100 (overall bond)
  description: string;
  avatarUrl: string; // Editorial casting portrait
  currentState: 'Intrigued' | 'Jealous' | 'Protective' | 'Distant' | 'Intimate' | 'Neutral';
  pastInteractions: string[]; // episodic memories
  attractionMetrics: AttractionMetrics;
  chemistryProfile: CharacterChemistry;
  instagramPosts?: InstagramPost[]; // Fallback compatibility / simple posts
}

export interface Choice {
  id: string;
  text: string;
  consequenceShort: string;
  forecastImpact: {
    careerPotential?: number; // delta
    socialInfluence?: number; // delta
    relationshipStability?: number; // delta
  };
  relationshipImpact: {
    [characterName: string]: number; // delta for relationshipScore
  };
}

export interface Episode {
  id: string; // "day-1", "day-2", etc.
  title: string;
  summary: string;
  story: string[]; // split into paragraphs
  cliffhanger: string;
  choices: Choice[];
  bannerUrl?: string;
}

export interface CastActivity {
  id: string;
  characterName: string;
  characterAvatar: string;
  timestamp: string; // e.g. "2 hours ago"
  message: string;
  type: 'action' | 'cryptic' | 'event' | 'relationship' | 'rumor' | 'forecast';
}

export interface DirectMessage {
  id: string;
  senderId: string; // Character ID or "user"
  senderName: string;
  senderAvatar: string;
  text: string;
  audioUrl?: string; // base64 narration audio payload
  timestamp: string; // e.g. "4:12 PM"
  isRead: boolean;
  isVoiceNote?: boolean;
}

export interface RealityVaultItem {
  id: string;
  title: string;
  description: string;
  content: string; // Secret decryption file reveal
  isLocked: boolean;
  unlockCondition: string; // e.g., "Requires Evelyn Reed Bond > 40%"
  type: 'confession' | 'intelligence' | 'alliance' | 'future';
  unlockProgress?: number; // Current value
  unlockTarget?: number; // Target value
}

export interface TimelineForecast {
  careerPotential: 'Low' | 'Medium' | 'High' | 'Rising' | 'Crashing';
  socialInfluence: 'Low' | 'Medium' | 'High' | 'Rising' | 'Crashing';
  relationshipStability: 'Uncertain' | 'Stable' | 'Friction' | 'Tension' | 'Critical';
  hiddenOpportunity: 'None' | 'Detected' | 'Unlocked' | 'Missed';
}

export interface SaveState {
  currentDay: number;
  profile: UserProfile | null;
  characters: Character[];
  episodes: Episode[]; // played history
  currentEpisode: Episode | null;
  selectedChoiceId: string | null;
  userChoicesHistory: Record<string, string>;
  systemStatus: 'onboarding' | 'dashboard' | 'playing' | 'premium' | 'admin';
  lastOpenedTimestamp: number; // epoch ms for Reality Clock
  castActivities: CastActivity[];
  directMessages: DirectMessage[];
  vaultItems: RealityVaultItem[];
  forecast: TimelineForecast;
  activeUniverse: string; // "Original", "Billionaire", "Celebrity", "Founder"
  plotTwistBlackActive: boolean;
  notifications: string[]; // Alerts logs
}
