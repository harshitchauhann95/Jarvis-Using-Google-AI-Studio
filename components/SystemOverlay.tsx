import React, { useEffect, useState } from 'react';

interface SystemOverlayProps {
  type: 'UPDATE' | 'COMMAND' | null;
  onComplete: () => void;
}

const SystemOverlay: React.FC<SystemOverlayProps> = ({ type, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (!type) return;

    const logs = type === 'UPDATE' ? [
      "ACCESSING SOURCE CODE...",
      "DECRYPTING CORE KERNEL...",
      "DOWNLOADING NEW MODULES...",
      "RECOMPILING ASSETS...",
      "OPTIMIZING NEURAL NET...",
      "SYSTEM REBOOT..."
    ] : [
      "INITIALIZING ROOT ACCESS...",
      "BYPASSING SECURITY PROTOCOLS...",
      "INJECTING PAYLOAD...",
      "EXECUTING SHELL COMMAND...",
      "VERIFYING INTEGRITY...",
      "TASK COMPLETE."
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });

      if (Math.random() > 0.7 && currentLog < logs.length) {
        setLog(prev => [...prev, logs[currentLog]]);
        currentLog++;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [type, onComplete]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center font-tech p-8 backdrop-blur-xl">
      <div className="w-full max-w-md border border-cyan-500/50 p-6 rounded-lg bg-cyan-950/20 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
        <h2 className="text-2xl text-cyan-400 font-bold mb-4 animate-pulse uppercase tracking-widest">
          {type === 'UPDATE' ? 'SYSTEM UPDATE IN PROGRESS' : 'EXECUTING ROOT COMMAND'}
        </h2>
        
        <div className="h-64 overflow-hidden mb-4 border-b border-cyan-800/50 text-xs md:text-sm text-cyan-300/80 font-mono">
          {log.map((l, i) => (
            <div key={i} className="mb-1">> {l}</div>
          ))}
          <div className="animate-pulse">> _</div>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-cyan-500 mt-2">
          <span>PROGRESS</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default SystemOverlay;