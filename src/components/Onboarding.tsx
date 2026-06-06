/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, Shield, Target, Heart, Briefcase, Zap, Clapperboard, Globe } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile, startingEpisode: any, initialCharacters: any[]) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const INTERESTS_OPTIONS = [
  "Corporate Intrigue", "High Society", "Underground Combat", 
  "Fashion & Models", "Cybersec Hacktivism", "Art & Seduction",
  "Street Racing", "Political Manipulation", "Ancient Mysteries"
];

const TRAIT_OPTIONS = [
  "Calculative", "Impulsive", "Seductive", "Empathetic", 
  "Secretive", "Brave", "Cynical", "Highly Analytical"
];

const UNIVERSES = [
  { id: "Original", name: "Original Reality", desc: "Realistic modern high-stakes drama", emoji: "🏙️" },
  { id: "Billionaire", name: "Billionaire Success", desc: "Private jets, hostile takeovers, yacht alliances", emoji: "💎" },
  { id: "Celebrity", name: "Hollywood Stardom", desc: "Paparazzi, hidden affairs, red carpet secrets", emoji: "🎬" },
  { id: "Founder", name: "Tech Unicorn Founder", desc: "Silicon Valley betrayal, VC wars, stealth tech", emoji: "🦄" }
];

export default function Onboarding({ onComplete, isLoading, setIsLoading }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState(24);
  const [interests, setInterests] = useState<string[]>([]);
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [goals, setGoals] = useState('');
  const [relationshipPreferences, setRelationshipPreferences] = useState('Rivalry & Friction');
  const [careerStatus, setCareerStatus] = useState('');
  const [selectedUniverse, setSelectedUniverse] = useState('Original');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingStepText, setLoadingStepText] = useState('Analyzing Profile Files...');

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleTrait = (trait: string) => {
    setPersonalityTraits(prev => 
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const triggerOnboardAPIByStep = async () => {
    if (!name.trim()) {
      setErrorMsg("Please introduce yourself first (Enter a protagonist name).");
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    const stepTexts = [
      "Securing satellite uplinks...",
      "Weaving rival networks...",
      "Drafting betrayal formulas...",
      "Generating Pilot Episode..."
    ];

    let currentTextIdx = 0;
    const interval = setInterval(() => {
      if (currentTextIdx < stepTexts.length) {
        setLoadingStepText(stepTexts[currentTextIdx]);
        currentTextIdx++;
      }
    }, 1500);

    try {
      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age,
          interests,
          personalityTraits,
          goals: goals || "Achieve status and protect loved ones from a mysterious threat.",
          relationshipPreferences,
          careerStatus: careerStatus || "Ambitious newcomer",
          activeUniverse: selectedUniverse
        })
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to contact Showrunner.");
      }

      const data = await response.json();
      clearInterval(interval);
      
      const profile: UserProfile = {
        name,
        age,
        interests,
        personalityTraits,
        goals: goals || "Achieve status",
        relationshipPreferences,
        careerStatus: careerStatus || "Ambitious newcomer",
        // Replaced DICEBEAR pixel url with premium photographic silhouette
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
        summary: data.summary
      };

      onComplete(profile, data.firstEpisode, data.characters);
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setErrorMsg(err.message || "Something went wrong during onboarding.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div id="onboarding_loader" className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-55 px-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative mb-8"
        >
          <Clapperboard className="w-16 h-16 text-red-600 stroke-[1.5]" />
          <div className="absolute -inset-2 rounded-full border border-dashed border-red-650/40 animate-spin" style={{ animationDuration: '12s' }} />
        </motion.div>
        
        <h2 className="text-3xl font-serif italic font-bold tracking-widest text-center text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-purple-500 to-amber-500 mb-2">
          PLOTTWIST BLACK
        </h2>
        
        <p className="font-mono text-[10px] tracking-widest text-zinc-500 animate-pulse text-center mb-10 max-w-md h-6 uppercase">
          {loadingStepText}
        </p>

        <div className="w-64 h-0.5 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-red-600 to-amber-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4" id="onboarding_wizard">
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-red-950/20 text-red-400 px-4 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase border border-red-500/10 mb-4 font-bold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Season 1 Selection Board
        </motion.div>
        
        <h1 className="text-5xl font-serif italic font-black tracking-tight text-white mb-2 leading-none">
          Plot<span className="text-red-500">Twist</span>
        </h1>
        <p className="text-xs font-sans text-zinc-400 max-w-xs mx-auto">
          Weave your credentials to compile a continuous narrative of secrets, attraction, and timelines.
        </p>
      </div>

      <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div id="step_indicator" className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <span className="font-mono text-[10px] tracking-wider text-zinc-500">STEP {step} / 5</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`w-3.5 h-1 rounded-full transition-all duration-300 ${
                  s === step ? 'bg-red-500 w-6' : s < step ? 'bg-purple-600' : 'bg-zinc-900'
                }`}
              />
            ))}
          </div>
        </div>

        {errorMsg && (
          <div id="onboard_error" className="mb-6">
            <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3.5 text-xs text-red-400 font-mono">
              {errorMsg}
            </div>
          </div>
        )}

        {/* STEP 1: Core ID */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-zinc-400" /> Protagonist Credentials
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-mono text-zinc-550 uppercase tracking-widest mb-2 font-bold">My Character Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Liam Vance, Celeste Fox" 
                  maxLength={32}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none transition-all font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-bold">Age: {age}</label>
                <input 
                  type="range" 
                  min={18} 
                  max={60} 
                  value={age} 
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1.5 bg-zinc-900 rounded-lg"
                />
                <div className="flex justify-between text-[8px] font-mono text-zinc-600 mt-1">
                  <span>18</span>
                  <span>Adult Protagonist</span>
                  <span>60</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Interests & Drama Environment */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-lg font-display font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-zinc-400" /> Story Context fields
            </h3>
            <p className="text-xs text-zinc-500 mb-5">Select 2-4 fields to fuel your episodic developments.</p>

            <div className="grid grid-cols-2 gap-2">
              {INTERESTS_OPTIONS.map((interest) => {
                const active = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-2.5 rounded-xl border text-[11px] font-medium text-left transition-all ${
                      active 
                        ? 'bg-purple-950/30 border-purple-500/40 text-purple-200 shadow-md' 
                        : 'bg-zinc-900/60 border-zinc-850 text-zinc-400 hover:border-zinc-750'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Personality Profile */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-lg font-display font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-zinc-400" /> Personality Attributes
            </h3>
            <p className="text-xs text-zinc-500 mb-5">Choose traits representing your tactical communication styles.</p>

            <div className="grid grid-cols-2 gap-2">
              {TRAIT_OPTIONS.map((trait) => {
                const active = personalityTraits.includes(trait);
                return (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleTrait(trait)}
                    className={`px-3 py-2.5 rounded-xl border text-[11px] font-medium text-left transition-all ${
                      active 
                        ? 'bg-red-950/30 border-red-500/40 text-red-200 shadow-md' 
                        : 'bg-zinc-900/60 border-zinc-850 text-zinc-400 hover:border-zinc-750'
                    }`}
                  >
                    {trait}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Goals, Status and Romance Style */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-lg font-display font-bold text-white mb-5 flex items-center gap-2">
              <Target className="w-5 h-5 text-zinc-400" /> Narrative Motivations
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-bold">
                  <Briefcase className="w-3.5 h-3.5" /> Career Status or Role
                </label>
                <input 
                  type="text" 
                  value={careerStatus} 
                  onChange={(e) => setCareerStatus(e.target.value)} 
                  placeholder="e.g. Undercover Agent, Rogue Investigator, Disgraced CFO" 
                  className="w-full bg-zinc-900 border border-zinc-850 focus:border-red-500 rounded-xl px-3 py-2.5 text-white placeholder-zinc-700 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-bold">
                  <Target className="w-3.5 h-3.5" /> Master Ambition
                </label>
                <input 
                  type="text" 
                  value={goals} 
                  onChange={(e) => setGoals(e.target.value)} 
                  placeholder="e.g. Find the syndicate that framed my father" 
                  className="w-full bg-zinc-900 border border-zinc-850 focus:border-red-500 rounded-xl px-3 py-2.5 text-white placeholder-zinc-700 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-bold">
                  <Heart className="w-3.5 h-3.5" /> Chemistry Style Preference
                </label>
                <select 
                  value={relationshipPreferences} 
                  onChange={(e) => setRelationshipPreferences(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 focus:border-red-500 rounded-xl px-3 py-2.5 text-white focus:outline-none text-xs cursor-pointer"
                >
                  <option value="Forbidden Love / Bitter Rivals">Forbidden Love / Intense Rivals</option>
                  <option value="Slow-burn Partnership / Mutual Care">Partner in Crime / Trust Builder</option>
                  <option value="Playful Flirting & High Society Charm">Playful Flirting & Society Alliances</option>
                  <option value="Love Triangle / Chaotic Secrets">Love Triangle / High Society Drama</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: Parallel Universe Timeline Mode */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-lg font-display font-bold text-white mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-500" /> Starting Universe Arc
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Select your protagonist timeline. The Showrunner will compile narrative variables matching this theme.
            </p>

            <div className="space-y-2">
              {UNIVERSES.map((univ) => {
                const active = selectedUniverse === univ.id;
                return (
                  <button
                    key={univ.id}
                    type="button"
                    onClick={() => setSelectedUniverse(univ.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">{univ.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{univ.name}</div>
                        <div className="text-[10px] text-zinc-500">{univ.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ACTION PANEL */}
        <div className="flex justify-between mt-10" id="onboard_action_tier">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl border border-zinc-850 text-xs font-mono text-zinc-450 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              disabled={step === 1 && !name.trim()}
              onClick={() => {
                if (step === 1 && !name.trim()) return;
                setStep(prev => prev + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-purple-650 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono text-white tracking-widest uppercase transition-all shadow-md cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={triggerOnboardAPIByStep}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-zinc-950 font-display font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl font-bold cursor-pointer"
            >
              Compile Universe 🎬
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
