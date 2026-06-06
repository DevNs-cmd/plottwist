/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Download, Check, Sparkles, AlertCircle } from 'lucide-react';
import { getAvatarUrl } from '../utils';

interface ShareRealityCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  characterName?: string;
  characterAvatar?: string;
  forecastText?: string;
}

export default function ShareRealityCard({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  characterName,
  characterAvatar,
  forecastText 
}: ShareRealityCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const textToCopy = `PlotTwist Reality Alert: "${title}" - ${description} ${forecastText ? `[Timeline Forecast: ${forecastText}]` : ''} #PlotTwist`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-65 flex items-center justify-center p-4" id="share_overlay">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-sm w-full bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6 shadow-2xl"
      >
        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Share Reality Card</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase"
          >
            [CLOSE]
          </button>
        </div>

        {/* 9:16 CARD PREVIEW */}
        <div 
          id="shareable-story-card"
          className="aspect-[9/16] w-full rounded-2xl border border-zinc-800 bg-black relative overflow-hidden flex flex-col justify-between p-6 shadow-2xl select-none"
        >
          {/* Ambient decorative glowing backdrops */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/[0.07] rounded-full blur-[80px]" />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-purple-600/[0.05] rounded-full blur-[60px]" />

          {/* Card Header Branding */}
          <div className="relative z-10 flex justify-between items-center border-b border-zinc-900/40 pb-3">
            <span className="text-sm font-serif italic font-bold tracking-tight text-white">PlotTwist</span>
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
              S1 ACTIVE REALITY
            </span>
          </div>

          {/* Central content */}
          <div className="relative z-10 my-auto text-center space-y-5">
            {characterAvatar && (
              <img
                src={getAvatarUrl(characterName || '', characterAvatar)}
                alt={characterName}
                className="w-16 h-16 rounded-full object-cover border-2 border-red-500/30 mx-auto bg-zinc-900 shadow-xl"
              />
            )}
            
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest font-black block">
                {title}
              </span>
              <h4 className="text-lg font-display font-bold text-white leading-relaxed px-2">
                "{description}"
              </h4>
            </div>

            {forecastText && (
              <div className="inline-block px-3 py-1 bg-zinc-950 border border-zinc-850/80 rounded-full">
                <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-bold">
                  🔮 Forecast: {forecastText}
                </span>
              </div>
            )}
          </div>

          {/* Card Footer Branding */}
          <div className="relative z-10 text-center space-y-2 border-t border-zinc-900/40 pt-4">
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">
              Scan to Join This Reality
            </span>
            <div className="text-[10px] font-serif italic text-white flex items-center justify-center gap-1">
              <span className="text-red-500">✦</span> plottwist.black
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Caption</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy} // Sandbox download trigger
            className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
