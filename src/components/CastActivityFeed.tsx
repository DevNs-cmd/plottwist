/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Clock, Eye, AlertCircle, Sparkles, Share2, HelpCircle } from 'lucide-react';
import { CastActivity } from '../types';
import { getAvatarUrl } from '../utils';

interface CastActivityFeedProps {
  activities: CastActivity[];
  onOpenActivity?: (activity: CastActivity) => void;
  onShareActivity?: (activity: CastActivity) => void;
}

export default function CastActivityFeed({ activities, onOpenActivity, onShareActivity }: CastActivityFeedProps) {
  const getBadgeStyle = (type: CastActivity['type']) => {
    switch (type) {
      case 'action': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'cryptic': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'event': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'relationship': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case 'rumor': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'forecast': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getBadgeIcon = (type: CastActivity['type']) => {
    switch (type) {
      case 'event': return '✦';
      case 'rumor': return '⚠';
      case 'cryptic': return '⚲';
      case 'forecast': return '☱';
      default: return '●';
    }
  };

  return (
    <div id="reality_feed_container" className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
        <div>
          <h3 className="text-xl font-display font-black text-white tracking-tight uppercase">Reality Feed</h3>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Continuous Timeline Developments</p>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
          {activities.length} Developments Active
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="card-backdrop-glass rounded-3xl p-12 text-center text-zinc-500">
          <HelpCircle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="font-mono text-xs uppercase tracking-widest">Timeline is quiet...</p>
          <p className="text-[10px] text-zinc-600 mt-1">Check back later or fast-forward time to simulate character actions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activities.map((act) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 rounded-3xl p-6 overflow-hidden flex flex-col justify-between transition-all"
            >
              {/* Dynamic light accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl pointer-events-none group-hover:bg-white/[0.03] transition-all" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={getAvatarUrl(act.characterName, act.characterAvatar)}
                      alt={act.characterName}
                      className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 object-cover"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">{act.characterName}</span>
                      <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> {act.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className={`font-mono text-[9px] uppercase tracking-wider font-bold border px-2 py-0.5 rounded-full flex items-center gap-1 ${getBadgeStyle(act.type)}`}>
                    <span>{getBadgeIcon(act.type)}</span>
                    {act.type}
                  </span>
                </div>

                <p className="text-sm font-sans text-zinc-300 leading-relaxed italic">
                  "{act.message}"
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-zinc-900/60 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => onOpenActivity?.(act)}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>

                <button
                  type="button"
                  onClick={() => onShareActivity?.(act)}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                  title="Export Reality Card"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
