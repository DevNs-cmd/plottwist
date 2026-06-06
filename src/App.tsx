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
import { SaveState, UserProfile, Episode, Choice, Character, DirectMessage, CastActivity, RealityVaultItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { getAvatarUrl } from './utils';

const LOCAL_STORAGE_KEY = 'plottwist_black_save_state_v1';

const INITIAL_FORECAST = {
  careerPotential: 'Medium' as const,
  socialInfluence: 'Medium' as const,
  relationshipStability: 'Stable' as const,
  hiddenOpportunity: 'None' as const
};

const PORTRAIT_MAPPINGS: Record<string, string> = {
  "Elena Rossi": "/portraits/elena_rossi.png",
  "Marcus Vance": "/portraits/marcus_vance.png",
  "Sloane Cross": "/portraits/sloane_cross.png",
  "Dr. Evelyn Reed": "/portraits/evelyn_reed.png",
  "VC Brandon Pierce": "/portraits/brandon_pierce.png",
  "Alfred Check": "/portraits/alfred_check.png"
};

export default function App() {
  const [state, setState] = useState<SaveState>(() => {
    try {
      let stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) {
        // Fallback to legacy key to migrate in-progress sessions
        stored = localStorage.getItem('plottwist_save_state_mvp_v2');
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.profile) {
          const sanitizedCharacters = (parsed.characters || []).map((char: any) => {
            const defaultMetrics = {
              chemistry: 50,
              trust: 50,
              curiosity: 50,
              closeness: 30,
              interest: 50,
              compatibility: 50
            };
            const defaultChemistry = {
              values: ["Truth", "Control"],
              ambitions: ["Personal sovereignty"],
              preferences: ["Direct talk"],
              communicationStyle: "Raw and direct",
              emotionalTriggers: ["Dishonesty"]
            };

            return {
              ...char,
              archetype: char.archetype || char.role || 'Rival',
              currentState: char.currentState || 'Neutral',
              avatarUrl: getAvatarUrl(char.name, char.avatarUrl),
              attractionMetrics: char.attractionMetrics || defaultMetrics,
              chemistryProfile: char.chemistryProfile || defaultChemistry
            };
          });

          const sanitizedDMs = (parsed.directMessages || []).map((dm: any) => ({
            ...dm,
            senderAvatar: getAvatarUrl(dm.senderName, dm.senderAvatar)
          }));

          const sanitizedActivities = (parsed.castActivities || []).map((act: any) => ({
            ...act,
            characterAvatar: getAvatarUrl(act.characterName, act.characterAvatar)
          }));

          return {
            currentDay: parsed.currentDay || 1,
            profile: parsed.profile,
            characters: sanitizedCharacters,
            episodes: parsed.episodes || [],
            currentEpisode: parsed.currentEpisode || null,
            selectedChoiceId: parsed.selectedChoiceId || null,
            userChoicesHistory: parsed.userChoicesHistory || {},
            systemStatus: parsed.systemStatus || 'dashboard',
            activeUniverse: parsed.activeUniverse || 'Original',
            plotTwistBlackActive: parsed.plotTwistBlackActive ?? parsed.isSubscribed ?? false,
            directMessages: sanitizedDMs,
            castActivities: sanitizedActivities,
            vaultItems: parsed.vaultItems || [],
            forecast: parsed.forecast || INITIAL_FORECAST,
            notifications: parsed.notifications || [],
            lastOpenedTimestamp: parsed.lastOpenedTimestamp || Date.now()
          };
        }
      }
    } catch (e) {
      console.error("Local save state corrupted. Restarting timeline.", e);
    }

    return {
      currentDay: 1,
      profile: null,
      characters: [],
      episodes: [],
      currentEpisode: null,
      selectedChoiceId: null,
      userChoicesHistory: {},
      systemStatus: 'onboarding',
      lastOpenedTimestamp: Date.now(),
      castActivities: [],
      directMessages: [],
      vaultItems: [],
      forecast: INITIAL_FORECAST,
      activeUniverse: 'Original',
      plotTwistBlackActive: false,
      notifications: []
    };
  });

  // Sync state mutations to client local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // mount: Check elapsed time since last opened and trigger Clock Ticks
  useEffect(() => {
    if (state.profile && state.lastOpenedTimestamp) {
      const elapsedHours = Math.floor((Date.now() - state.lastOpenedTimestamp) / (1000 * 60 * 60));
      if (elapsedHours > 0) {
        triggerClockTick(elapsedHours);
      }
    }
  }, [state.profile]);

  const triggerClockTick = async (hours: number) => {
    try {
      const response = await fetch('/api/clock-tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeUniverse: state.activeUniverse,
          elapsedHours: hours,
          characters: state.characters
        })
      });

      if (!response.ok) throw new Error("Clock tick failed.");
      const data = await response.json();

      // Append offline developments and messages
      setState(prev => {
        const updatedDMs = [...prev.directMessages];
        if (data.directMessages && data.directMessages.length > 0) {
          updatedDMs.unshift(...data.directMessages);
        }

        const updatedActivities = [...prev.castActivities];
        if (data.castActivities && data.castActivities.length > 0) {
          updatedActivities.unshift(...data.castActivities);
        }

        // Add to alerts logs
        const newAlerts = [...prev.notifications];
        if (data.directMessages && data.directMessages.length > 0) {
          newAlerts.push(`Incoming Voice message from ${data.directMessages[0].senderName}`);
        } else if (data.castActivities && data.castActivities.length > 0) {
          newAlerts.push("New timeline developments surfaced.");
        }

        return {
          ...prev,
          directMessages: updatedDMs,
          castActivities: updatedActivities,
          notifications: newAlerts,
          lastOpenedTimestamp: Date.now() // reset clock
        };
      });
    } catch (e) {
      console.warn("Reality Clock tick sync failed:", e);
    }
  };

  const handleOnboardingComplete = (
    profile: UserProfile, 
    firstEpisode: Episode, 
    characters: Character[],
    simData?: any
  ) => {
    const sanitizedChars = characters.map(char => ({
      ...char,
      avatarUrl: getAvatarUrl(char.name, char.avatarUrl)
    }));

    const sanitizedActivities = ((firstEpisode as any).castActivities || []).map((act: any) => ({
      ...act,
      characterAvatar: getAvatarUrl(act.characterName, act.characterAvatar)
    }));

    const sanitizedDMs = ((firstEpisode as any).directMessages || []).map((dm: any) => ({
      ...dm,
      senderAvatar: getAvatarUrl(dm.senderName, dm.senderAvatar)
    }));

    // Generate initial DMs, activities, forecasts, and vaults returned during onboarding
    setState(prev => ({
      ...prev,
      profile,
      currentEpisode: firstEpisode,
      characters: sanitizedChars,
      systemStatus: 'dashboard',
      castActivities: sanitizedActivities,
      directMessages: sanitizedDMs,
      vaultItems: (firstEpisode as any).vaultItems || [],
      forecast: (firstEpisode as any).forecast || INITIAL_FORECAST,
      notifications: ["Your timeline universe has successfully compiled."]
    }));
  };

  const handleChoiceSelected = (aftermathResult: any) => {
    const choice: Choice = aftermathResult.originalChoice;
    const nextEpisode: Episode = aftermathResult.nextEpisode;

    // Mutate character metrics
    const updatedCharacters = state.characters.map(char => {
      const matchChange = aftermathResult.relationshipChanges.find(
        (change: any) => change.characterName.toLowerCase() === char.name.toLowerCase()
      );
      if (matchChange) {
        return {
          ...char,
          relationshipScore: Math.min(100, Math.max(-100, char.relationshipScore + matchChange.scoreDelta)),
          currentState: matchChange.currentState || char.currentState,
          attractionMetrics: matchChange.attractionMetrics || char.attractionMetrics,
          pastInteractions: [...char.pastInteractions, matchChange.memoryGained]
        };
      }
      return char;
    });

    // Update alerts notifications logs
    const updatedAlerts = [...state.notifications];
    if (aftermathResult.socialSignals) {
      updatedAlerts.push(...aftermathResult.socialSignals);
    } else {
      updatedAlerts.push("Timeline shifts registered.");
    }

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
      forecast: aftermathResult.forecastChanges || prev.forecast,
      notifications: updatedAlerts,
      lastOpenedTimestamp: Date.now(),
      systemStatus: 'dashboard'
    }));
  };

  const handleSendMessage = (characterId: string, text: string) => {
    const activeChar = state.characters.find(c => c.id === characterId);
    if (!activeChar) return;

    const userMsg: DirectMessage = {
      id: `msg-user-${Date.now()}`,
      senderId: "user",
      senderName: state.profile?.name || "Player",
      senderAvatar: state.profile?.avatarUrl || "",
      text,
      timestamp: "Just now",
      isRead: true
    };

    setState(prev => ({
      ...prev,
      directMessages: [...prev.directMessages, userMsg]
    }));

    // Simulate character delayed reply
    setTimeout(async () => {
      let replyText = `I noticed your message. We need to stay focused on our strategy in this timeline.`;
      
      try {
        const response = await fetch('/api/perspective', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterName: activeChar.name,
            activeUniverse: state.activeUniverse,
            episodeTitle: state.currentEpisode?.title || "Timeline"
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.story) {
            replyText = `${activeChar.name.split(' ')[0]} reports: "${data.story.slice(0, 100)}..."`;
          }
        }
      } catch (e) {
        console.warn("Dynamic reply generator failed.");
      }

      const characterReply: DirectMessage = {
        id: `msg-char-${Date.now()}`,
        senderId: activeChar.id,
        senderName: activeChar.name,
        senderAvatar: activeChar.avatarUrl,
        text: replyText,
        timestamp: "Just now",
        isRead: false
      };

      setState(prev => ({
        ...prev,
        directMessages: [...prev.directMessages, characterReply],
        notifications: [...prev.notifications, `New message from ${activeChar.name}`]
      }));
    }, 1500);
  };

  const handleSelectUniverse = async (universeId: string) => {
    if (!state.plotTwistBlackActive && universeId !== 'Original') {
      setState(prev => ({ ...prev, systemStatus: 'premium' }));
      return;
    }

    // Reset parameters to compile a brand new universe timeline
    setState(prev => ({ 
      ...prev, 
      activeUniverse: universeId, 
      systemStatus: 'onboarding',
      profile: null,
      currentEpisode: null,
      characters: []
    }));
  };

  const triggerResetCampaign = () => {
    if (confirm("Are you sure you want to completely clear your PlotTwist universe profile and progression history?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setState({
        currentDay: 1,
        profile: null,
        characters: [],
        episodes: [],
        currentEpisode: null,
        selectedChoiceId: null,
        userChoicesHistory: {},
        systemStatus: 'onboarding',
        lastOpenedTimestamp: Date.now(),
        castActivities: [],
        directMessages: [],
        vaultItems: [],
        forecast: INITIAL_FORECAST,
        activeUniverse: 'Original',
        plotTwistBlackActive: false,
        notifications: []
      });
    }
  };

  const handleStateMutation = (newState: Partial<SaveState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const triggerEmergencyCrisis = (eventTitle: string, eventText: string) => {
    // Append to alerts logs
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, `Timeline alert: ${eventTitle}`]
    }));
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
              onComplete={(prof, firstEp, chars) => {
                // If the onboard API also returned activities/messages, pass them along
                handleOnboardingComplete(prof, firstEp, chars);
              }} 
              isLoading={state.currentEpisode !== null && state.characters.length > 0 && state.profile !== null}
              setIsLoading={(val) => {
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
              onSendMessage={handleSendMessage}
              onFastForwardTime={triggerClockTick}
              setView={(view) => setState(prev => ({ ...prev, systemStatus: view }))}
              onReset={triggerResetCampaign}
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
              isSubscribed={state.plotTwistBlackActive}
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
              onSubscribe={() => setState(prev => ({ ...prev, plotTwistBlackActive: true }))}
              isSubscribed={state.plotTwistBlackActive}
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
              onFastForwardTime={triggerClockTick}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
