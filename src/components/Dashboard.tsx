/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Users, Sparkles, Gem, AlertTriangle, 
  Map, ArrowRight, Eye, MessageSquare, ShieldCheck, 
  FileText, Compass, Clock, Activity, Share2, Globe, Heart
} from 'lucide-react';
import { SaveState, CastActivity, Character, RealityVaultItem } from '../types';
import CastActivityFeed from './CastActivityFeed';
import CharacterDMs from './CharacterDMs';
import RealityVault from './RealityVault';
import RelationshipMap from './RelationshipMap';
import ShareRealityCard from './ShareRealityCard';

interface DashboardProps {
  state: SaveState;
  onPlayEpisode: () => void;
  onSelectUniverse: (universeId: string) => void;
  onSendMessage: (characterId: string, text: string) => void;
  onFastForwardTime: (hours: number) => void;
  setView: (view: 'onboarding' | 'dashboard' | 'playing' | 'premium' | 'admin') => void;
  onReset: () => void;
}

export default function Dashboard({ 
  state, 
  onPlayEpisode, 
  onSelectUniverse, 
  onSendMessage, 
  onFastForwardTime,
  setView,
  onReset
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'vault' | 'map'>('feed');
  const [shareOpen, setShareOpen] = useState(false);
  const [shareData, setShareData] = useState<{ title: string; desc: string; avatar?: string } | null>(null);
  const [offlineNoticeDismissed, setOfflineNoticeDismissed] = useState(false);

  // Compute time since last opened
  const timeDiffMs = Date.now() - state.lastOpenedTimestamp;
  const elapsedHours = Math.floor(timeDiffMs / (1000 * 60 * 60));
  const showOfflineAlert = elapsedHours > 0 && !offlineNoticeDismissed && state.castActivities.length > 2;

  const handleOpenShare = (title: string, desc: string, avatar?: string) => {
    setShareData({ title, desc, avatar });
    setShareOpen(true);
  };

  const getForecastColor = (val: string) => {
    switch (val) {
      case 'High':
      case 'Rising':
      case 'Stable':
      case 'Unlocked':
        return 'text-emerald-400';
      case 'Low':
      case 'Crashing':
      case 'Critical':
      case 'Missed':
        return 'text-red-400';
      default:
        return 'text-amber-400';
    }
  };

  return (
    <div id="plot_dashboard_root" className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      {/* Dynamic Offline Time Elapsed Alert (Reality Clock feedback) */}
      {showOfflineAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          <div className="flex gap-3">
            <span className="text-2xl animate-bounce">⏱️</span>
            <div>
              <span className="font-mono text-[9px] text-amber-500 font-bold uppercase tracking-widest block">Reality Clock Update</span>
              <h4 className="text-sm font-bold text-white leading-tight font-display">
                While you were away, the timeline continued...
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1">
                About {elapsedHours} hours passed. {state.castActivities.slice(0, 3).length} developments occurred in your social network.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('feed');
                setOfflineNoticeDismissed(true);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl text-xs font-mono"
            >
              Review Feed
            </button>
            <button
              type="button"
              onClick={() => setOfflineNoticeDismissed(true)}
              className="text-xs font-mono text-zinc-500 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* OVERSIZED HERO SECTION: CURRENT REALITY */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-neutral-950 to-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Glow indicators */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎬</span>
              <span className="font-mono text-[10px] tracking-widest text-red-500 font-bold uppercase">PlotTwist Active Reality</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-black text-white leading-none tracking-tight">
              {state.activeUniverse === 'Original' ? 'Original Arc' : state.activeUniverse} Arc
            </h2>

            <p className="text-sm text-zinc-400 font-sans italic leading-relaxed">
              "{state.profile?.summary || 'Weaving your initial timeline strands...'}"
            </p>

            {/* Social signals bar */}
            {state.notifications && state.notifications.length > 0 && (
              <div className="p-3 bg-zinc-900/60 border border-zinc-850/80 rounded-2xl flex items-start gap-2.5 text-xs text-zinc-300">
                <span className="text-amber-500 shrink-0">❖</span>
                <span className="italic">"{state.notifications[state.notifications.length - 1]}"</span>
              </div>
            )}
          </div>

          {/* TIMELINE FORECAST PANEL */}
          <div className="w-full lg:w-72 bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl space-y-4 shadow-xl">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1.5 pb-2 border-b border-zinc-900">
              <Compass className="w-3.5 h-3.5" /> Future Outlook
            </h4>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase text-[9px]">Career Potential:</span>
                <span className={`font-bold ${getForecastColor(state.forecast.careerPotential)}`}>
                  {state.forecast.careerPotential}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase text-[9px]">Social Influence:</span>
                <span className={`font-bold ${getForecastColor(state.forecast.socialInfluence)}`}>
                  {state.forecast.socialInfluence}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase text-[9px]">Relations Stability:</span>
                <span className={`font-bold ${getForecastColor(state.forecast.relationshipStability)}`}>
                  {state.forecast.relationshipStability}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase text-[9px]">Secret Opportunities:</span>
                <span className={`font-bold ${getForecastColor(state.forecast.hiddenOpportunity)}`}>
                  {state.forecast.hiddenOpportunity}
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => handleOpenShare("Timeline Forecast Unlocked", `My current timeline career potential is ${state.forecast.careerPotential} and relations stability is ${state.forecast.relationshipStability}.`)}
              className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-850 rounded-lg text-[9px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-zinc-850"
            >
              <Share2 className="w-3 h-3" /> Share Forecast Card
            </button>
          </div>
        </div>

        {/* Action footer */}
        <div className="relative z-10 pt-8 border-t border-zinc-900/60 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs text-zinc-500">Day {state.currentDay} event active</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onPlayEpisode}
              className="flex-1 sm:flex-initial px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/20"
            >
              <Play className="w-4 h-4 fill-white" />
              Open Active Event
            </button>
          </div>
        </div>
      </div>

      {/* DUAL TIMELINE REALITY SELECTOR */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">
          Parallel Realities (Universe select)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: "Original", name: "Original Arc", label: "Street Drama", icon: "🏙️" },
            { id: "Billionaire", name: "Billionaire", label: "Yacht Mergers", icon: "💎", premium: true },
            { id: "Celebrity", name: "Hollywood", label: "Red Carpets", icon: "🎬", premium: true },
            { id: "Founder", name: "Tech Founder", label: "VC Backstabs", icon: "🦄", premium: true }
          ].map(uni => {
            const isSelected = state.activeUniverse === uni.id;
            const handleSelect = () => {
              if (uni.premium && !state.plotTwistBlackActive) {
                setView('premium');
                return;
              }
              onSelectUniverse(uni.id);
            };

            return (
              <button
                key={uni.id}
                onClick={handleSelect}
                type="button"
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-zinc-900 border-zinc-500 text-white shadow-lg' 
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="flex gap-2.5 items-center">
                  <span className="text-xl">{uni.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold font-display tracking-tight text-white flex items-center justify-between">
                      <span className="truncate">{uni.name}</span>
                      {uni.premium && !state.plotTwistBlackActive && (
                        <Gem className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">{uni.label}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE WORKSPACE TABS */}
      <div className="space-y-6">
        {/* Navigation tabs */}
        <div className="flex border-b border-zinc-900 pb-px font-mono text-xs uppercase overflow-x-auto">
          {[
            { id: 'feed', label: 'Reality Feed', count: state.castActivities.length, icon: <Activity className="w-4 h-4" /> },
            { id: 'chat', label: 'Cast Inbox', count: state.directMessages.filter(m => !m.isRead).length, icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'vault', label: 'Secrets Vault', count: state.vaultItems.filter(v => !v.isLocked).length, icon: <FileText className="w-4 h-4" /> },
            { id: 'map', label: 'Intelligence Map', count: null, icon: <Map className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              type="button"
              className={`py-3 px-6 text-center font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === tab.id 
                  ? 'text-white border-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 ? (
                <span className="ml-1.5 px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] rounded-full">
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab workspace panels */}
        <div className="pt-2">
          {activeTab === 'feed' && (
            <CastActivityFeed 
              activities={state.castActivities} 
              onShareActivity={(act) => handleOpenShare(act.characterName + "'s Development", act.message, act.characterAvatar)}
            />
          )}

          {activeTab === 'chat' && (
            <CharacterDMs
              characters={state.characters}
              messages={state.directMessages}
              onSendMessage={onSendMessage}
              plotTwistBlackActive={state.plotTwistBlackActive}
              onUpgradePrompt={() => setView('premium')}
            />
          )}

          {activeTab === 'vault' && (
            <RealityVault
              items={state.vaultItems}
              plotTwistBlackActive={state.plotTwistBlackActive}
              onUpgradePrompt={() => setView('premium')}
            />
          )}

          {activeTab === 'map' && (
            <RelationshipMap
              characters={state.characters}
              profileName={state.profile?.name || 'Player'}
              plotTwistBlackActive={state.plotTwistBlackActive}
              onUpgradePrompt={() => setView('premium')}
            />
          )}
        </div>
      </div>

      {/* SHAREABLE OVERLAY COMPONENT */}
      {shareOpen && shareData && (
        <ShareRealityCard
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          title={shareData.title}
          description={shareData.desc}
          characterAvatar={shareData.avatar}
          forecastText={`${state.forecast.careerPotential} / ${state.forecast.relationshipStability}`}
        />
      )}

    </div>
  );
}
