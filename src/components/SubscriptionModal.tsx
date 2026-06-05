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
      <div className="text-center mb-8">
        <motion.div 
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4"
        >
          <Gem className="w-8 h-8 fill-amber-500/15" />
        </motion.div>
        <h2 className="text-4xl font-display font-black text-white tracking-tight">
          Unlock the PlotTwist <span className="text-amber-400">Premium Cut</span>
        </h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">
          Scale past narrative constraints. Shape billionaires' alternate realities, listen to atmospheric AI voice narrator tracks, and override choice pathways.
        </p>
      </div>

      {modalState === 'pricing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Free Tier card */}
            <div 
              onClick={() => setTier('free')}
              className={`p-6 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                tier === 'free' 
                  ? 'bg-zinc-900 border-zinc-500' 
                  : 'bg-zinc-950/40 border-zinc-900 text-zinc-400'
              }`}
            >
              <div className="space-y-1">
                <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase font-black">Standard Feed</span>
                <h3 className="text-xl font-display font-bold text-white">Viewer Pass</h3>
              </div>
              <div className="my-4">
                <span className="text-3xl font-display font-black text-white">$0</span>
                <span className="text-xs font-mono text-zinc-500 ml-1">/ Month</span>
              </div>
              
              <ul className="space-y-2.5 text-xs font-sans pb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-zinc-500" />
                  <span>1 Daily Episode limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-zinc-500" />
                  <span>3 Standard character relationships</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-650 line-through">
                  <span>No AI vocal readouts support</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-650 line-through">
                  <span>No alternate billing timelines</span>
                </li>
              </ul>
            </div>

            {/* Premium Tier card */}
            <div 
              onClick={() => setTier('premium')}
              className={`p-6 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden card-backdrop-glass-premium ${
                tier === 'premium' 
                  ? 'border-amber-500 shadow-xl shadow-amber-500/10' 
                  : 'bg-zinc-950/40 border-zinc-900'
              }`}
            >
              <div className="absolute top-3 right-3 bg-amber-500 text-zinc-950 font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                Most Popular
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[9px] tracking-widest text-amber-500 uppercase font-black">SaaS Creator Pass</span>
                <h3 className="text-xl font-display font-bold text-white flex items-center gap-1.5">
                  Universal Protagonist <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
              </div>

              <div className="my-4">
                <span className="text-3xl font-display font-black text-white">$9.99</span>
                <span className="text-xs font-mono text-zinc-400 ml-1">/ Month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 font-sans pb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">Unlimited procedural daily episodes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Atmospheric AI voice narration modules</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300">Access to Billionaire, Hollywood & Founder Realities</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Custom emergency event sandboxes</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
            >
              Return Home
            </button>
            <button
              type="button"
              onClick={startCheckout}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 font-display font-black text-xs uppercase tracking-widest text-zinc-950 hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              {tier === 'free' ? 'Keep Free Tier' : 'Checkout Premium'}
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
                <p className="text-[10px] text-zinc-500 font-mono">SECURE SANDBOX ROUTING ENVIRONMENT</p>
              </div>
            </div>
            <span className="font-mono text-xs text-amber-500 font-bold">$9.99 USD</span>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-400 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase block text-[10px] mb-0.5">Integration Note</span>
              Razorpay API is active in Sandbox mode. Fill any dummy fields below to unlock real premium privileges instantly!
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Credit/Debit Card Number</label>
              <input 
                type="text" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="4111 2222 3333 4444"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">Expiry Date</label>
                <input 
                  type="text" 
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">CVV Code</label>
                <input 
                  type="password" 
                  value={cardCVV}
                  onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="•••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
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
                <span>Routing...</span>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay $9.99</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* RAZORPAY PAYMENT SUCCESS OVERLAY */}
      {modalState === 'success' && (
        <div className="card-backdrop-glass rounded-3xl p-8 max-w-md mx-auto text-center space-y-6 border border-amber-500/20 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center rounded-full mx-auto text-2xl animate-bounce">
            🎉
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-display font-black text-white">Payment Complete!</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Your Razorpay Sandbox transaction was approved successfully. Subscription ID: <span className="font-mono text-amber-500 font-bold">sub_PX9841A8</span>.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex flex-col gap-2.5 text-xs text-left max-w-xs mx-auto">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Voice Narration unlocked</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Alternate realities unlocked</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Premium sandboxes unlocked</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full max-w-xs px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 text-xs font-mono font-bold uppercase rounded-xl tracking-wider transition-all cursor-pointer"
          >
            Enter Season Hub 🎬
          </button>
        </div>
      )}

    </div>
  );
}
