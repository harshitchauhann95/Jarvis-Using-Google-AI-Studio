import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-2">
      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
      <span className="text-cyan-500 text-xs font-tech ml-2 animate-pulse">PROCESSING...</span>
    </div>
  );
};

export default TypingIndicator;