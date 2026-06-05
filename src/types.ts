/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export interface Character {
  id: string;
  name: string;
  role: 'Ally' | 'Rival' | 'Love Interest' | 'Mentor' | 'Mystery Contact';
  relationshipScore: number; // -100 to 100
  description: string;
  avatarUrl: string;
  pastInteractions: string[]; // episodic memories
}

export interface Choice {
  id: string;
  text: string;
  consequenceShort: string;
  statImpact: {
    charisma?: number;
    intelligence?: number;
    mystery?: number;
    popularity?: number;
    influence?: number;
  };
  relationshipImpact: {
    [characterName: string]: number; // e.g. "Rival Name": -10, etc.
  };
}

export interface Episode {
  id: string; // "day-1", "day-2", etc. or "custom-X"
  title: string;
  summary: string;
  story: string[]; // split into readable paragraphs
  cliffhanger: string;
  choices: Choice[];
  bannerUrl?: string; // Story episode backdrop
}

export interface ReputationScores {
  charisma: number; // 0 to 100
  intelligence: number;
  mystery: number;
  popularity: number;
  influence: number;
}

export interface SaveState {
  currentDay: number; // day on, e.g. 1, 2, 3...
  profile: UserProfile | null;
  reputation: ReputationScores;
  characters: Character[];
  episodes: Episode[]; // historical episodes played
  currentEpisode: Episode | null; // active episode
  selectedChoiceId: string | null; // choice user made for currentEpisode
  userChoicesHistory: Record<string, string>; // maps episodeId -> choiceId selected
  systemStatus: 'onboarding' | 'dashboard' | 'playing' | 'premium' | 'admin';
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string | null; // YYYY-MM-DD
  activeUniverse: string; // "Original", "Billionaire", "Celebrity", "Founder"
  isSubscribed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}
