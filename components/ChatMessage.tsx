import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, Cpu } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isJarvis = message.role === 'model';

  return (
    <div className={`flex w-full mb-6 ${isJarvis ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isJarvis ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar / Icon */}
        <div className={`flex-shrink-0 flex items-start mt-1 ${isJarvis ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
            isJarvis 
              ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
              : 'bg-slate-800 border-slate-600 text-slate-300'
          }`}>
            {isJarvis ? <Cpu size={16} /> : <User size={16} />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`relative px-5 py-3 rounded-2xl border backdrop-blur-sm ${
          isJarvis
            ? 'bg-cyan-950/10 border-cyan-500/30 text-cyan-50 rounded-tl-none holographic shadow-[0_0_15px_rgba(34,211,238,0.15)]'
            : 'bg-slate-800/50 border-slate-600/50 text-slate-100 rounded-tr-none'
        }`}>
          {isJarvis && (
             <div className="absolute -top-3 left-0 text-[10px] text-cyan-500 font-tech px-2 bg-[#020617] border border-cyan-500/30 rounded-sm tracking-widest uppercase shadow-[0_0_5px_rgba(34,211,238,0.4)]">
                J.A.R.V.I.S
             </div>
          )}
          
          <div className="prose prose-invert prose-sm max-w-none font-light leading-relaxed">
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <div className="my-2 rounded-md overflow-hidden border border-slate-700 bg-slate-900/80">
                      <div className="bg-slate-800/50 px-3 py-1 text-xs font-mono text-slate-400 border-b border-slate-700 flex justify-between">
                        <span>{match[1]}</span>
                      </div>
                      <code className={`${className} block p-3 font-tech text-xs md:text-sm overflow-x-auto`} {...props}>
                        {children}
                      </code>
                    </div>
                  ) : (
                    <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-tech text-xs" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          <div className={`text-[10px] mt-2 font-tech opacity-50 ${isJarvis ? 'text-cyan-400' : 'text-slate-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;