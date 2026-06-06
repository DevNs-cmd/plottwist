/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Eye, Sparkles, AlertCircle, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { RealityVaultItem } from '../types';

interface RealityVaultProps {
  items: RealityVaultItem[];
  onUnlockItem?: (item: RealityVaultItem) => void;
  plotTwistBlackActive: boolean;
  onUpgradePrompt?: () => void;
}

export default function RealityVault({ items, onUnlockItem, plotTwistBlackActive, onUpgradePrompt }: RealityVaultProps) {
  const [selectedItem, setSelectedItem] = useState<RealityVaultItem | null>(null);

  const handleOpenItem = (item: RealityVaultItem) => {
    if (item.isLocked) return;
    setSelectedItem(item);
  };

  const getVaultTypeColor = (type: RealityVaultItem['type']) => {
    switch (type) {
      case 'confession': return 'text-pink-400 border-pink-500/20';
      case 'intelligence': return 'text-cyan-400 border-cyan-500/20';
      case 'alliance': return 'text-purple-400 border-purple-500/20';
      case 'future': return 'text-emerald-400 border-emerald-500/20';
      default: return 'text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div id="reality_vault_matrix" className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
        <div>
          <h3 className="text-xl font-display font-black text-white tracking-tight uppercase">Reality Vault</h3>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Secure Backstory & Secret Intel Archives</p>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
          {items.filter(i => !i.isLocked).length} / {items.length} Unlocked
        </span>
      </div>

      {items.length === 0 ? (
        <div className="card-backdrop-glass rounded-3xl p-12 text-center text-zinc-500">
          <HelpCircle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="font-mono text-xs uppercase tracking-widest font-bold">Vault is currently empty...</p>
          <p className="text-[10px] text-zinc-650 mt-1">Dossiers will be loaded as your storyline branches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => {
            const isLocked = item.isLocked;
            const borderStyle = isLocked 
              ? 'border-zinc-900 bg-zinc-950/20 opacity-60 hover:opacity-85' 
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 cursor-pointer';

            return (
              <div
                key={item.id}
                onClick={() => handleOpenItem(item)}
                className={`p-5 rounded-3xl border flex flex-col justify-between h-48 transition-all ${borderStyle}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[8px] font-mono border px-2 py-0.5 rounded-full uppercase tracking-wider ${getVaultTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-zinc-650" />
                    ) : (
                      <Unlock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white leading-tight font-display mb-1 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-normal font-sans line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-900/60 mt-3 flex items-center justify-between">
                  {isLocked ? (
                    <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Locked: {item.unlockCondition}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1">
                      ✦ Unlocked. Click to read
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-700" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL DRAWER / MODAL OVERLAY */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black/85 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                <div>
                  <span className={`text-[8px] font-mono border px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block ${getVaultTypeColor(selectedItem.type)}`}>
                    CLASSIFIED {selectedItem.type} DATA
                  </span>
                  <h3 className="text-xl font-display font-black text-white">{selectedItem.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-all cursor-pointer text-xs font-mono"
                >
                  [CLOSE]
                </button>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl max-h-[300px] overflow-y-auto">
                <p className="text-xs font-sans text-zinc-300 leading-relaxed whitespace-pre-wrap italic">
                  {selectedItem.content}
                </p>
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest pt-2">
                <span>Timeline verification: Decrypted</span>
                <span className="text-amber-500">✦ PlotTwist Archive</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
