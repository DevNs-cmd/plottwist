/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, Users, Star, Brain, Sparkles, Gem, AlertTriangle, ShieldCheck, 
  Map, Trophy, Flame, Swords, ArrowRight, UserCheck, FlameKindling, Wand2 
} from 'lucide-react';
import { SaveState, Character, Episode } from '../types';

interface DashboardProps {
  state: SaveState;
  onPlayEpisode: () => void;
  onSelectUniverse: (universeId: string) => void;
  triggerEmergencyEvent: (eventTitle: string, eventText: string) => void;
  setView: (view: 'onboarding' | 'dashboard' | 'playing' | 'premium' | 'admin') => void;
}

export default function Dashboard({ state, onPlayEpisode, onSelectUniverse, triggerEmergencyEvent, setView }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'episodes' | 'characters' | 'stats'>('episodes');

  // Static list for dynamic emergency twists to trigger a play pop-up
  const RANDOM_TWISTS = [
    { title: "Rival Syndicate Threat", info: "Your rival julian Vance just sent an anonymous drive containing photos of you at the dock." },
    { title: "Romantic Blackmail Letter", info: "Your love interest left a voicemail claiming they know about your secondary ledger." },
    { title: "A Sudden Ally Betrayal", info: "An encrypted text message went off. Your partner in crime has sold the decryption key." },
    { title: "Paparazzi Exposure Scandal", info: "Photographs of your midnight rendezvous were uploaded to a private forum." }
  ];

  const handleTriggerRandomTwist = () => {
    const randomIdx = Math.floor(Math.random() * RANDOM_TWISTS.length);
    const selected = RANDOM_TWISTS[randomIdx];
    triggerEmergencyEvent(selected.title, selected.info);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Love Interest': return 'text-pink-400 border-pink-500/20 bg-pink-500/5';
      case 'Rival': return 'text-red-400 border-red-500/20 bg-red-500/5';
      case 'Mentor': return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
      default: return 'text-purple-400 border-purple-500/20 bg-purple-500/5';
    }
  };

  return (
    <div id="plot_dashboard" className="max-w-6xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
      
      {/* 2/3 COLUMN: EPISODE FEED & REALITY SWITCHER */}
      <div className="flex-1 space-y-8">
        
        {/* Cinematic Welcome Header */}
        <div className="card-backdrop-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-red-950/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="font-mono text-xs tracking-widest text-zinc-500 uppercase">PROTAGONIST DOSSIER</span>
              </div>
              <h2 className="text-3xl font-display font-black text-white tracking-tight sm:text-4xl">
                {state.profile?.name}
              </h2>
              <p className="text-sm text-zinc-300 font-sans max-w-xl italic leading-relaxed">
                "{state.profile?.summary || 'Weaving your initial timeline strands...'}"
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {state.profile?.personalityTraits.map(trait => (
                  <span key={trait} className="font-mono text-[10px] bg-zinc-800 border border-zinc-750 text-zinc-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {trait}
                  </span>
                ))}
                {state.profile?.interests.map(interest => (
                  <span key={interest} className="font-mono text-[10px] bg-red-500/5 border border-red-500/15 text-red-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-4 text-center">
              <div className="bg-zinc-900/80 border border-zinc-800/80 px-4 py-3 rounded-2xl w-28">
                <div className="text-amber-500 text-xl font-display font-black tracking-tight">{state.streak}D</div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Streak</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800/80 px-4 py-3 rounded-2xl w-28">
                <div className="text-purple-400 text-xl font-display font-black tracking-tight">{state.level}</div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Show Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Mobile/Desktop HUD Tab Switcher (Visible on mobile instead of stacked view) */}
        <div className="flex md:hidden border-b border-zinc-900 text-zinc-400 font-mono text-xs">
          {(['episodes', 'characters', 'stats'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className={`flex-1 py-3 text-center uppercase tracking-widest font-bold border-b-2 transition-all ${
                activeTab === tab ? 'text-red-500 border-red-500' : 'border-transparent text-zinc-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* EPISODE ACTIVE WORKSPACE */}
        <div className={`${activeTab === 'episodes' ? 'block' : 'hidden'} md:block space-y-6`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-black text-white flex items-center gap-2 tracking-tight">
              <Play className="w-5 h-5 text-red-500 fill-red-500" /> Active Series Feed
            </h3>
            <span className="font-mono text-xs text-zinc-500">Episode {state.currentDay} available</span>
          </div>

          {/* Core Spotlight: Active Episode Hero Poster */}
          {state.currentEpisode ? (
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-gradient-to-br from-zinc-900 via-neutral-950 to-purple-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl"
              id="active_episode_card"
            >
              {/* Glossy ambient spotlight color elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-red-600/10 transition-all duration-700" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full min-h-[250px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-widest px-3 py-1 bg-red-950/40 border border-red-500/20 rounded-full">
                      🎬 S1: Episode {state.currentDay}
                    </span>
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-0.5">
                      <FlameKindling className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                      Drama High
                    </span>
                  </div>

                  <h4 className="text-2xl sm:text-3.5xl font-display font-black text-white leading-tight tracking-tight">
                    {state.currentEpisode.title}
                  </h4>
                  
                  <p className="text-zinc-400 text-sm font-sans max-w-xl leading-relaxed">
                    {state.currentEpisode.summary || "The plot thickens as connections from your past re-emerge."}
                  </p>

                  <div className="flex items-center gap-1.5 py-2">
                    <span className="text-xs font-mono text-zinc-500">Featured cast:</span>
                    {state.characters.map((char) => (
                      <span key={char.id} className="text-[11px] font-mono text-zinc-300 bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 rounded-md">
                        {char.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900/80 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-xs font-mono text-zinc-500 italic">
                    Ends with a cliffhanger choice that updates relationship scores dynamically.
                  </p>
                  
                  <button
                    type="button"
                    onClick={onPlayEpisode}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-display font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 group-hover:scale-105 duration-300 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Play Episode
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card-backdrop-glass rounded-3xl p-10 text-center font-sans text-zinc-400">
              <Sparkles className="w-10 h-10 text-zinc-600 mx-auto mb-4 animate-spin" style={{ animationDuration: '6s' }} />
              <p className="font-mono text-xs uppercase tracking-widest">Generative Show Feed Empty</p>
              <button 
                type="button" 
                onClick={() => setView('onboarding')}
                className="mt-4 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono rounded-xl tracking-wider transition-all"
              >
                Restart Campaign
              </button>
            </div>
          )}

          {/* Completed History List */}
          {state.episodes.length > 0 && (
            <div className="space-y-4 pt-4">
              <h4 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Season 1 Recap Logs</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.episodes.map((ep, idx) => (
                  <div key={ep.id} className="card-backdrop-glass rounded-2xl p-4 flex gap-4 items-center">
                    <span className="text-2xl font-display font-black text-zinc-800">#{idx + 1}</span>
                    <div>
                      <div className="text-xs font-bold text-white font-display uppercase tracking-tight">{ep.title}</div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1">{ep.summary}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC EMERGENCY TWIST TRIGGER */}
          <div className="card-backdrop-glass rounded-3xl p-6 border border-red-500/10 bg-gradient-to-r from-zinc-950 via-zinc-950 to-red-950/20 relative overflow-hidden" id="emergency_panel">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 z-10 relative">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-mono tracking-widest font-bold uppercase">
                  <AlertTriangle className="w-4 h-4 text-red-500 fill-red-500/10 animate-pulse" />
                  Instigate Random Plot Twist
                </div>
                <h4 className="text-lg font-display font-bold text-white">Trigger Emergency Episode?</h4>
                <p className="text-xs text-zinc-400">
                  Instantly spawn key betrayals, secret leaks, or dynamic rivals moves to test your crisis behavior.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTriggerRandomTwist}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:text-white hover:bg-red-600 font-mono text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Wand2 className="w-3.5 h-3.5" /> Hook Me ⚡
              </button>
            </div>
          </div>

          {/* DUAL TIMELINE REALITY SELECTOR */}
          <div className="space-y-4 pt-6">
            <h3 className="text-md font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <Map className="w-4 h-4 text-zinc-500" />
              Parallel Timeline Realities (Multi-Universe Mode)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "Original", name: "Original Arc", label: "Street Level", icon: "🏙️" },
                { id: "Billionaire", name: "Billionaire", label: "Yacht & Jets", icon: "💎", premium: true },
                { id: "Celebrity", name: "Hollywood Star", label: "Red Carpets", icon: "🎬", premium: true },
                { id: "Founder", name: "Tech Founder", label: "VC Backstabs", icon: "🦄", premium: true }
              ].map(uni => {
                const isSelected = state.activeUniverse === uni.id;
                const active = isSelected || state.isSubscribed; // premium block
                const handleSelect = () => {
                  if (uni.premium && !state.isSubscribed) {
                    setView('premium');
                    return;
                  }
                  onSelectUniverse(univMapper(uni.id));
                };

                return (
                  <button
                    key={uni.id}
                    onClick={handleSelect}
                    type="button"
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-red-950/20 border-red-500/60 shadow-lg shadow-red-500/5 text-white' 
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex gap-2.5 items-center">
                      <span className="text-xl">{uni.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold font-display tracking-tight text-white flex items-center justify-between">
                          <span className="truncate">{uni.name}</span>
                          {uni.premium && !state.isSubscribed && (
                            <Gem className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">{uni.label}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-500 italic mt-1">
              * Alternate timeline realities completely shift the character backgrounds, dialogues, and plot opportunities.
            </p>
          </div>

        </div>

        {/* CHARACTERS (Dynamic Tab for Mobile space saving) */}
        <div className={`${activeTab === 'characters' ? 'block' : 'hidden'} md:hidden space-y-4`}>
          <h3 className="text-lg font-display font-bold text-white">Dynamic Series Cast</h3>
          {renderCharactersGrid(state.characters, getRoleColor)}
        </div>

        {/* STATS (Dynamic Tab for Mobile space saving) */}
        <div className={`${activeTab === 'stats' ? 'block' : 'hidden'} md:hidden space-y-4`}>
          <h3 className="text-lg font-display font-bold text-white">My Reputation</h3>
          {renderReputationMeters(state.reputation)}
        </div>

      </div>

      {/* 1/3 SIDEBAR COLUMN: CHARACTERS ROSTER, DYNAMIC REPUTATION */}
      <div className="hidden md:flex flex-col gap-8 w-full lg:w-80">
        
        {/* CHARACTER RELATIONS INDEX */}
        <div className="card-backdrop-glass rounded-3xl p-6 space-y-5" id="characters_hud">
          <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-zinc-900">
            <Users className="w-4 h-4 text-red-500" /> Interactive Cast Roster
          </h4>

          {renderCharactersGrid(state.characters, getRoleColor)}
        </div>

        {/* REPUTATION METERS */}
        <div className="card-backdrop-glass rounded-3xl p-6 space-y-4" id="reputation_hud">
          <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-zinc-900">
            <Brain className="w-4 h-4 text-red-500" /> Reputation Matrix
          </h4>

          {renderReputationMeters(state.reputation)}
        </div>

        {/* EARNED TROPHIES SHELF */}
        <div className="card-backdrop-glass rounded-3xl p-6 space-y-4">
          <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-zinc-900">
            <Trophy className="w-4 h-4 text-amber-500" /> Unlock Trophies
          </h4>

          <div className="space-y-2.5">
            {[
              { id: "pilot", title: "Pilot Protagonist", desc: "Successfully onboarded S1.", done: true, icon: "🎬" },
              { id: "choice-1", title: "Risky Business", desc: "Select 3 high-tension strategic choices.", done: state.episodes.length >= 2, icon: "🎭" },
              { id: "streak-2", title: "Second Chapter Hook", desc: "Progress to Episode 2 loop.", done: state.episodes.length >= 1, icon: "📖" }
            ].map(ach => (
              <div key={ach.id} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                ach.done 
                  ? 'bg-zinc-900/60 border-zinc-800' 
                  : 'bg-zinc-950/20 border-zinc-900/50 opacity-40'
              }`}>
                <span className="text-xl">{ach.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white font-display truncate">{ach.title}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{ach.desc}</div>
                </div>
                {ach.done && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

// Map short uni name to full universe mode
function univMapper(uni: string) {
  switch (uni) {
    case 'Billionaire': return 'Billionaire';
    case 'Celebrity': return 'Celebrity';
    case 'Founder': return 'Founder';
    default: return 'Original';
  }
}

// Render dynamic cast helper
function renderCharactersGrid(characters: Character[], getRoleColor: (role: string) => string) {
  if (characters.length === 0) {
    return <p className="text-xs text-zinc-500 italic text-center">No characters drafted yet.</p>;
  }

  return (
    <div className="space-y-4">
      {characters.map((char) => {
        // Compute progress background mapping -100 to 100 on absolute percentages
        const percentage = Math.max(0, Math.min(100, Math.floor(((char.relationshipScore + 100) / 200) * 100)));
        const barColor = char.relationshipScore > 20 
          ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
          : char.relationshipScore < -20 
          ? 'bg-gradient-to-r from-red-600 to-red-500' 
          : 'bg-gradient-to-r from-red-900 to-red-650';

        return (
          <div key={char.id} className="group/char p-3 rounded-2xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition-all">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <img 
                  src={char.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${char.name}`} 
                  alt={char.name} 
                  className="w-8 h-8 rounded-lg bg-zinc-850"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h5 className="text-xs font-bold text-white font-display flex items-center gap-1">
                    {char.name}
                  </h5>
                  <span className={`text-[9px] font-mono border px-1.5 py-0.2 rounded-md ${getRoleColor(char.role)}`}>
                    {char.role}
                  </span>
                </div>
              </div>
              
              <div className="text-right font-mono text-[10px]">
                <span className={`font-bold ${char.relationshipScore >= 0 ? 'text-amber-500' : 'text-red-400'}`}>
                  {char.relationshipScore > 0 ? `+${char.relationshipScore}` : char.relationshipScore}
                </span>
                <span className="text-zinc-600 text-[9px] block">Bond</span>
              </div>
            </div>

            {/* Bond progress meter */}
            <div className="space-y-1">
              <div className="w-full h-1 bg-zinc-950/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${barColor} transition-all duration-700`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 italic max-w-full truncate group-hover/char:whitespace-normal group-hover/char:break-words duration-500">
                "{char.pastInteractions[char.pastInteractions.length - 1] || char.description}"
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Render reputation meters helper
function renderReputationMeters(reputation: any) {
  const statsList = [
    { key: "charisma", label: "Charisma Profile", desc: "Ability to charm and disarm guards or lovers", color: "text-amber-400 bg-amber-400/10" },
    { key: "intelligence", label: "Intelligence Grid", desc: "Logical deduction and leverage planning", color: "text-blue-400 bg-blue-400/10" },
    { key: "mystery", label: "Mystery Clout", desc: "Stealth and covert operations efficiency", color: "text-purple-400 bg-purple-400/10" },
    { key: "popularity", label: "Popularity / Class", desc: "High society reputation index value", color: "text-pink-400 bg-pink-400/10" },
    { key: "influence", label: "Influence Radius", desc: "Corporate leverage and blackmail strength", color: "text-emerald-400 bg-emerald-400/10" }
  ];

  return (
    <div className="space-y-3.5">
      {statsList.map(st => {
        const val = reputation[st.key] || 50;
        return (
          <div key={st.key} className="space-y-1 group">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-300 font-display">{st.label}</span>
              <span className="font-mono font-bold text-white text-[11px]">{val}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-700"
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
