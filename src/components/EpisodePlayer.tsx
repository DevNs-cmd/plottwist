/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Volume2, VolumeX, Sparkles, Brain, Star, Clock, ArrowRight, ShieldAlert, 
  CornerDownRight, CheckCircle2, Flame, Loader2, Play, Users, Globe 
} from 'lucide-react';
import { Episode, Choice, SaveState } from '../types';

interface EpisodePlayerProps {
  state: SaveState;
  episode: Episode;
  onChoiceSelected: (choice: Choice) => void;
  onClose: () => void;
  isSubscribed: boolean;
  setView: (view: 'onboarding' | 'dashboard' | 'playing' | 'premium' | 'admin') => void;
}

export default function EpisodePlayer({ state, episode, onChoiceSelected, onClose, isSubscribed, setView }: EpisodePlayerProps) {
  const [visibleParagraphs, setParagraphs] = useState<number>(1);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [reactionData, setReactionData] = useState<any | null>(null);
  const [consequenceLoading, setConsequenceLoading] = useState(false);
  const [choiceError, setChoiceError] = useState('');
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll when paragraphs reveal
  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [visibleParagraphs]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  const handleNextParagraph = () => {
    if (visibleParagraphs < episode.story.length) {
      setParagraphs(prev => prev + 1);
    }
  };

  const handleNarration = async (textSegment: string) => {
    if (!isSubscribed) {
      setView('premium');
      return;
    }

    if (isPlayingAudio && currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    setAudioLoading(true);
    setAudioError('');

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textSegment,
          voice: state.profile?.relationshipPreferences.includes('Romantic') ? 'Kore' : 'Zephyr'
        })
      });

      if (!res.ok) {
        throw new Error("Narration service busy. Please try again.");
      }

      const data = await res.json();
      if (!data.audio) {
        throw new Error("TTS generation returned empty.");
      }

      // Play audio blob
      const audioUrl = `data:audio/mp3;base64,${data.audio}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setAudioError("Error during audio playback.");
        setIsPlayingAudio(false);
      };

      await audio.play();
    } catch (err: any) {
      console.error(err);
      setAudioError(err.message || "Failed to load narration.");
    } finally {
      setAudioLoading(false);
    }
  };

  const handleSelectChoice = async (choice: Choice) => {
    if (selectedChoiceId) return; // Prevent double select
    setSelectedChoiceId(choice.id);
    setConsequenceLoading(true);
    setChoiceError('');

    try {
      const response = await fetch('/api/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: state.profile,
          reputation: state.reputation,
          characters: state.characters,
          episodesHistory: state.episodes,
          currentEpisode: episode,
          selectedChoice: choice,
          activeUniverse: state.activeUniverse
        })
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to process consequence.");
      }

      const data = await response.json();
      setReactionData({
        reaction: data.consequentialStoryReaction,
        characterImpact: data.characterImpactSummary,
        relationshipChanges: data.relationshipChanges,
        reputationChanges: data.reputationChanges,
        nextEpisode: data.nextEpisode,
        originalChoice: choice
      });
    } catch (err: any) {
      console.error(err);
      setChoiceError(err.message || "Connection to Showrunner timed out. Releasing choice...");
      setSelectedChoiceId(null);
    } finally {
      setConsequenceLoading(false);
    }
  };

  const handleFinalizeConsequence = () => {
    if (reactionData) {
      onChoiceSelected(reactionData);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4" id="episode_viewer">
      
      {/* HEADER FEEDBACK INFO */}
      <div className="flex items-center justify-between font-mono text-xs text-zinc-500 mb-6 pb-3 border-b border-zinc-900">
        <span>S1 • EP {state.currentDay} • PLAYING</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> 3 Min Read
        </span>
      </div>

      {/* STAGE SCREEN COVER */}
      <div className="card-backdrop-glass rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* EPISODE TITLE */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-500">
            PlotTwist Original Season 1
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight tracking-tight">
            {episode.title}
          </h2>
        </div>

        {/* PARAGRAPH ITERATOR CARDS */}
        <div className="space-y-4 text-zinc-300 font-sans text-sm sm:text-base leading-relaxed" id="episode_narrative_beats">
          {episode.story.slice(0, visibleParagraphs).map((pStr, idx) => (
            <motion.p 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-3.5 rounded-xl hover:bg-zinc-900/20 duration-300 relative border-l border-transparent hover:border-red-500/30"
            >
              {pStr}
            </motion.p>
          ))}
        </div>

        {/* NARRATIVE UTILITY TIER */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-900">
          
          {/* Narrator Voice Button */}
          <div>
            <button
              type="button"
              onClick={() => handleNarration(episode.story.slice(0, visibleParagraphs).join(" "))}
              className={`flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 font-bold animate-pulse'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {audioLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing AI Vocal...</span>
                </>
              ) : isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                  <span>Stop Soundtrack</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to AI Voice</span>
                </>
              )}
            </button>
            
            {audioError && <p className="text-[10px] text-red-400 font-mono mt-1">{audioError}</p>}
            {!isSubscribed && (
              <span className="text-[9px] font-mono text-zinc-600 block mt-1">⭐️ Voice requires Premium</span>
            )}
          </div>

          {/* Reveal next paragraph trigger */}
          {visibleParagraphs < episode.story.length ? (
            <button
              type="button"
              onClick={handleNextParagraph}
              className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white font-mono text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
            >
              Next Scene <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest px-3 py-1 border border-zinc-850 rounded-full bg-zinc-900/60">
              Act I Concluded
            </span>
          )}
        </div>
      </div>

      {/* CLIFFHANGER & CHOICES MATRIX */}
      {visibleParagraphs === episode.story.length && !reactionData && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          id="choices_container"
        >
          {/* Intense Cliffhanger callout */}
          <div className="bg-gradient-to-r from-red-950/20 via-zinc-950 to-zinc-950 border-l-4 border-red-500 p-5 rounded-r-3xl text-sm sm:text-base italic text-zinc-200 shadow-lg">
            <div className="font-mono text-[10px] text-red-500 uppercase tracking-widest font-black non-italic pb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> THE CLIFFHANGER
            </div>
            "{episode.cliffhanger}"
          </div>

          <div>
            <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Choose Your Vector Path:</h4>
            
            {consequenceLoading ? (
              <div id="consequence_loader" className="card-backdrop-glass rounded-3xl p-10 text-center text-zinc-400 space-y-4">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
                <p className="font-mono text-xs uppercase tracking-wider text-white">Consulting Showrunner Memory Matrix...</p>
                <span className="text-[11px] text-zinc-500 font-mono">Simulating character reactions...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {episode.choices.map((choice) => {
                  const checkSelected = selectedChoiceId === choice.id;
                  const choiceIndex = episode.choices.indexOf(choice);
                  const letter = String.fromCharCode(65 + choiceIndex);
                  return (
                    <motion.button
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice)}
                      disabled={selectedChoiceId !== null}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                        checkSelected
                          ? 'bg-red-950/30 border-red-500/80 text-white shadow-lg shadow-red-950/40'
                          : 'glass hover:bg-white hover:text-black hover:border-white text-zinc-300'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded font-mono text-xs font-bold flex items-center justify-center border shrink-0 mt-0.5 ${
                        checkSelected 
                          ? 'bg-red-650 border-red-500 text-white' 
                          : 'bg-white/5 border-white/10 text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950'
                      }`}>
                        {letter}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-snug">{choice.text}</div>
                        <div className="text-[10px] font-mono mt-1 flex items-center justify-between">
                          <span className={`flex items-center gap-1 ${checkSelected ? 'text-red-400' : 'text-zinc-500 group-hover:text-zinc-700'}`}>
                            <CornerDownRight className="w-3 h-3 text-red-500" />
                            {choice.consequenceShort}
                          </span>
                          <span className={`opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-widest font-bold transition-opacity ${checkSelected ? 'text-red-400' : 'text-zinc-900 font-bold'}`}>
                            SELECT →
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {choiceError && (
              <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-5 text-sm space-y-4 shadow-xl mt-4">
                <div className="flex items-center gap-2 text-red-500 font-bold font-mono text-xs uppercase tracking-widest">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse inline-block" />
                  Showrunner Authorization Failure
                </div>
                <p className="text-zinc-200 text-xs leading-relaxed">
                  {choiceError.toLowerCase().includes('leaked') || choiceError.includes('403') || choiceError.toLowerCase().includes('permission_denied') || choiceError.toLowerCase().includes('api key') ? (
                    <span>
                      The consequence could not be calculated because your <code className="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-red-400 font-mono text-xs">GEMINI_API_KEY</code> has been reported as leaked, invalid, or revoked. Please update your API Key inside Google AI Studio's Secrets/Settings section on the side/top bar.
                    </span>
                  ) : (
                    <span>{choiceError}</span>
                  )}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setChoiceError('');
                      setSelectedChoiceId(null);
                    }}
                    className="px-4 py-2 bg-red-650 hover:bg-red-600 font-mono text-[11px] font-bold text-white tracking-wider uppercase rounded-xl transition-all"
                  >
                    Clear & Retry Choice
                  </button>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 font-mono text-[11px] text-zinc-300 tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center"
                  >
                    Get API Key ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* POST CHOICE CONSEQUENCE REVEAL VIEW */}
      {reactionData && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-backdrop-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-red-950/10 shadow-2xl"
          id="consequence_aftermath_overlay"
        >
          <div className="text-center pb-4 border-b border-zinc-900/80">
            <span className="text-[10px] font-mono leading-none border border-amber-500/20 bg-amber-500/10 text-amber-500 font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Episodic Aftermath Processed
            </span>
            <h3 className="text-2xl font-display font-black text-white mt-3 tracking-wide">
              The Twist Unfolds
            </h3>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              Your decision: "{reactionData.originalChoice?.text}"
            </p>
          </div>

          {/* Primary storytelling response */}
          <div className="space-y-3.5 text-zinc-300 font-sans text-sm sm:text-base leading-relaxed">
            {reactionData.reaction.split('\n\n').map((paragraph: string, sIdx: number) => (
              <p key={sIdx}>{paragraph}</p>
            ))}
          </div>

          {/* Micro dialog comment */}
          {reactionData.characterImpact && (
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-850 text-xs italic font-sans text-red-400 flex items-start gap-2">
              <span className="text-lg leading-none">💬</span>
              <div>
                <span className="font-mono font-bold block uppercase text-[10px] tracking-wider text-zinc-400 mb-0.5">Vocal Feedback</span>
                "{reactionData.characterImpact}"
              </div>
            </div>
          )}

          {/* Visual updates layout: Character bonds and reputation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
            
            {/* Relationship impact logs */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Users className="w-3.5 h-3.5 text-pink-400" /> Cast Roster Update
              </h5>
              <div className="space-y-2">
                {reactionData.relationshipChanges.length > 0 ? (
                  reactionData.relationshipChanges.map((change: any, cIdx: number) => (
                    <div key={cIdx} className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-850 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-zinc-200 block">{change.characterName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono leading-none">{change.memoryGained}</span>
                      </div>
                      <span className={`font-mono font-bold ${change.scoreDelta >= 0 ? 'text-amber-500' : 'text-red-400'}`}>
                        {change.scoreDelta >= 0 ? `+${change.scoreDelta}` : change.scoreDelta}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-zinc-500 font-mono italic">No significant relationship delta.</p>
                )}
              </div>
            </div>

            {/* Reputation level impact lists */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Brain className="w-3.5 h-3.5 text-cyan-400" /> Reputation Adjustments
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries(reactionData.reputationChanges || {}).map(([key, value]: [string, any]) => {
                  if (!value) return null;
                  return (
                    <div key={key} className="p-2 bg-zinc-900/40 border border-zinc-850 rounded-lg flex items-center justify-between">
                      <span className="text-[10px] uppercase text-zinc-500">{key}</span>
                      <span className={`font-bold ${value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {value >= 0 ? `+${value}%` : `${value}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* SCORE BOARDS, LEVEL UP BANNER */}
          <div className="p-4 bg-gradient-to-r from-red-950/20 to-red-950/10 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-zinc-900 text-amber-500 text-lg">🎖️</div>
              <div>
                <span className="font-bold text-white block">Episodic Growth Reward</span>
                <span className="text-[10px] text-zinc-500 font-mono">+35 XP towards Show Level</span>
              </div>
            </div>
            <span className="font-mono font-black text-amber-400 text-sm tracking-wide">+35 XP</span>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleFinalizeConsequence}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-zinc-950 font-display font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              Add to Recap Hub <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
