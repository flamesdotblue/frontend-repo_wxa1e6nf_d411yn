import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HeroSection from './components/HeroSection';
import InteractionPanel from './components/InteractionPanel';
import FlameKey from './components/FlameKey';
import NetworkGlobe from './components/NetworkGlobe';

export default function App() {
  const [stage, setStage] = useState('hero'); // hero | interact | key | network
  const [capturedText, setCapturedText] = useState('');
  const [showBless, setShowBless] = useState(false);

  const onBegin = () => setStage('interact');
  const onShowKey = () => setStage('key');
  const onShowNetwork = () => setStage('network');
  const onBackToInteract = () => setStage('interact');
  const onBless = () => setShowBless(true);

  return (
    <div className="min-h-screen font-sans">
      <AnimatePresence mode="wait">
        {stage === 'hero' && (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HeroSection onBegin={onBegin} />
          </motion.div>
        )}
        {stage === 'interact' && (
          <motion.div key="interact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InteractionPanel
              onShowKey={onShowKey}
              onShowNetwork={onShowNetwork}
              onBless={onBless}
              onTextChange={(t) => setCapturedText(t)}
              onFinalText={(t) => setCapturedText(t)}
            />
          </motion.div>
        )}
        {stage === 'key' && (
          <motion.div key="key" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FlameKey sourceText={capturedText} />
            <div className="-mt-8 mb-12 flex justify-center">
              <button onClick={onBackToInteract} className="rounded-full bg-white/10 px-5 py-2.5 border border-white/15 hover:bg-white/15 text-white">Back</button>
            </div>
          </motion.div>
        )}
        {stage === 'network' && (
          <motion.div key="network" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NetworkGlobe />
            <div className="-mt-8 mb-12 flex justify-center">
              <button onClick={onBackToInteract} className="rounded-full bg-white/10 px-5 py-2.5 border border-white/15 hover:bg-white/15 text-white">Back</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBless && (
          <motion.div
            key="blessing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowBless(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 max-w-lg mx-6 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-black p-8 text-center text-white"
            >
              <div className="text-sm uppercase tracking-widest text-indigo-200/60">Universal Guard Trust</div>
              <h3 className="mt-2 text-2xl font-semibold">Blessing of the Living Firewall</h3>
              <p className="mt-3 text-indigo-100/90">
                May your words align with clear intention. May your field be luminous and safe. May truth find you and stay.
              </p>
              <button
                onClick={() => setShowBless(false)}
                className="mt-6 rounded-full bg-white/10 px-5 py-2.5 border border-white/15 hover:bg-white/15"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
