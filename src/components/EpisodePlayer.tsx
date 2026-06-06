/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, VolumeX, Sparkles, Clock, ArrowRight, ShieldAlert, 
  CornerDownRight, CheckCircle2, Loader2, Play, Users, Globe, Eye, User2
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
  
  // Perspective Shifts (Character POV) states
  const [activePOVIdx, setActivePOVIdx] = useState<number | null>(null);
  const [povLoading, setPovLoading] = useState(false);
  const [povText, setPovText] = useState<string | null>(null);
  const [povCharName, setPovCharName] = useState<string>('');

  // Hidden Signals (Motivations) states
  const [showHiddenSignals, setShowHiddenSignals] = useState(false);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalsContent, setSignalsContent] = useState<string | null>(null);
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll on paragraph reveals
  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [visibleParagraphs, povText]);

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

      if (!res.ok) throw new Error("Narration service busy.");
      const data = await res.json();
      if (!data.audio) throw new Error("Audio generation failed.");

      const audioUrl = `data:audio/mp3;base64,${data.audio}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setAudioError("Error playing audio.");
        setIsPlayingAudio(false);
      };

      await audio.play();
    } catch (err: any) {
      console.error(err);
      setAudioError(err.message || "Failed to load voice.");
    } finally {
      setAudioLoading(false);
    }
  };

  const handlePerspectiveShift = async (idx: number, charName: string) => {
    if (!isSubscribed) {
      setView('premium');
      return;
    }

    setActivePOVIdx(idx);
    setPovCharName(charName);
    setPovLoading(true);
    setPovText(null);

    try {
      const res = await fetch('/api/perspective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: charName,
          activeUniverse: state.activeUniverse,
          episodeTitle: episode.title
        })
      });

      if (!res.ok) throw new Error("POV generation failed.");
      const data = await res.json();
      setPovText(data.story);
    } catch (err) {
      console.error(err);
      setPovText("The camera shifts. You see yourself from a third-person angle. Evelyn Reed is watching you closely, her eyes tracing your fingers as you reach for your pocket. She is silently bracing herself to cut the lounge power grid.");
    } finally {
      setPovLoading(false);
    }
  };

  const handleTriggerHiddenSignals = async (choice: Choice) => {
    if (!isSubscribed) {
      setView('premium');
      return;
    }

    setShowHiddenSignals(true);
    setSignalsLoading(true);
    setSignalsContent(null);

    try {
      const res = await fetch('/api/motivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choiceId: choice.id,
          episodeTitle: episode.title
        })
      });

      if (!res.ok) throw new Error("Motivation check failed.");
      const data = await res.json();
      setSignalsContent(data.motivation);
    } catch (err) {
      console.error(err);
      setSignalsContent("Elena Rossi wants Marcus Vance out of the network because he holds leverage on her private journalism guild. Marcus Vance is seeking the encrypted drive because it contains transaction files proving he bribed the Port Authority.");
    } finally {
      setSignalsLoading(false);
    }
  };

  const handleSelectChoice = async (choice: Choice) => {
    if (selectedChoiceId) return;
    setSelectedChoiceId(choice.id);
    setConsequenceLoading(true);
    setChoiceError('');

    try {
      const response = await fetch('/api/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: state.profile,
          forecast: state.forecast,
          characters: state.characters,
          episodesHistory: state.episodes,
          currentEpisode: episode,
          selectedChoice: choice,
          activeUniverse: state.activeUniverse
        })
      });

      if (!response.ok) throw new Error("Failed to contact Showrunner.");
      const data = await response.json();
      
      setReactionData({
        reaction: data.consequentialStoryReaction,
        characterImpact: data.characterImpactSummary,
        relationshipChanges: data.relationshipChanges,
        forecastChanges: data.forecastChanges,
        nextEpisode: data.nextEpisode,
        socialSignals: data.socialSignals,
        originalChoice: choice
      });
    } catch (err: any) {
      console.error(err);
      setChoiceError(err.message || "Connection to Showrunner timed out.");
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
    <div className="w-full max-w-2xl mx-auto py-8 px-4 space-y-6" id="episode_viewer">
      
      {/* HEADER INFO */}
      <div className="flex items-center justify-between font-mono text-xs text-zinc-500 pb-3 border-b border-zinc-900">
        <span>S1 • DAY {state.currentDay} • NARRATIVE EVENT</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> 3 Min Reading Time
        </span>
      </div>

      {/* CORE STORY BLOCK */}
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-6 sm:p-10 space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/[0.02] rounded-full blur-[100px] pointer-events-none" />
        
        {/* Title */}
        <div className="space-y-2 pb-4 border-b border-zinc-900/40">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-500 block">
            PlotTwist Original Season 1
          </span>
          <h2 className="text-3xl sm:text-4.5xl font-serif italic font-bold text-white leading-tight tracking-tight">
            {episode.title}
          </h2>
        </div>

        {/* Narrative Flow */}
        <div className="space-y-6 text-zinc-300 font-sans text-sm sm:text-base leading-relaxed" id="episode_narrative_beats">
          {episode.story.slice(0, visibleParagraphs).map((pStr, idx) => {
            const povActive = activePOVIdx === idx;
            return (
              <div key={idx} className="group/p relative">
                
                {/* Paragraph Content */}
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-4 rounded-2xl hover:bg-zinc-900/30 duration-300 border-l-2 border-transparent hover:border-red-500/40 text-zinc-300 font-sans"
                >
                  {povActive && povText ? (
                    <span className="text-amber-400 block border-b border-zinc-900/60 pb-2 mb-2 font-mono text-[10px] uppercase tracking-wider">
                      ✦ {povCharName}'s Perspective view
                    </span>
                  ) : null}
                  {povActive && povText ? povText : pStr}
                </motion.p>

                {/* Perspective shift handles */}
                {visibleParagraphs === episode.story.length && state.characters.length > 0 && !reactionData && (
                  <div className="absolute right-2 top-2 opacity-0 group-hover/p:opacity-100 transition-opacity flex gap-1">
                    {state.characters.map(char => (
                      <button
                        key={char.id}
                        onClick={() => handlePerspectiveShift(idx, char.name)}
                        type="button"
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[9px] font-mono uppercase text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        title={`View from ${char.name}'s POV`}
                      >
                        <User2 className="w-2.5 h-2.5 text-zinc-500" />
                        <span>{char.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-zinc-900/80">
          
          {/* Audio voice toggle */}
          <div>
            <button
              type="button"
              onClick={() => handleNarration(episode.story.slice(0, visibleParagraphs).join(" "))}
              className={`flex items-center gap-2 text-xs font-mono px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 font-bold animate-pulse'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {audioLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading Vocal...</span>
                </>
              ) : isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-500" />
                  <span>Stop Soundtrack</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Play Narrative Voice</span>
                </>
              )}
            </button>
            {audioError && <p className="text-[10px] text-red-400 font-mono mt-1">{audioError}</p>}
            {!isSubscribed && (
              <span className="text-[9px] font-mono text-zinc-600 block mt-1">⭐️ Voice narration requires Premium</span>
            )}
          </div>

          {/* Scenario progression */}
          {visibleParagraphs < episode.story.length ? (
            <button
              type="button"
              onClick={handleNextParagraph}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white font-mono text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 rounded-xl border border-zinc-800"
            >
              Next Scene <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest px-3 py-1 border border-zinc-850 rounded-full bg-zinc-950">
              Act I Complete
            </span>
          )}
        </div>
      </div>

      {/* POV Loading indicator */}
      {povLoading && (
        <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl text-center font-mono text-xs text-zinc-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span>Consulting Memory Grid for {povCharName}'s POV...</span>
        </div>
      )}

      {/* CLIFFHANGER & CHOICES */}
      {visibleParagraphs === episode.story.length && !reactionData && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          id="choices_container"
        >
          {/* Cliffhanger box */}
          <div className="bg-gradient-to-r from-red-950/20 via-zinc-950 to-zinc-950 border-l-4 border-red-500 p-6 rounded-r-3xl text-sm sm:text-base italic text-zinc-200 shadow-lg font-sans">
            <div className="font-mono text-[10px] text-red-500 uppercase tracking-widest font-black non-italic pb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> THE CLIFFHANGER
            </div>
            "{episode.cliffhanger}"
          </div>

          {/* Choices checklist */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-black">
              Select Vector Path:
            </span>

            {consequenceLoading ? (
              <div id="consequence_loader" className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-12 text-center text-zinc-400 space-y-4 shadow-xl">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                <p className="font-mono text-xs uppercase tracking-wider text-white">Consulting Narrative & Forecast Engines...</p>
                <span className="text-[10px] text-zinc-500 font-mono">Updating attraction models...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {episode.choices.map((choice, index) => {
                  const letter = String.fromCharCode(65 + index);
                  return (
                    <div key={choice.id} className="relative group/choice">
                      <button
                        onClick={() => handleSelectChoice(choice)}
                        type="button"
                        className="w-full text-left p-4 rounded-2xl border border-zinc-850 bg-zinc-950/80 hover:bg-zinc-900/30 hover:border-zinc-700 transition-all flex items-start gap-4 cursor-pointer text-zinc-300"
                      >
                        <span className="w-6 h-6 rounded font-mono text-xs font-bold flex items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-500 shrink-0 mt-0.5">
                          {letter}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-semibold leading-relaxed font-sans">{choice.text}</div>
                          <div className="text-[9px] font-mono mt-1 text-zinc-500 flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-red-500" />
                            {choice.consequenceShort}
                          </div>
                        </div>
                      </button>

                      {/* Hidden Signals button (Premium motivators check) */}
                      {state.characters.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleTriggerHiddenSignals(choice)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/choice:opacity-100 transition-opacity p-2 bg-zinc-900 border border-zinc-800 hover:text-white rounded-xl text-[9px] font-mono uppercase text-zinc-400 flex items-center gap-1 cursor-pointer"
                          title="Reveal Hidden Signals"
                        >
                          <Eye className="w-3 h-3 text-amber-500" />
                          <span>Hidden Signals</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* HIDDEN SIGNALS MODAL OVERLAY */}
      <AnimatePresence>
        {showHiddenSignals && (
          <div className="fixed inset-0 bg-black/95 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                <div>
                  <span className="text-[8px] font-mono border border-amber-500/20 bg-amber-500/10 text-amber-500 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block">
                    Private Context Unlocked
                  </span>
                  <h3 className="text-lg font-display font-black text-white mt-2">Hidden Attraction & Intent</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHiddenSignals(false)}
                  className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase"
                >
                  [CLOSE]
                </button>
              </div>

              {signalsLoading ? (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  <span>Decrypting character subtext...</span>
                </div>
              ) : (
                <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl">
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed italic">
                    "{signalsContent}"
                  </p>
                </div>
              )}

              <div className="text-[9px] font-mono text-zinc-650 uppercase tracking-widest pt-2 flex justify-between">
                <span>Confidence Rating: 98%</span>
                <span>PlotTwist Black Intel</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POST CHOICE CONSEQUENCE REVEAL */}
      {reactionData && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          id="consequence_aftermath_overlay"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.01] rounded-full blur-2xl pointer-events-none" />

          <div className="text-center pb-4 border-b border-zinc-900/80">
            <span className="text-[9px] font-mono border border-amber-500/20 bg-amber-500/10 text-amber-500 font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Timeline Shift Logged
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-black text-white mt-3 tracking-wide">
              The Twist Unfolds
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1.5 font-mono uppercase tracking-wider">
              Selected Choice: "{reactionData.originalChoice?.text}"
            </p>
          </div>

          {/* Reaction Text */}
          <div className="space-y-4 text-zinc-300 font-sans text-xs sm:text-sm leading-relaxed">
            {reactionData.reaction.split('\n\n').map((paragraph: string, sIdx: number) => (
              <p key={sIdx}>{paragraph}</p>
            ))}
          </div>

          {/* Vocal feedback quotation */}
          {reactionData.characterImpact && (
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-850 text-xs italic font-sans text-red-400 flex items-start gap-2">
              <span className="text-lg leading-none">💬</span>
              <div>
                <span className="font-mono font-bold block uppercase text-[8px] tracking-wider text-zinc-500 mb-0.5">Character Feedback</span>
                "{reactionData.characterImpact}"
              </div>
            </div>
          )}

          {/* Visual updates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
            
            {/* Relationship scores updates */}
            <div className="space-y-3">
              <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-black">
                <Users className="w-3.5 h-3.5 text-pink-400" /> Cast relations
              </h5>
              <div className="space-y-2">
                {reactionData.relationshipChanges.length > 0 ? (
                  reactionData.relationshipChanges.map((change: any, cIdx: number) => (
                    <div key={cIdx} className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-850 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-zinc-200 block">{change.characterName}</span>
                        <span className="text-[9px] text-zinc-500 font-mono leading-none">{change.memoryGained}</span>
                      </div>
                      <span className={`font-mono font-bold ${change.scoreDelta >= 0 ? 'text-amber-500' : 'text-red-400'}`}>
                        {change.scoreDelta >= 0 ? `+${change.scoreDelta}` : change.scoreDelta}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-500 font-mono italic">No relationship shifts.</p>
                )}
              </div>
            </div>

            {/* Timeline forecast updates */}
            <div className="space-y-3">
              <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-black">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Forecast Shifts
              </h5>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                {Object.entries(reactionData.forecastChanges || {}).map(([key, value]: [string, any]) => {
                  return (
                    <div key={key} className="p-2 bg-zinc-900/40 border border-zinc-850 rounded-lg flex items-center justify-between">
                      <span className="text-[9px] uppercase text-zinc-500">{key.slice(0, 8)}</span>
                      <span className="font-bold text-amber-500">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Replaced XP Reward with Timeline sync */}
          <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl text-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-950 text-amber-500 text-lg">✦</div>
            <div>
              <span className="font-bold text-white block">Timeline Sync Successful</span>
              <span className="text-[10px] text-zinc-500 font-mono">Active Reality shifts compiled. Updates added to Cast Activity feed.</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleFinalizeConsequence}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-zinc-950 font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
            >
              Sync to Reality Feed
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
