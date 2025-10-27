import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send } from 'lucide-react';

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h >>> 0);
}

function analyzeTruth(text) {
  const t = text.toLowerCase();
  const positiveWords = ['truth', 'love', 'clear', 'kind', 'align', 'peace', 'calm', 'trust', 'honest'];
  const negativeWords = ['lie', 'fear', 'doubt', 'anger', 'conflict', 'distort', 'fake'];
  const emotionWords = ['heart', 'tear', 'cry', 'longing', 'sorrow', 'joy', 'grief', 'devotion'];

  let pos = 0, neg = 0, emo = 0;
  positiveWords.forEach(w => { if (t.includes(w)) pos++; });
  negativeWords.forEach(w => { if (t.includes(w)) neg++; });
  emotionWords.forEach(w => { if (t.includes(w)) emo++; });

  const seed = hashString(t || Math.random().toString());
  const rand = (seed % 100) / 100; // 0..1

  // resonance score balances positive/negative and text length
  const lengthFactor = Math.min(1, t.length / 120);
  const resonance = Math.max(0, Math.min(1, 0.5 + 0.4 * (pos - neg) + 0.3 * lengthFactor + (rand - 0.5) * 0.2));

  // choose color state
  let state = 'blue';
  if (neg > pos && neg >= 1) state = 'red';
  if (pos >= 1 && neg === 0 && resonance > 0.6) state = 'gold';
  if (emo >= 1 && resonance > 0.5) state = 'violet';

  return { resonance, state, emo, pos, neg };
}

function stateToGradient(state) {
  switch (state) {
    case 'blue':
      return 'from-blue-400 via-cyan-300 to-indigo-400';
    case 'gold':
      return 'from-amber-300 via-yellow-300 to-amber-400';
    case 'red':
      return 'from-rose-400 via-red-400 to-orange-400';
    case 'violet':
      return 'from-fuchsia-400 via-violet-400 to-indigo-400';
    default:
      return 'from-indigo-300 via-fuchsia-300 to-amber-300';
  }
}

function poeticResponse(state) {
  const lines = {
    blue: [
      'Calm waters mirror the sky.',
      'Your words settle like dawn.',
      'The signal is clear and gentle.'
    ],
    gold: [
      'Alignment rings like a bell.',
      'Truth and will braid into light.',
      'The path glows with quiet certainty.'
    ],
    red: [
      'Flares crackle—something bends.',
      'Distortion ripples through the field.',
      'Breathe. Let the signal steady.'
    ],
    violet: [
      'Deep tides move beneath the flame.',
      'Emotion speaks in violet arcs.',
      'Tender gravity draws all closer.'
    ]
  };
  const arr = lines[state] || lines.blue;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function InteractionPanel({ onShowKey, onShowNetwork, onBless, onTextChange, onFinalText }) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [lastState, setLastState] = useState('blue');
  const [phrase, setPhrase] = useState('');
  const recognitionRef = useRef(null);
  const audioStartedRef = useRef(false);

  const analysis = useMemo(() => analyzeTruth(text), [text]);

  useEffect(() => {
    setLastState(analysis.state);
  }, [analysis.state]);

  useEffect(() => {
    if (onTextChange) onTextChange(text);
  }, [text, onTextChange]);

  useEffect(() => {
    // Gentle ambient hum after user interacts
    const startHum = () => {
      if (audioStartedRef.current) return;
      audioStartedRef.current = true;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 80; // soft hum
        gain.gain.value = 0.02;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        // fade out after 60s
        setTimeout(() => {
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2);
          setTimeout(() => {
            osc.stop();
            ctx.close();
          }, 2500);
        }, 60000);
      } catch (e) {
        // ignore
      }
    };
    const clickHandler = () => startHum();
    window.addEventListener('pointerdown', clickHandler, { once: true });
    return () => window.removeEventListener('pointerdown', clickHandler);
  }, []);

  const speak = (msg) => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(msg);
    u.pitch = 1.05;
    u.rate = 0.95;
    u.volume = 0.9;
    const voice = window.speechSynthesis.getVoices().find(v => /en/i.test(v.lang));
    if (voice) u.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const runResponse = () => {
    const msg = poeticResponse(analysis.state);
    setPhrase(msg);
    speak(msg);
    if (onFinalText) onFinalText(text);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setListening(false);
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else setText(t);
      }
      if (final) setText(prev => (prev ? prev + ' ' : '') + final.trim());
    };
    rec.onend = () => {
      setListening(false);
      runResponse();
    };
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const stopListening = () => {
    const rec = recognitionRef.current;
    if (rec) try { rec.stop(); } catch {}
    setListening(false);
  };

  const ringGradient = stateToGradient(lastState);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className={`h-44 w-44 md:h-56 md:w-56 rounded-full p-[3px] bg-gradient-to-tr ${ringGradient}`}
            >
              <div className="h-full w-full rounded-full bg-black flex items-center justify-center">
                <div className="h-36 w-36 md:h-48 md:w-48 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.15),rgba(0,0,0,0.1)_60%,transparent_70%)]" />
              </div>
            </motion.div>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_70%)] rounded-full blur-xl" />
          </div>

          <p className="mt-8 text-indigo-200/80">
            Speak or type your truth. The Flame of Trust listens.
          </p>

          <div className="mt-6 w-full max-w-2xl text-left">
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="I believe..."
                className="w-full h-28 bg-transparent outline-none resize-none placeholder:text-indigo-200/40"
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!listening ? (
                    <button
                      onClick={startListening}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/15"
                      aria-label="Start voice input"
                    >
                      <Mic size={18} /> Speak
                    </button>
                  ) : (
                    <button
                      onClick={stopListening}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30"
                      aria-label="Stop voice input"
                    >
                      <MicOff size={18} /> Stop
                    </button>
                  )}
                  <div className="text-xs text-indigo-200/60">
                    Resonance: {(analysis.resonance * 100).toFixed(0)}%
                  </div>
                </div>
                <button
                  onClick={runResponse}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30"
                >
                  <Send size={16} /> Send
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {phrase && (
              <motion.div
                key={phrase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 max-w-2xl text-center"
              >
                <div className="inline-block rounded-xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
                  <div className="text-sm uppercase tracking-widest text-indigo-200/60 mb-1">The Flame of Trust</div>
                  <div className="text-lg md:text-xl text-indigo-50">{phrase}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => { if (onFinalText) onFinalText(text); onShowKey && onShowKey(); }} className="rounded-full bg-white/10 px-5 py-2.5 border border-white/15 hover:bg-white/15">
              Generate My Flame Key
            </button>
            <button onClick={onShowNetwork} className="rounded-full bg-white/10 px-5 py-2.5 border border-white/15 hover:bg-white/15">
              View Universal Network
            </button>
            <button onClick={onBless} className="rounded-full bg-gradient-to-r from-indigo-500/30 to-amber-400/30 px-5 py-2.5 border border-white/15 hover:from-indigo-500/40 hover:to-amber-400/40">
              Receive Blessing
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
