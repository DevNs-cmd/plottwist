/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gem, Check, CreditCard, ShieldCheck, Heart, Sparkles, Volume2, Globe, AlertCircle } from 'lucide-react';

interface SubscriptionModalProps {
  onSubscribe: () => void;
  isSubscribed: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ onSubscribe, isSubscribed, onClose }: SubscriptionModalProps) {
  const [tier, setTier] = useState<'free' | 'premium'>('premium');
  const [modalState, setModalState] = useState<'pricing' | 'payment' | 'success'>('pricing');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const startCheckout = () => {
    if (tier === 'free') {
      onClose();
      return;
    }
    setModalState('payment');
  };

  const executeSandboxRazorpay = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setModalState('success');
      onSubscribe();
    }, 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4" id="subscription_locker">
      
      {/* HEADER SECTION */}
      <div className="text-center mb-10">
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4"
        >
          <Gem className="w-8 h-8 fill-amber-500/10" />
        </motion.div>
        <h2 className="text-4xl font-display font-black text-white tracking-tight uppercase">
          Unlock <span className="text-amber-400">PlotTwist Black</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-2.5 max-w-md mx-auto font-sans leading-relaxed">
          Step past standard narrative limits. Expose hidden character chemistry, play audio voice memos, decrypt secrets vault files, and forecast timeline consequences.
        </p>
      </div>

      {modalState === 'pricing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Free Tier card */}
            <div 
              onClick={() => setTier('free')}
              className={`p-6 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                tier === 'free' 
                  ? 'bg-zinc-900/40 border-zinc-500' 
                  : 'bg-zinc-950/20 border-zinc-900 text-zinc-500'
              }`}
            >
              <div className="space-y-1">
                <span className="font-mono text-[9px] tracking-widest text-zinc-650 uppercase font-black">Standard Mode</span>
                <h3 className="text-lg font-display font-bold text-white">Viewer Pass</h3>
              </div>
              <div className="my-4">
                <span className="text-2xl font-display font-black text-white">$0</span>
                <span className="text-[10px] font-mono text-zinc-500 ml-1">/ Month</span>
              </div>
              
              <ul className="space-y-3 text-xs font-sans pb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Standard timeline developments</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-700 line-through">
                  <span>Character Voice notes & audio</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-700 line-through">
                  <span>Hidden Attraction Insights map</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-700 line-through">
                  <span>Vault decryption archives</span>
                </li>
              </ul>
            </div>

            {/* Premium Tier card */}
            <div 
              onClick={() => setTier('premium')}
              className={`p-6 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden card-backdrop-glass-premium ${
                tier === 'premium' 
                  ? 'border-amber-500 shadow-2xl shadow-amber-500/5' 
                  : 'bg-zinc-950/20 border-zinc-900'
              }`}
            >
              <div className="absolute top-3.5 right-3.5 bg-amber-500 text-zinc-950 font-mono text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Universal access
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] tracking-widest text-amber-500 uppercase font-black">PlotTwist Black membership</span>
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-1.5">
                  Black Director Pass <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
              </div>

              <div className="my-4">
                <span className="text-2xl font-display font-black text-white">₹99</span>
                <span className="text-[10px] font-mono text-zinc-400 ml-1">/ Month</span>
              </div>

              <ul className="space-y-3 text-xs text-zinc-300 font-sans pb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">Playable Voice Note audio messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hidden Attraction Insights map</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">Decrypt secret vault files & DMs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Explore alternate timeline forecasts</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
            >
              Return Home
            </button>
            <button
              type="button"
              onClick={startCheckout}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 font-display font-black text-xs uppercase tracking-widest text-zinc-950 hover:brightness-110 transition-all shadow-lg cursor-pointer"
            >
              {tier === 'free' ? 'Keep Viewer Pass' : 'Unlock PlotTwist Black'}
            </button>
          </div>
        </div>
      )}

      {/* RAZORPAY SANDBOX WINDOW */}
      {modalState === 'payment' && (
        <div className="card-backdrop-glass rounded-3xl p-6 sm:p-8 max-w-md mx-auto space-y-6 border border-zinc-800 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <span className="text-xl">💳</span>
              <div>
                <h4 className="text-sm font-bold text-white font-display">Razorpay Payment Sandbox</h4>
                <p className="text-[9px] text-zinc-500 font-mono">SECURE INTEGRATION ROUTER</p>
              </div>
            </div>
            <span className="font-mono text-xs text-amber-500 font-bold">₹99 INR</span>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-400 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase block text-[9px] mb-0.5">Sandbox Mode Active</span>
              Razorpay API is routed in Sandbox mode. Fill any dummy card credentials below to activate PlotTwist Black instantly.
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-mono text-zinc-505 uppercase tracking-widest mb-1.5">Card Number</label>
              <input 
                type="text" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="4111 2222 3333 4444"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Expiry</label>
                <input 
                  type="text" 
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">CVV</label>
                <input 
                  type="password" 
                  value={cardCVV}
                  onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="•••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={paymentLoading}
              onClick={() => setModalState('pricing')}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-500 hover:text-white transition-all flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={paymentLoading}
              onClick={executeSandboxRazorpay}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold uppercase transition-all flex-1 flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {paymentLoading ? (
                <span>Authorizing...</span>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Authorize Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* RAZORPAY PAYMENT SUCCESS OVERLAY */}
      {modalState === 'success' && (
        <div className="card-backdrop-glass rounded-3xl p-8 max-w-md mx-auto text-center space-y-6 border border-amber-500/20 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center rounded-full mx-auto text-2xl animate-bounce">
            ✦
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">PlotTwist Black Active</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Your sandbox transaction was approved successfully. Subscription ID: <span className="font-mono text-amber-500 font-bold">sub_Black841A8</span>.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col gap-2.5 text-xs text-left max-w-xs mx-auto font-sans">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Attraction Insights map active</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Voice confession audio unlocked</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Reality Vault decryption key synced</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full max-w-xs px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 text-xs font-mono font-bold uppercase rounded-xl tracking-wider transition-all cursor-pointer"
          >
            Enter Black Reality 🎬
          </button>
        </div>
      )}

    </div>
  );
}
