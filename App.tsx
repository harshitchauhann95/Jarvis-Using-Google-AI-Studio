import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Settings, Trash2, Power, Volume2, VolumeX, Smartphone, Download } from 'lucide-react';
import { initializeGemini, sendMessageToGemini } from './services/geminiService';
import { Message, ConnectionStatus } from './types';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import ArcReactor from './components/ArcReactor';
import SystemOverlay from './components/SystemOverlay';

const STORAGE_KEY = 'jarvis_history_v3';
const API_KEY = process.env.API_KEY || ''; 

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [overlayType, setOverlayType] = useState<'UPDATE' | 'COMMAND' | null>(null);
  const [sysVersion, setSysVersion] = useState("42.0.3"); // Internal State for System Version
  const [installPrompt, setInstallPrompt] = useState<any>(null); // PWA Install Prompt
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize JARVIS
  useEffect(() => {
    initializeGemini(API_KEY);
    
    // Load history
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
      setStatus(ConnectionStatus.CONNECTED);
    } else {
      // Boot up sequence
      setStatus(ConnectionStatus.CONNECTING);
      setTimeout(() => {
        setStatus(ConnectionStatus.CONNECTED);
        const bootText = "J.A.R.V.I.S. Mobile Protocol Online. System check complete. Created by Harshav Chauhan. Awaiting your orders, Sir.";
        const bootMsg: Message = {
          id: 'boot-1',
          role: 'model',
          content: bootText,
          timestamp: Date.now()
        };
        setMessages([bootMsg]);
        speak(bootText);
      }, 1500);
    }

    // PWA Install Event Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    
    // Cancel any current speech
    window.speechSynthesis.cancel();

    // Remove tags and markdown symbols for cleaner speech
    const cleanText = text
      .replace(/\[INITIATING_SYSTEM_UPDATE\]|\[EXECUTING_ROOT_COMMAND\]/g, '')
      .replace(/[*#`_]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.pitch = 0.9; // Slightly lower pitch for JARVIS feel
    utterance.rate = 1.05;
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha") || v.lang === 'en-US') || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    window.speechSynthesis.cancel();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setStatus(ConnectionStatus.PROCESSING);

    try {
      const responseText = await sendMessageToGemini(userMsg.content, messages);
      
      // Check for special tags in response
      if (responseText.includes('[INITIATING_SYSTEM_UPDATE]')) {
        setOverlayType('UPDATE');
        // Wait for overlay to finish before showing message
      } else if (responseText.includes('[EXECUTING_ROOT_COMMAND]')) {
        setOverlayType('COMMAND');
      } else {
        // Normal message
        addJarvisMessage(responseText);
      }

      // Store response for after overlay
      window.pendingResponse = responseText;

    } catch (error) {
      console.error(error);
      const errorText = "Connection disrupted. Re-calibrating secure uplink...";
      addJarvisMessage(errorText);
    } finally {
      if (!window.pendingResponse?.includes('[')) {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const addJarvisMessage = (text: string) => {
    // Clean text for display (remove tags)
    const cleanDisplay = text.replace(/\[.*?\]/g, '').trim();
    
    const jarvisMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: cleanDisplay,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, jarvisMsg]);
    setStatus(ConnectionStatus.CONNECTED);
    speak(text);
  };

  const onOverlayComplete = () => {
    // Handle Self-Improvement: Increment System Version
    if (overlayType === 'UPDATE') {
      const parts = sysVersion.split('.');
      const patch = parseInt(parts[2]) + 1;
      setSysVersion(`${parts[0]}.${parts[1]}.${patch}`);
    }

    setOverlayType(null);
    if (window.pendingResponse) {
      addJarvisMessage(window.pendingResponse);
      window.pendingResponse = null;
    }
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const clearMemory = () => {
    if (window.confirm("Purge memory banks? This cannot be undone.")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
      window.speechSynthesis.cancel();
      
      const resetText = "Memory purge complete. Protocols reset. Ready.";
      const bootMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: resetText,
        timestamp: Date.now()
      };
      setMessages([bootMsg]);
      speak(resetText);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-slate-950 text-slate-200 overflow-hidden relative font-sans select-none">
      
      {/* Visual Overlay for "System Updates" */}
      <SystemOverlay type={overlayType} onComplete={onOverlayComplete} />

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>
      
      {/* Header */}
      <header 
        className="flex-none px-4 py-3 md:p-6 border-b border-cyan-900/30 bg-slate-950/80 backdrop-blur-md z-10 flex justify-between items-center"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-3">
           <div className="block">
              <ArcReactor active={status === ConnectionStatus.PROCESSING || status === ConnectionStatus.CONNECTED} />
           </div>
           <div>
             <h1 className="text-xl md:text-3xl font-header tracking-widest text-cyan-500 font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
               JARVIS
             </h1>
             <div className="flex items-center gap-2">
               <span className={`w-1.5 h-1.5 rounded-full ${
                 status === ConnectionStatus.CONNECTED ? 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 
                 status === ConnectionStatus.PROCESSING ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
               }`}></span>
               <span className="text-[10px] font-tech tracking-widest text-cyan-700/80 uppercase">
                 Harshav Chauhan
               </span>
             </div>
           </div>
        </div>
        
        <div className="flex gap-1">
           {installPrompt && (
             <button 
               onClick={handleInstallClick}
               className="p-3 text-cyan-500 hover:text-cyan-300 transition-colors rounded-full animate-pulse"
               title="Install JARVIS System"
             >
               <Download size={18} />
             </button>
           )}
           <button 
             onClick={toggleVoice}
             className={`p-3 transition-colors rounded-full border border-transparent ${
                voiceEnabled ? 'text-cyan-400 bg-cyan-950/20' : 'text-slate-600'
             }`}
           >
             {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
           </button>
           <button 
             onClick={clearMemory}
             className="p-3 text-slate-500 hover:text-red-400 transition-colors rounded-full"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth relative z-0">
        <div className="max-w-4xl mx-auto pb-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && !overlayType && (
             <div className="flex justify-start animate-fade-in">
                <div className="ml-14 bg-cyan-950/10 border border-cyan-500/20 rounded-2xl rounded-tl-none px-4 py-3 backdrop-blur-sm">
                   <TypingIndicator />
                </div>
             </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer 
        className="flex-none p-4 bg-slate-950/90 backdrop-blur-xl border-t border-cyan-900/30 z-20"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-4xl mx-auto relative pb-2">
          <div className="flex items-end gap-2 bg-slate-900/50 border border-cyan-900/30 rounded-2xl p-2 shadow-[0_0_20px_rgba(0,0,0,0.3)] focus-within:border-cyan-500/50 transition-all duration-300">
            
            <button className="p-3 text-slate-500 hover:text-cyan-400 transition-colors rounded-xl">
              <Smartphone size={20} />
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-600 focus:ring-0 font-light text-base py-3"
              autoComplete="off"
            />
            
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`p-3 rounded-xl transition-all duration-300 ${
                inputValue.trim() && !isLoading
                  ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]' 
                  : 'bg-slate-800 text-slate-600'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="text-center mt-3">
            <span className="text-[10px] text-slate-600 font-tech tracking-[0.2em] uppercase">
               SYSTEM VERSION {sysVersion} • SECURE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Add global type for temp storage
declare global {
  interface Window {
    pendingResponse: string | null;
  }
}

export default App;