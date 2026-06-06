/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Heart, Shield, Award, HelpCircle, Activity, Info, Lock } from 'lucide-react';
import { Character, SaveState } from '../types';
import { getAvatarUrl } from '../utils';

interface RelationshipMapProps {
  characters: Character[];
  profileName: string;
  plotTwistBlackActive: boolean;
  onUpgradePrompt?: () => void;
}

export default function RelationshipMap({ 
  characters, 
  profileName, 
  plotTwistBlackActive,
  onUpgradePrompt 
}: RelationshipMapProps) {
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const activeChar = characters.find(c => c.id === selectedCharId) || null;

  // Node Positions on our SVG Canvas (500x500 viewport)
  const userPos = { x: 250, y: 250 };
  const charPositions = [
    { x: 250, y: 80 },   // Top
    { x: 80, y: 350 },   // Bottom Left
    { x: 420, y: 350 }   // Bottom Right
  ];

  // Helper to get link line styles based on archetype
  const getLinkStyle = (archetype: Character['archetype']) => {
    switch (archetype) {
      case 'Romantic Interest':
      case 'Forbidden Attraction':
      case 'Unresolved Tension':
      case 'Secret Admirer':
        return { stroke: '#f472b6', strokeWidth: 2, strokeDasharray: 'none', filter: 'url(#glow-pink)' };
      case 'Rival':
        return { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '4 4', filter: 'url(#glow-red)' };
      case 'High-Status Figure':
      case 'Former Connection':
      case 'Social Magnet':
        return { stroke: '#eab308', strokeWidth: 2, strokeDasharray: 'none', filter: 'url(#glow-yellow)' };
      default:
        return { stroke: '#a855f7', strokeWidth: 1.5, strokeDasharray: 'none', filter: 'url(#glow-purple)' };
    }
  };

  const getArchetypeIcon = (archetype: Character['archetype']) => {
    if (archetype.toLowerCase().includes('attraction') || archetype.toLowerCase().includes('love') || archetype.toLowerCase().includes('admirer')) {
      return '❤';
    }
    if (archetype.toLowerCase().includes('rival')) {
      return '✖';
    }
    return '✦';
  };

  const handleInsightsToggle = () => {
    if (!plotTwistBlackActive) {
      onUpgradePrompt?.();
      return;
    }
    setShowInsights(!showInsights);
  };

  return (
    <div id="relationship_graph_workspace" className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
        <div>
          <h3 className="text-xl font-display font-black text-white tracking-tight uppercase">Social Intelligence Graph</h3>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Interactive Network of Attraction & Rivalries</p>
        </div>

        <button
          type="button"
          onClick={handleInsightsToggle}
          className={`px-4 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
            showInsights && plotTwistBlackActive
              ? 'bg-amber-500 border-amber-500 text-zinc-950 font-bold'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          {!plotTwistBlackActive && <Lock className="w-3 h-3 text-amber-500" />}
          Hidden Attraction Insights
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* SVG GRAPH CONTAINER */}
        <div className="lg:col-span-2 bg-zinc-950/80 border border-zinc-900 rounded-3xl p-4 flex items-center justify-center relative overflow-hidden h-[450px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,transparent_80%)] pointer-events-none" />

          <svg viewBox="0 0 500 450" className="w-full h-full max-w-[450px]">
            <defs>
              {/* Glowing Filters */}
              <filter id="glow-pink" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* CONNECTION LINES (User to Characters) */}
            {characters.map((char, index) => {
              const pos = charPositions[index % charPositions.length];
              const lineStyle = getLinkStyle(char.archetype);

              return (
                <g key={`link-${char.id}`}>
                  {/* Glowing connector */}
                  <line
                    x1={userPos.x}
                    y1={userPos.y}
                    x2={pos.x}
                    y2={pos.y}
                    {...lineStyle}
                  />

                  {/* Bond score label center of line */}
                  <rect
                    x={(userPos.x + pos.x) / 2 - 18}
                    y={(userPos.y + pos.y) / 2 - 8}
                    width="36"
                    height="16"
                    rx="4"
                    fill="#09090b"
                    stroke="#18181b"
                  />
                  <text
                    x={(userPos.x + pos.x) / 2}
                    y={(userPos.y + pos.y) / 2 + 3}
                    textAnchor="middle"
                    fill={char.relationshipScore >= 0 ? '#f59e0b' : '#ef4444'}
                    fontSize="9px"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {char.relationshipScore >= 0 ? `+${char.relationshipScore}` : char.relationshipScore}%
                  </text>
                </g>
              );
            })}

            {/* INTER-CHARACTER RIVALRY/TENSION LINK (Elena to Marcus, etc. simulated) */}
            {characters.length >= 2 && (
              <g>
                <line
                  x1={charPositions[0].x}
                  y1={charPositions[0].y}
                  x2={charPositions[1].x}
                  y2={charPositions[1].y}
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.5}
                />
                <rect
                  x={(charPositions[0].x + charPositions[1].x) / 2 - 20}
                  y={(charPositions[0].y + charPositions[1].y) / 2 - 8}
                  width="40"
                  height="16"
                  rx="4"
                  fill="#09090b"
                  stroke="#18181b"
                />
                <text
                  x={(charPositions[0].x + charPositions[1].x) / 2}
                  y={(charPositions[0].y + charPositions[1].y) / 2 + 3}
                  textAnchor="middle"
                  fill="#ef4444"
                  fontSize="8px"
                  fontFamily="monospace"
                  opacity={0.7}
                >
                  Tension
                </text>
              </g>
            )}

            {/* USER NODE CENTER */}
            <g className="cursor-pointer">
              <circle
                cx={userPos.x}
                cy={userPos.y}
                r="22"
                fill="#09090b"
                stroke="#ef4444"
                strokeWidth="2"
              />
              <text
                x={userPos.x}
                y={userPos.y + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize="10px"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                YOU
              </text>
            </g>

            {/* CHARACTER NODES */}
            {characters.map((char, index) => {
              const pos = charPositions[index % charPositions.length];
              const isSelected = char.id === selectedCharId;

              return (
                <g 
                  key={char.id} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedCharId(char.id)}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "26" : "24"}
                    fill="#09090b"
                    stroke={isSelected ? "#f59e0b" : "#27272a"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    className="transition-all duration-300"
                  />
                  {/* Clip path for round character image */}
                  <defs>
                    <clipPath id={`clip-${char.id}`}>
                      <circle cx={pos.x} cy={pos.y} r={isSelected ? "25" : "23"} />
                    </clipPath>
                  </defs>
                  
                  <image
                    href={getAvatarUrl(char.name, char.avatarUrl)}
                    x={pos.x - 26}
                    y={pos.y - 26}
                    width="52"
                    height="52"
                    clipPath={`url(#clip-${char.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />

                  {/* Mini Archetype Icon Badge overlay */}
                  <circle
                    cx={pos.x + 16}
                    cy={pos.y - 16}
                    r="8"
                    fill="#09090b"
                    stroke="#18181b"
                  />
                  <text
                    x={pos.x + 16}
                    y={pos.y - 12}
                    textAnchor="middle"
                    fill={char.archetype.includes('Attraction') || char.archetype.includes('Interest') ? '#f472b6' : '#fff'}
                    fontSize="9px"
                  >
                    {getArchetypeIcon(char.archetype)}
                  </text>

                  {/* Character Name Label under node */}
                  <text
                    x={pos.x}
                    y={pos.y + 38}
                    textAnchor="middle"
                    fill={isSelected ? "#fff" : "#a1a1aa"}
                    fontSize="10px"
                    fontWeight={isSelected ? "bold" : "normal"}
                    fontFamily="sans-serif"
                  >
                    {char.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* SIDE DETAIL PANEL */}
        <div className="lg:col-span-1 h-[450px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeChar ? (
              <motion.div
                key={activeChar.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-zinc-950/85 border border-zinc-900 rounded-3xl p-5 h-full flex flex-col justify-between overflow-y-auto"
              >
                <div className="space-y-4">
                  <div className="flex gap-3 pb-3 border-b border-zinc-900">
                    <img
                      src={getAvatarUrl(activeChar.name, activeChar.avatarUrl)}
                      alt={activeChar.name}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-800 bg-zinc-900"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{activeChar.name}</h4>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide block mt-0.5">{activeChar.archetype}</span>
                      <span className="text-[8px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/10 mt-1 inline-block">State: {activeChar.currentState}</span>
                    </div>
                  </div>

                  {/* Chemistry profile */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Chemistry Profile</span>
                    
                    <div className="text-[10px] space-y-1.5">
                      <div>
                        <span className="text-zinc-500 block">Values:</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {activeChar.chemistryProfile.values.map(val => (
                            <span key={val} className="px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 font-sans">{val}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Communication Style:</span>
                        <span className="text-zinc-300 font-medium font-sans">{activeChar.chemistryProfile.communicationStyle}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Emotional Triggers:</span>
                        <span className="text-zinc-300 font-sans">{activeChar.chemistryProfile.emotionalTriggers.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Insights drawer (PlotTwist Black feature) */}
                  {showInsights && plotTwistBlackActive ? (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="pt-3 border-t border-zinc-900 space-y-3"
                    >
                      <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest block font-bold">Hidden Attraction Insights</span>
                      
                      <div className="space-y-2 text-[10px] font-mono">
                        {[
                          { label: "Chemistry", val: activeChar.attractionMetrics.chemistry },
                          { label: "Closeness", val: activeChar.attractionMetrics.closeness },
                          { label: "Curiosity", val: activeChar.attractionMetrics.curiosity },
                          { label: "Trust", val: activeChar.attractionMetrics.trust },
                          { label: "Compatibility", val: activeChar.attractionMetrics.compatibility }
                        ].map(m => (
                          <div key={m.label} className="space-y-0.5">
                            <div className="flex justify-between text-[9px] text-zinc-400">
                              <span>{m.label}</span>
                              <span>{m.val}%</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500" style={{ width: `${m.val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : showInsights && (
                    <div className="pt-3 border-t border-zinc-900 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-center space-y-2">
                      <Lock className="w-5 h-5 text-amber-500 mx-auto" />
                      <span className="text-[10px] font-bold text-white block uppercase tracking-wider">LOCKED INSIGHTS</span>
                      <p className="text-[9px] text-zinc-400 leading-snug">Hidden Attraction metrics require PlotTwist Black.</p>
                    </div>
                  )}

                </div>

                <div className="pt-4 border-t border-zinc-900 mt-4 text-[9px] text-zinc-500 italic">
                  * Click other cast nodes in the network graph to inspect their social coordinates.
                </div>
              </motion.div>
            ) : (
              <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-5 h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-2">
                <Users className="w-8 h-8 text-zinc-700 stroke-[1.5]" />
                <span className="font-mono text-xs uppercase tracking-widest">Select Cast Member</span>
                <p className="text-[10px] text-zinc-605 max-w-[200px] leading-relaxed font-sans">
                  Click on any character node in the SVG network chart to slide open their confidential files and chemistry analysis.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
