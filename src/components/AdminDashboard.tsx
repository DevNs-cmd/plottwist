/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BadgeAlert, Sliders, CheckCircle, Database, Cpu, 
  Clock, ShieldAlert, Users, TrendingUp, Gem
} from 'lucide-react';
import { SaveState, Character } from '../types';

interface AdminDashboardProps {
  state: SaveState;
  onUpdateState: (newState: Partial<SaveState>) => void;
  onClose: () => void;
  onForceEvent: (title: string, detail: string) => void;
  onFastForwardTime: (hours: number) => void;
}

export default function AdminDashboard({ 
  state, 
  onUpdateState, 
  onClose, 
  onForceEvent,
  onFastForwardTime 
}: AdminDashboardProps) {
  const [customTitle, setCustomTitle] = useState('Secret Confession');
  const [customText, setCustomText] = useState('A sealed document arrived at your door. The handwriting matches Detective Rossi, detailing Marcus\'s connections.');
  const [feedback, setFeedback] = useState('');
  const [selectedCharId, setSelectedCharId] = useState<string>(state.characters[0]?.id || '');
  const [ffHours, setFfHours] = useState<number>(4);

  const handleToggleSub = () => {
    onUpdateState({ plotTwistBlackActive: !state.plotTwistBlackActive });
    triggerFeedback(`Toggled subscription plan to: ${!state.plotTwistBlackActive ? 'PlotTwist Black' : 'Viewer Pass'}`);
  };

  const handleFastForward = () => {
    onFastForwardTime(ffHours);
    triggerFeedback(`Fast-forwarded timeline by ${ffHours} hours. Simulating offline reality developments...`);
  };

  const handleCharacterStatChange = (stat: 'chemistry' | 'trust' | 'curiosity' | 'relationshipScore', val: number) => {
    const updated = state.characters.map(c => {
      if (c.id === selectedCharId) {
        if (stat === 'relationshipScore') {
          return { ...c, relationshipScore: Math.min(100, Math.max(-100, val)) };
        } else {
          return {
            ...c,
            attractionMetrics: {
              ...c.attractionMetrics,
              [stat]: Math.min(100, Math.max(0, val))
            }
          };
        }
      }
      return c;
    });
    onUpdateState({ characters: updated });
    triggerFeedback(`Adjusted character bond attributes.`);
  };

  const handleCharacterStateChange = (charState: any) => {
    const updated = state.characters.map(c => {
      if (c.id === selectedCharId) {
        return { ...c, currentState: charState };
      }
      return c;
    });
    onUpdateState({ characters: updated });
    triggerFeedback(`Toggled character state to ${charState}.`);
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

  const currentChar = state.characters.find(c => c.id === selectedCharId);

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4" id="admin_control_unit">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
        <div className="flex items-center gap-2">
          <BadgeAlert className="w-6 h-6 text-amber-500" />
          <div>
            <h3 className="text-lg font-bold text-white font-display uppercase">PlotTwist God-Mode</h3>
            <p className="text-[10px] text-zinc-500 font-mono">TIMELINE & ATTRACTION SIMULATOR</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-850 font-mono text-xs cursor-pointer transition-all border border-zinc-800"
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
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1 font-bold">
              <Cpu className="w-3.5 h-3.5" /> Model Engine
            </div>
            <div className="text-xs font-bold text-white font-mono">Gemini 3.5 Flash</div>
            <div className="text-[9px] text-zinc-650 font-mono mt-0.5">Primary reasoning engine</div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1 font-bold">
              <Database className="w-3.5 h-3.5" /> Local Database
            </div>
            <div className="text-xs font-bold text-emerald-400 font-mono">LocalStorage Active</div>
            <div className="text-[9px] text-zinc-650 font-mono mt-0.5">Durable local states</div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> Attraction Status
            </div>
            <div className="text-xs font-bold text-purple-400 font-mono">Active (6 Engines)</div>
            <div className="text-[9px] text-zinc-650 font-mono mt-0.5">Chemistry tracking live</div>
          </div>
        </div>

        {/* REALITY CLOCK TIME MACHINE */}
        <div className="card-backdrop-glass rounded-3xl p-5 space-y-4">
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-black pb-2 border-b border-zinc-900/80 text-amber-500">
            <Clock className="w-4 h-4 text-amber-500" /> Reality Clock (Offline Time Machine)
          </h4>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl">
            <div className="space-y-1 flex-1">
              <span className="text-xs font-bold text-white block">Fast-Forward Timeline</span>
              <p className="text-[9px] text-zinc-500 font-mono leading-relaxed">
                Simulate shutting the app and opening it hours/days later. This triggers the Reality Engine to spawn offline developments, DMs, and secret vault item unlocks.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <div className="space-y-1 w-20">
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={ffHours}
                  onChange={(e) => setFfHours(parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white text-center font-mono"
                />
                <span className="text-[8px] font-mono text-zinc-500 text-center block uppercase">Hours FF</span>
              </div>
              <button
                type="button"
                onClick={handleFastForward}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
              >
                Trigger Tick ⏱️
              </button>
            </div>
          </div>
        </div>

        {/* MEMBERSHIP PLAN TOGGLE */}
        <div className="card-backdrop-glass rounded-3xl p-5 space-y-4">
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-bold pb-2 border-b border-zinc-900/80">
            <Gem className="w-4 h-4 text-amber-400" /> Subscription Tier Override
          </h4>
          <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="max-w-md">
              <span className="text-xs font-bold text-white block">PlotTwist Black Status</span>
              <p className="text-[9px] text-zinc-500 font-mono leading-relaxed mt-0.5">
                Toggle premium access to test Hidden Attraction Insights dashboard views, vault dossiers decryptions, and voice playback modules.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleSub}
              className={`w-full sm:w-auto px-6 py-2.5 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                state.plotTwistBlackActive 
                  ? 'bg-amber-500 border-amber-500 text-zinc-950' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {state.plotTwistBlackActive ? '👑 PLOTTWIST BLACK (Active)' : '🔌 UPGRADE OVERRIDE'}
            </button>
          </div>
        </div>

        {/* CHARACTER ROSTER & METRICS SLIDERS */}
        {state.characters.length > 0 && (
          <div className="card-backdrop-glass rounded-3xl p-5 space-y-4">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-bold pb-2 border-b border-zinc-900/80">
              <Users className="w-4 h-4 text-pink-400" /> Cast Chemistry & Bond tuning console
            </h4>

            <div className="space-y-4">
              {/* Select Character dropdown */}
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Select Character</label>
                <select
                  value={selectedCharId}
                  onChange={(e) => setSelectedCharId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  {state.characters.map(char => (
                    <option key={char.id} value={char.id}>{char.name} ({char.archetype})</option>
                  ))}
                </select>
              </div>

              {currentChar && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl text-xs space-y-2 sm:space-y-0">
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block font-bold">State & Roster metrics</span>
                    
                    {/* Overall relationship score */}
                    <div>
                      <div className="flex justify-between font-mono text-[9px] text-zinc-400 mb-1">
                        <span>Overall Bond Score:</span>
                        <span className="font-bold">{currentChar.relationshipScore}%</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={currentChar.relationshipScore}
                        onChange={(e) => handleCharacterStatChange('relationshipScore', parseInt(e.target.value))}
                        className="w-full accent-pink-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* State selector */}
                    <div className="pt-2">
                      <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Character State:</label>
                      <select
                        value={currentChar.currentState}
                        onChange={(e) => handleCharacterStateChange(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-[10px] rounded px-2 py-1 text-white cursor-pointer"
                      >
                        {['Neutral', 'Intrigued', 'Jealous', 'Protective', 'Distant', 'Intimate'].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block font-bold">Attraction Metrics</span>
                    {[
                      { label: 'Chemistry', key: 'chemistry' as const },
                      { label: 'Trust', key: 'trust' as const },
                      { label: 'Curiosity', key: 'curiosity' as const }
                    ].map(stat => (
                      <div key={stat.key}>
                        <div className="flex justify-between font-mono text-[9px] text-zinc-400 mb-1">
                          <span>{stat.label}:</span>
                          <span className="font-bold">{currentChar.attractionMetrics[stat.key]}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={currentChar.attractionMetrics[stat.key]}
                          onChange={(e) => handleCharacterStatChange(stat.key, parseInt(e.target.value))}
                          className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FORCE TIMELINE EVENT */}
        <div className="card-backdrop-glass rounded-3xl p-5 space-y-4">
          <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-black pb-2 border-b border-zinc-900/80 text-red-500">
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" /> Force Immediate Timeline Event
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1.5">Alert Header</label>
              <input 
                type="text" 
                value={customTitle} 
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1.5">Scenario Details / Text Prompt</label>
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
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-purple-600 text-white font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all cursor-pointer"
            >
              Inject Timeline Alert Event 🌪️
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
