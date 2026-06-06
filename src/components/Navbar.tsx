/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe2, Bell, Gem, Settings2, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import { SaveState } from '../types';

interface NavbarProps {
  state: SaveState;
  setView: (view: 'onboarding' | 'dashboard' | 'playing' | 'premium' | 'admin') => void;
  onReset: () => void;
}

export default function Navbar({ state, setView, onReset }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const getUniverseLabel = (uni: string) => {
    switch (uni) {
      case 'Billionaire': return '💎 Billionaire';
      case 'Celebrity': return '🎬 Hollywood';
      case 'Founder': return '🦄 Tech Founder';
      default: return '🏙️ Main Reality';
    }
  };

  const notificationAlerts = state.notifications || [
    "A private reality file has been unlocked.",
    "Someone just altered your future.",
    "A secret meeting invitation has appeared."
  ];

  return (
    <nav id="app_navbar" className="bg-zinc-950/90 border-b border-zinc-900 sticky top-0 z-50 backdrop-blur-xl px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Branding */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => state.profile && setView('dashboard')}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 bg-red-650 rounded flex items-center justify-center font-serif text-xl font-bold italic tracking-tighter text-white">P</div>
            <span className="text-xl font-serif italic font-bold tracking-tight text-white">
              PlotTwist
            </span>
          </button>

          {/* Active Universe Timeline Badge */}
          {state.profile && (
            <div id="universe_badge" className="hidden md:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-[10px] text-zinc-300 font-mono">
              <Globe2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Timeline: {getUniverseLabel(state.activeUniverse)}</span>
            </div>
          )}
        </div>

        {/* User metrics HUD */}
        {state.profile ? (
          <div className="flex items-center gap-4" id="user_stats_hud">
            
            {/* Timeline Alerts (Push-style Notifications) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded-xl transition-all border border-zinc-900 relative cursor-pointer"
                title="Timeline Alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>

              {/* Notifications dropdown panel */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-72 bg-zinc-950 border border-zinc-850 rounded-2xl p-4 shadow-2xl space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Timeline Alerts</span>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-[8px] font-mono text-zinc-600 hover:text-white"
                      >
                        CLOSE
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                      {notificationAlerts.map((alert, idx) => (
                        <div key={idx} className="p-2 bg-zinc-900/40 border border-zinc-900 rounded-xl text-[10px] text-zinc-300 leading-normal flex items-start gap-2">
                          <span className="text-red-500 shrink-0 mt-0.5">•</span>
                          <span>{alert}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PlotTwist Black Premium Status Badge */}
            <button
              type="button"
              onClick={() => setView('premium')}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                state.plotTwistBlackActive
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold font-mono text-[10px] uppercase tracking-wider'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Gem className={`w-3.5 h-3.5 ${state.plotTwistBlackActive ? 'text-amber-400 fill-amber-400/10' : 'text-zinc-500'}`} />
              <span>{state.plotTwistBlackActive ? 'PlotTwist Black' : 'Go Premium'}</span>
            </button>

            {/* Settings & Admin Matrix */}
            <div className="flex items-center gap-1 border-l border-zinc-900 pl-3">
              <button
                type="button"
                onClick={() => setView('admin')}
                className="p-1.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900/60 rounded-xl transition-all border border-transparent hover:border-zinc-800 cursor-pointer"
                title="God-Mode Console"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onReset}
                className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-900/40 rounded-xl transition-all cursor-pointer"
                title="Wipe Session Data"
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
              className="text-xs font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              Start Game
            </button>
          </div>
        )}

      </div>
    </nav>
  );
}
