import React from 'react';

interface ArcReactorProps {
  active: boolean;
}

const ArcReactor: React.FC<ArcReactorProps> = ({ active }) => {
  return (
    <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
      active ? 'border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)]' : 'border-slate-700 opacity-50'
    }`}>
      {/* Outer Ring */}
      <div className={`absolute inset-0 rounded-full border-2 border-dashed ${active ? 'border-cyan-300 animate-[spin_10s_linear_infinite]' : 'border-slate-600'}`}></div>
      
      {/* Inner Core */}
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
        active ? 'bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.8)]' : 'bg-slate-800'
      }`}>
        <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] ${active ? 'border-b-cyan-100' : 'border-b-slate-500'}`}></div>
      </div>
      
      {/* Glow Effects */}
      {active && (
        <>
          <div className="absolute inset-0 bg-cyan-400/10 rounded-full animate-pulse"></div>
        </>
      )}
    </div>
  );
};

export default ArcReactor;