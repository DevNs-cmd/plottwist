/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BadgeAlert, Sparkles, TrendingUp, Cpu, Gem, ShieldAlert, Users, 
  RotateCcw, Sliders, CheckCircle, Database, HelpCircle 
} from 'lucide-react';
import { SaveState, Character } from '../types';

interface AdminDashboardProps {
  state: SaveState;
  onUpdateState: (newState: Partial<SaveState>) => void;
  onClose: () => void;
  onForceEvent: (title: string, detail: string) => void;
}

export default function AdminDashboard({ state, onUpdateState, onClose, onForceEvent }: AdminDashboardProps) {
  const [customTitle, setCustomTitle] = useState('Secret Confession');
  const [customText, setCustomText] = useState('A sealed document arrived at your door. The handwriting matches Detective Shaw, detailing a connection to Julian Vance.');
  const [feedback, setFeedback] = useState('');

  const handleStatChange = (stat: 'xp' | 'streak' | 'level', delta: number) => {
    onUpdateState({
      [stat]: Math.max(1, (state[stat] as number) + delta)
    });
    triggerFeedback(`Updated ${stat.toUpperCase()} state.`);
  };

  const handleToggleSub = () => {
    onUpdateState({ isSubscribed: !state.isSubscribed });
    triggerFeedback(`Toggled Subscription: ${!state.isSubscribed ? 'Premium Cut' : 'Standard Cut'}`);
  };

  const handleCharacterBond = (charId: string, delta: number) => {
    const updated = state.characters.map(c => {
      if (c.id === charId) {
        return { ...c, relationshipScore: Math.min(100, Math.max(-100, c.relationshipScore + delta)) };
      }
      return c;
    });
    onUpdateState({ characters: updated });
    triggerFeedback(`Adjusted character bond.`);
  };

  const handleUniverse = (uni: string) => {
    onUpdateState({ activeUniverse: uni });
    triggerFeedback(`Jumped timeline to ${uni}.`);
  };

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const executeForceEvent = () => {
    if (!customTitle || !customText) return;
    onForceEvent(customTitle, customText);
    onClose();
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4" id="admin_control_unit">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
        <div className="flex items-center gap-2">
          <BadgeAlert className="w-6 h-6 text-amber-500" />
          <div>
            <h3 className="text-lg font-bold text-white font-display">PlotTwist God-Mode Console</h3>
            <p className="text-[10px] text-zinc-500 font-mono">DASHBOARD & RETENTION SIMULATOR</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-850 font-mono text-xs cursor-pointer transition-all"
        >
          Exit God-Mode
        </button>
      </div>

      {feedback && (
        <div id="admin_toast" className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-mono px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      <div className="space-y-6">

        {/* PERSISTENCE METRICS / RESOURCE MONITORS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">
              <Cpu className="w-3.5 h-3.5 text-zinc-500" /> Model Aliases
            </div>
            <div className="text-xs font-bold text-white">Gemini 3.5 Flash</div>
            <div className="text-[9px] text-zinc-600 font-mono mt-0.5">Primary showrunner tasks</div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">
              <Database className="w-3.5 h-3.5 text-zinc-500" /> Local Database
            </div>
            <div className="text-xs font-bold text-emerald-400">LocalStorage Active</div>
            <div className="text-[9px] text-zinc-600 font-mono mt-0.5">Synced save-slots</div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500" /> Active Users
            </div>
            <div className="text-xs font-bold text-purple-400">1 (You, Simulated)</div>
            <div className="text-[9px] text-zinc-600 font-mono mt-0.5">100% Day-1 Retention</div>
          </div>
        </div>

        {/* LEVEL ADJUSTERS, SUBSCRIPTION TOGGLE */}
        <div className="card-backdrop-glass rounded-3xl p-5 space-y-4">
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-bold pb-2 border-b border-zinc-900/80">
            <Sliders className="w-4 h-4 text-cyan-400" /> Fast-Forward User Parameters
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* XP and levels adjuster */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                <div>
                  <span className="text-xs font-bold text-white block">Day Streak</span>
                  <p className="text-[9px] text-zinc-500 font-mono">Current: {state.streak} days</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStatChange('streak', -1)} className="px-2.5 py-1 bg-zinc-905 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded text-xs text-white">-1</button>
                  <button onClick={() => handleStatChange('streak', 1)} className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded text-xs text-white">+1</button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                <div>
                  <span className="text-xs font-bold text-white block">Episodic Level</span>
                  <p className="text-[9px] text-zinc-500 font-mono">Current: {state.level}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStatChange('level', -1)} className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded text-xs text-white">-1</button>
                  <button onClick={() => handleStatChange('level', 1)} className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded text-xs text-white">+1</button>
                </div>
              </div>
            </div>

            {/* Custom Subscription toggle */}
            <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl flex flex-col justify-between items-start">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  Premium Package Status <Gem className="w-3.5 h-3.5 text-amber-500" />
                </span>
                <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-snug">
                  Manually flip subscription plans to check locked narration, alternate sandbox modes, and layouts.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleSub}
                className={`w-full mt-3 py-2 text-xs font-bold font-mono rounded-xl border transition-all ${
                  state.isSubscribed 
                    ? 'bg-amber-500 border-amber-500 text-zinc-950' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {state.isSubscribed ? '👑 SUBSCRIBED (Active)' : '🔌 UPGRADE ACCOUNT'}
              </button>
            </div>

          </div>
        </div>

        {/* CHARACTER ROSTER MANIPULATOR */}
        <div className="card-backdrop-glass rounded-3xl p-5 space-y-4">
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-bold pb-2 border-b border-zinc-900/80">
            <Users className="w-4 h-4 text-pink-400" /> Tweak Active Cast Relationship Delta
          </h4>

          <div className="space-y-2.5">
            {state.characters.map(char => (
              <div key={char.id} className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl flex items-center justify-between text-xs gap-4">
                <div>
                  <span className="font-bold text-white">{char.name}</span>
                  <span className="text-[9px] font-mono text-zinc-500 block">Current bond: {char.relationshipScore}%</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCharacterBond(char.id, -15)} className="px-3 py-1 bg-zinc-900 border border-zinc-850 hover:bg-red-500/10 hover:border-red-500/20 text-red-400 rounded text-xs">-15%</button>
                  <button onClick={() => handleCharacterBond(char.id, 15)} className="px-3 py-1 bg-zinc-900 border border-zinc-850 hover:bg-amber-500/10 hover:border-amber-500/20 text-amber-400 rounded text-xs">+15%</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORCE EMERGENCY PLOT ELEMENT */}
        <div className="card-backdrop-glass rounded-3xl p-5 space-y-4">
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-black pb-2 border-b border-zinc-900/80 text-red-500">
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" /> Force Custom Plot Twist Trigger
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Twist Header</label>
              <input 
                type="text" 
                value={customTitle} 
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Scenario/Dialogue Prompt Context</label>
              <textarea 
                rows={3}
                value={customText} 
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none font-sans"
              />
            </div>

            <button
              type="button"
              onClick={executeForceEvent}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-purple-600 text-white font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all"
            >
              Inject Sudden Betrayal Event 🌪️
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
