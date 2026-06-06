/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Volume2, VolumeX, MessageSquare, ShieldAlert, 
  ChevronRight, Play, Square, Headphones, HelpCircle, FlameKindling, Loader2
} from 'lucide-react';
import { Character, DirectMessage } from '../types';
import { getAvatarUrl } from '../utils';

interface CharacterDMsProps {
  characters: Character[];
  messages: DirectMessage[];
  onSendMessage: (characterId: string, text: string) => void;
  plotTwistBlackActive: boolean;
  onUpgradePrompt?: () => void;
}

export default function CharacterDMs({ 
  characters, 
  messages, 
  onSendMessage, 
  plotTwistBlackActive,
  onUpgradePrompt 
}: CharacterDMsProps) {
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [voiceLoadingId, setVoiceLoadingId] = useState<string | null>(null);
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedCharId]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  const activeChar = characters.find(c => c.id === selectedCharId) || null;
  
  // Filter messages for current character
  const filteredMessages = messages.filter(
    msg => (msg.senderId === selectedCharId && msg.senderId !== "user") || 
           (msg.senderId === "user" && messages.some(m => m.id === msg.id && activeChar?.name === m.senderName))
  );

  const handleSend = () => {
    if (!selectedCharId || !inputText.trim()) return;
    onSendMessage(selectedCharId, inputText.trim());
    setInputText('');
  };

  const handleVoiceNotePlay = async (msg: DirectMessage) => {
    if (!plotTwistBlackActive) {
      onUpgradePrompt?.();
      return;
    }

    if (playingMsgId === msg.id && currentAudioRef.current) {
      currentAudioRef.current.pause();
      setPlayingMsgId(null);
      return;
    }

    // Stop current audio if playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    // Check if voice note already has audio payload, if not we request TTS from server
    setVoiceLoadingId(msg.id);
    try {
      let audioBase64 = msg.audioUrl;
      
      if (!audioBase64) {
        // Fetch TTS dynamically from server
        const res = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: msg.text, voice: 'Zephyr' })
        });
        
        if (!res.ok) throw new Error("TTS generation failed.");
        const data = await res.json();
        audioBase64 = data.audio;
      }

      if (!audioBase64) throw new Error("No audio payload generated.");

      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setPlayingMsgId(msg.id);
        setVoiceLoadingId(null);
      };
      audio.onended = () => {
        setPlayingMsgId(null);
      };
      audio.onerror = () => {
        setPlayingMsgId(null);
        setVoiceLoadingId(null);
      };

      await audio.play();
    } catch (err) {
      console.error(err);
      setPlayingMsgId(null);
      setVoiceLoadingId(null);
    }
  };

  // Get dynamic state color badge
  const getStateColor = (state: Character['currentState']) => {
    switch (state) {
      case 'Intrigued': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'Jealous': return 'text-red-400 border-red-500/20 bg-red-500/5';
      case 'Protective': return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
      case 'Intimate': return 'text-pink-400 border-pink-500/20 bg-pink-500/5';
      case 'Distant': return 'text-zinc-500 border-zinc-800 bg-zinc-900/10';
      default: return 'text-zinc-400 border-zinc-800 bg-zinc-900/5';
    }
  };

  const getAvatar = (char: Character) => getAvatarUrl(char.name, char.avatarUrl);

  return (
    <div id="character_inbox_matrix" className="h-[600px] flex rounded-3xl bg-zinc-950/80 border border-zinc-900 overflow-hidden">
      
      {/* SIDEBAR LIST */}
      <div className={`w-full md:w-80 border-r border-zinc-900 flex flex-col ${selectedCharId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-zinc-900">
          <h4 className="text-sm font-display font-black text-white uppercase tracking-wider">Cast Directives</h4>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Secure Character Chats</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/40">
          {characters.map(char => {
            const hasUnread = messages.some(m => m.senderId === char.id && !m.isRead);
            const active = char.id === selectedCharId;
            const lastMsg = [...messages].reverse().find(
              m => m.senderId === char.id || (m.senderId === "user" && messages.some(orig => orig.id === m.id && orig.senderName === char.name))
            );

            return (
              <button
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                type="button"
                className={`w-full text-left p-4 hover:bg-zinc-900/40 transition-all flex items-center gap-3 relative cursor-pointer ${
                  active ? 'bg-zinc-900/60' : ''
                }`}
              >
                {hasUnread && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
                )}
                
                <img 
                  src={getAvatar(char)} 
                  alt={char.name} 
                  className="w-10 h-10 rounded-full object-cover border border-zinc-850 bg-zinc-900"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-bold text-white block truncate">{char.name}</span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">{char.archetype}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate font-sans">
                    {lastMsg ? lastMsg.text : char.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`flex-1 flex flex-col bg-zinc-950/20 ${!selectedCharId ? 'hidden md:flex' : 'flex'}`}>
        {activeChar ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedCharId(null)}
                  className="md:hidden text-xs font-mono text-zinc-400 hover:text-white uppercase mr-1"
                >
                  ← Back
                </button>
                <img 
                  src={getAvatar(activeChar)} 
                  alt={activeChar.name} 
                  className="w-9 h-9 rounded-full object-cover border border-zinc-800 bg-zinc-900"
                />
                <div>
                  <h5 className="text-xs font-bold text-white">{activeChar.name}</h5>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[8px] font-mono border px-1.5 py-0.2 rounded-md ${getStateColor(activeChar.currentState)}`}>
                      Status: {activeChar.currentState}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">{activeChar.archetype}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  Bond {activeChar.relationshipScore}%
                </span>
              </div>
            </div>

            {/* Messages feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4" id="chat_feed_scroller">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-650 font-mono text-[10px] uppercase tracking-wider">
                  No records of direct conversations.
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const isUser = msg.senderId === "user";
                  return (
                    <div 
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed ${
                        isUser 
                          ? 'bg-zinc-900 text-white rounded-tr-sm border border-zinc-800' 
                          : 'bg-zinc-950 text-zinc-200 border border-zinc-900 rounded-tl-sm relative overflow-hidden'
                      }`}>
                        
                        {/* Sender name if not user */}
                        {!isUser && (
                          <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 uppercase tracking-wide">
                            <span>{msg.senderName}</span>
                            {msg.isVoiceNote && (
                              <span className="text-[8px] font-bold text-amber-500 uppercase flex items-center gap-0.5">
                                <Headphones className="w-2.5 h-2.5" /> VOICE NOTE
                              </span>
                            )}
                          </div>
                        )}

                        {msg.isVoiceNote ? (
                          <div className="space-y-3">
                            <p className="italic text-zinc-300">"{msg.text}"</p>
                            
                            {/* Voice note custom playback widget */}
                            <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 p-2 rounded-xl">
                              <button
                                type="button"
                                onClick={() => handleVoiceNotePlay(msg)}
                                disabled={voiceLoadingId === msg.id}
                                className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-40"
                              >
                                {voiceLoadingId === msg.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                                ) : playingMsgId === msg.id ? (
                                  <Square className="w-3.5 h-3.5 fill-zinc-950 stroke-zinc-950" />
                                ) : (
                                  <Play className="w-4 h-4 fill-zinc-950 stroke-zinc-950 ml-0.5" />
                                )}
                              </button>

                              <div className="flex-1 space-y-1">
                                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wide">Play audio confession</span>
                                {/* Mock animated audio waves */}
                                <div className="h-4 flex items-center gap-0.5 overflow-hidden">
                                  {[...Array(24)].map((_, i) => {
                                    const randHeight = playingMsgId === msg.id 
                                      ? Math.floor(Math.random() * 12) + 4 
                                      : 3;
                                    return (
                                      <motion.div
                                        key={i}
                                        className={`w-[2px] rounded-full ${playingMsgId === msg.id ? 'bg-amber-500' : 'bg-zinc-700'}`}
                                        animate={{ height: randHeight }}
                                        transition={{ duration: 0.15 }}
                                        style={{ height: `${randHeight}px` }}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            {!plotTwistBlackActive && (
                              <span className="text-[8px] font-mono text-zinc-600 block">✦ Voice notes require PlotTwist Black</span>
                            )}
                          </div>
                        ) : (
                          <p>{msg.text}</p>
                        )}

                        <span className="text-[8px] font-mono text-zinc-600 block text-right pt-0.5">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick replies / TextInput panel */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/40">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Send confidential message to ${activeChar.name}...`}
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 p-6">
            <MessageSquare className="w-8 h-8 text-zinc-700 stroke-[1.5]" />
            <span className="font-mono text-xs uppercase tracking-widest">Select a cast contact</span>
            <p className="text-[10px] text-zinc-600 max-w-xs text-center font-sans">
              Choose a character from the cast roster sidebar to review direct communications and voice warnings.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
