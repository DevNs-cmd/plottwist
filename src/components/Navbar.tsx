/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Award, Flame, Gem, ShieldAlert, Sparkles, LogOut, Settings2, Globe2 } from 'lucide-react';
import { SaveState } from '../types';

interface NavbarProps {
  state: SaveState;
  setView: (view: 'onboarding' | 'dashboard' | 'playing' | 'premium' | 'admin') => void;
  onReset: () => void;
}

export default function Navbar({ state, setView, onReset }: NavbarProps) {
  const xpThreshold = state.level * 100;
  const xpPercent = Math.min(100, Math.floor((state.xp / xpThreshold) * 100));

  const getUniverseLabel = (uni: string) => {
    switch (uni) {
      case 'Billionaire': return '💎 Billionaire';
      case 'Celebrity': return '🎬 Hollywood';
      case 'Founder': return '🦄 Tech Founder';
      default: return '🏙️ Main Reality';
    }
  };

  return (
    <nav id="app_navbar" className="bg-zinc-950/90 border-b border-zinc-900/85 sticky top-0 z-50 backdrop-blur-xl px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Branding */}
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => state.profile && setView('dashboard')}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-serif text-xl font-bold italic tracking-tighter text-white">P</div>
            <span className="text-xl font-serif italic font-bold tracking-tight text-white">
              PlotTwist
            </span>
            <span className="font-mono text-[9px] bg-red-600/10 border border-red-500/20 text-red-500 rounded-md px-1.5 py-0.5 font-bold uppercase tracking-widest leading-none">
              MVP
            </span>
          </button>

          {/* Universe HUD */}
          {state.profile && (
            <div id="universe_badge" className="hidden md:flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-300 font-mono">
              <Globe2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Timeline: {getUniverseLabel(state.activeUniverse)}</span>
            </div>
          )}
        </div>

        {/* User metrics HUD */}
        {state.profile ? (
          <div className="flex items-center gap-3 md:gap-5" id="user_stats_hud">
            
            {/* Streak Counter */}
            <div className="flex items-center gap-1 text-amber-500 font-mono text-xs" title="Daily Retention Loop Streak">
              <Flame className="w-4 h-4 fill-amber-500/10 animate-bounce" style={{ animationDuration: '3s' }} />
              <span className="font-bold">{state.streak}D Streak</span>
            </div>

            {/* Level and XP */}
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                <Award className="w-3.5 h-3.5 text-zinc-400" />
                <span>LVL {state.level}</span>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-500 font-bold">{state.xp} / {xpThreshold} XP</span>
              </div>
              <div className="w-24 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850/80">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-purple-600 transition-all duration-500" 
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Premium Indicator Badge */}
            <button
              type="button"
              onClick={() => setView('premium')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                state.isSubscribed
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Gem className={`w-3.5 h-3.5 ${state.isSubscribed ? 'text-amber-400 fill-amber-400/10' : 'text-zinc-500'}`} />
              <span>{state.isSubscribed ? 'Premium' : 'Go Premium'}</span>
            </button>

            {/* Settings & Admin matrix */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setView('admin')}
                className="p-1.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900/60 rounded-xl transition-all border border-transparent hover:border-zinc-800"
                title="Admin Dashboard Mode"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onReset}
                className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-900/40 rounded-xl transition-all"
                title="Restart Season (Wipe Session)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('onboarding')}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-all"
            >
              Start Game
            </button>
          </div>
        )}

      </div>
    </nav>
  );
}
