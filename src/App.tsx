/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import EpisodePlayer from './components/EpisodePlayer';
import SubscriptionModal from './components/SubscriptionModal';
import AdminDashboard from './components/AdminDashboard';
import { SaveState, UserProfile, Episode, Choice, Character } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, PlusCircle, CheckCircle, Trophy, Sparkles, Wand2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'plottwist_save_state_mvp_v2';

const INITIAL_REPUTATION = {
  charisma: 50,
  intelligence: 50,
  mystery: 50,
  popularity: 50,
  influence: 50
};

export default function App() {
  const [state, setState] = useState<SaveState>(() => {
    // Attempt local storage recall for session consistency
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.profile) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Local save state corrupted. Starting from scratch.", e);
    }

    return {
      currentDay: 1,
      profile: null,
      reputation: INITIAL_REPUTATION,
      characters: [],
      episodes: [],
      currentEpisode: null,
      selectedChoiceId: null,
      userChoicesHistory: {},
      systemStatus: 'onboarding',
      xp: 0,
      level: 1,
      streak: 1,
      lastPlayedDate: null,
      activeUniverse: 'Original',
      isSubscribed: false
    };
  });

  const [activeEmergencyEvent, setActiveEmergencyEvent] = useState<{title: string, info: string, isTriggered: boolean} | null>(null);
  const [levelUpFanfare, setLevelUpFanfare] = useState<number | null>(null);

  // Sync state mutations to client local storage for durable retention loops
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleOnboardingComplete = (profile: UserProfile, firstEpisode: Episode, characters: Character[]) => {
    setState(prev => ({
      ...prev,
      profile,
      currentEpisode: firstEpisode,
      characters,
      systemStatus: 'dashboard'
    }));
  };

  const handleChoiceSelected = (aftermathResult: any) => {
    const choice: Choice = aftermathResult.originalChoice;
    const nextEpisode: Episode = aftermathResult.nextEpisode;

    // Mutate character vectors
    const updatedCharacters = state.characters.map(char => {
      const matchChange = aftermathResult.relationshipChanges.find(
        (change: any) => change.characterName.toLowerCase() === char.name.toLowerCase()
      );
      if (matchChange) {
        return {
          ...char,
          relationshipScore: Math.min(100, Math.max(-100, char.relationshipScore + matchChange.scoreDelta)),
          pastInteractions: [...char.pastInteractions, matchChange.memoryGained]
        };
      }
      return char;
    });

    // Mutate reputation meters
    const updatedReputation = { ...state.reputation };
    Object.entries(aftermathResult.reputationChanges || {}).forEach(([key, value]) => {
      const statKey = key as keyof typeof INITIAL_REPUTATION;
      if (updatedReputation[statKey] !== undefined) {
        updatedReputation[statKey] = Math.min(100, Math.max(0, updatedReputation[statKey] + (value as number)));
      }
    });

    // Manage XP and Level progression
    let newXp = state.xp + 35;
    let newLevel = state.level;
    const threshold = state.level * 100;
    
    if (newXp >= threshold) {
      newXp = newXp - threshold;
      newLevel = state.level + 1;
      setLevelUpFanfare(newLevel);
    }

    // Capture date tracker to evaluate active streak retention loops
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = state.streak;
    
    if (state.lastPlayedDate && state.lastPlayedDate !== todayStr) {
      const lastDate = new Date(state.lastPlayedDate);
      const diffTime = Math.abs(new Date(todayStr).getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak = state.streak + 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Streak reset
      }
    }

    // Push into recap feeds history
    const oldEpisode = { 
      ...state.currentEpisode!, 
      userChoiceMade: choice.text 
    };

    setState(prev => ({
      ...prev,
      episodes: [...prev.episodes, oldEpisode],
      currentEpisode: nextEpisode,
      currentDay: prev.currentDay + 1,
      characters: updatedCharacters,
      reputation: updatedReputation,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastPlayedDate: todayStr,
      systemStatus: 'dashboard'
    }));
  };

  const handleSelectUniverse = async (universeId: string) => {
    if (!state.isSubscribed && universeId !== 'Original') {
      setState(prev => ({ ...prev, systemStatus: 'premium' }));
      return;
    }

    // Show loading sequence
    setState(prev => ({ ...prev, activeUniverse: universeId, systemStatus: 'onboarding' }));
  };

  const triggerResetCampaign = () => {
    if (confirm("Are you sure you want to completely clear your PlotTwist universe, user profile, and progression history?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setState({
        currentDay: 1,
        profile: null,
        reputation: INITIAL_REPUTATION,
        characters: [],
        episodes: [],
        currentEpisode: null,
        selectedChoiceId: null,
        userChoicesHistory: {},
        systemStatus: 'onboarding',
        xp: 0,
        level: 1,
        streak: 1,
        lastPlayedDate: null,
        activeUniverse: 'Original',
        isSubscribed: false
      });
    }
  };

  const handleStateMutation = (newState: Partial<SaveState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const triggerEmergencyCrisis = (eventTitle: string, eventText: string) => {
    setActiveEmergencyEvent({
      title: eventTitle,
      info: eventText,
      isTriggered: true
    });
  };

  const handleApplyEmergencyChoice = (bondScoreDelta: number) => {
    // Select random character and adjust their relationship on emergency pop up
    if (state.characters.length > 0) {
      const idx = Math.floor(Math.random() * state.characters.length);
      const target = state.characters[idx];
      const updated = state.characters.map((c, i) => {
        if (i === idx) {
          return {
            ...c,
            relationshipScore: Math.min(100, Math.max(-100, c.relationshipScore + bondScoreDelta)),
            pastInteractions: [...c.pastInteractions, `Incident: Choice on ${activeEmergencyEvent?.title}`]
          };
        }
        return c;
      });

      setState(prev => ({
        ...prev,
        characters: updated,
        streak: prev.streak + 1 // Rewarded by interaction!
      }));
    }
    setActiveEmergencyEvent(null);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500 selection:text-white pb-16 relative">
      <Navbar 
        state={state} 
        setView={(view) => setState(prev => ({ ...prev, systemStatus: view }))}
        onReset={triggerResetCampaign}
      />

      <AnimatePresence mode="wait">
        
        {/* VIEW: ONBOARDING SCREEN */}
        {state.systemStatus === 'onboarding' && (
          <motion.div 
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Onboarding 
              onComplete={handleOnboardingComplete} 
              isLoading={state.currentEpisode !== null && state.characters.length > 0 && state.profile !== null}
              setIsLoading={(val) => {
                // Clear state if we are beginning a new onboarding
                if (val) {
                  setState(prev => ({
                    ...prev,
                    profile: null,
                    currentEpisode: null,
                    characters: []
                  }));
                }
              }}
            />
          </motion.div>
        )}

        {/* VIEW: SERIES SHOWFEED HUB */}
        {state.systemStatus === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <Dashboard 
              state={state}
              onPlayEpisode={() => setState(prev => ({ ...prev, systemStatus: 'playing' }))}
              onSelectUniverse={handleSelectUniverse}
              triggerEmergencyEvent={triggerEmergencyCrisis}
              setView={(view) => setState(prev => ({ ...prev, systemStatus: view }))}
            />
          </motion.div>
        )}

        {/* VIEW: ACTIVE PLAY SCREEN */}
        {state.systemStatus === 'playing' && state.currentEpisode && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EpisodePlayer 
              state={state}
              episode={state.currentEpisode}
              onChoiceSelected={handleChoiceSelected}
              onClose={() => setState(prev => ({ ...prev, systemStatus: 'dashboard' }))}
              isSubscribed={state.isSubscribed}
              setView={(view) => setState(prev => ({ ...prev, systemStatus: view }))}
            />
          </motion.div>
        )}

        {/* VIEW: PREMIUM CART LOCKER */}
        {state.systemStatus === 'premium' && (
          <motion.div 
            key="premium"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <SubscriptionModal 
              onSubscribe={() => setState(prev => ({ ...prev, isSubscribed: true }))}
              isSubscribed={state.isSubscribed}
              onClose={() => setState(prev => ({ ...prev, systemStatus: 'dashboard' }))}
            />
          </motion.div>
        )}

        {/* VIEW: ADMIN PANEL CONSOLE */}
        {state.systemStatus === 'admin' && (
          <motion.div 
            key="admin"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <AdminDashboard 
              state={state}
              onUpdateState={handleStateMutation}
              onClose={() => setState(prev => ({ ...prev, systemStatus: 'dashboard' }))}
              onForceEvent={triggerEmergencyCrisis}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* FLOATING LEVEL UP PROGRESS CELEBRATION */}
      {levelUpFanfare !== null && (
        <div id="level_fanfare_modal" className="fixed inset-0 flex items-center justify-center bg-black/80 z-60 px-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-amber-500 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 glow-ambient"
          >
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-yellow-400 text-3xl flex items-center justify-center rounded-full mx-auto animate-bounce">
              🎖️
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[9px] tracking-widest text-amber-500 uppercase font-bold">Show Level Unlocked</span>
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">Level {levelUpFanfare}!</h3>
              <p className="text-xs text-zinc-400">
                Congratulations, your TV-protagonist character rating has evolved. You earned new status!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLevelUpFanfare(null)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-xs uppercase tracking-widest font-black rounded-xl transition-all cursor-pointer"
            >
              Continue Play
            </button>
          </motion.div>
        </div>
      )}

      {/* EMERGENCY CRISIS POPUP DIALOG */}
      {activeEmergencyEvent?.isTriggered && (
        <div id="emergency_dialog_backdrop" className="fixed inset-0 flex items-center justify-center bg-black/90 z-60 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="bg-gradient-to-br from-zinc-950 via-zinc-950 to-red-950/20 border-2 border-red-500 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <span className="font-mono text-[9px] text-red-500 font-black uppercase tracking-widest block">EMERGENCY STORY INTERRUPT</span>
                <h3 className="text-xl font-display font-black text-white">{activeEmergencyEvent.title}</h3>
              </div>
            </div>

            <p className="text-sm font-sans text-zinc-300 leading-relaxed italic">
              "{activeEmergencyEvent.info}"
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Crisis Choices:</span>
              
              <button
                type="button"
                onClick={() => handleApplyEmergencyChoice(15)}
                className="w-full text-left p-3.5 bg-zinc-900 border border-zinc-805 rounded-xl text-xs hover:bg-zinc-850 hover:border-red-500/30 font-semibold text-white transition-all flex items-center justify-between"
              >
                <span>Assertively push back and claim black-ledger files are doctored.</span>
                <span className="text-[10px] text-zinc-500 font-mono shrink-0">+15% Bond</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyEmergencyChoice(-15)}
                className="w-full text-left p-3.5 bg-zinc-900 border border-zinc-805 rounded-xl text-xs hover:bg-zinc-850 hover:border-red-500/30 font-semibold text-white transition-all flex items-center justify-between"
              >
                <span>Ignore the trap and completely double-cross their alliance.</span>
                <span className="text-[10px] text-zinc-500 font-mono shrink-0">-15% Bond</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <span className="font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">
                • DECIDE AND SURVIVE
              </span>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
