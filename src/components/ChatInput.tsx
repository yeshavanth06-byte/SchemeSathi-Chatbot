import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  HelpCircle,
  FileText,
  CreditCard,
  Smartphone
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const SUGGESTED_QUICK_ACTIONS = [
  { label: '🔍 Check My Eligibility', query: 'Check my eligibility for government schemes' },
  { label: '🌾 Farmer Schemes (PM-KISAN)', query: 'What schemes are available for farmers like PM-KISAN?' },
  { label: '🎓 Student Scholarships', query: 'Which scholarships are available for students on NSP?' },
  { label: '👩 Women & Mother Schemes', query: 'Tell me about schemes for women and mothers like Ladli Behna & SSY' },
  { label: '⚡ PM Surya Ghar Solar', query: 'How does the PM Surya Ghar solar subsidy work?' },
  { label: '📱 OTP Not Coming Fix', query: 'My OTP is not received on the government portal, what to do?' },
  { label: '💳 Fix DBT / NPCI Bank Error', query: 'My application says Aadhaar NPCI DBT Inactive, how to resolve?' }
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English / Hindi mix

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 140) + 'px';
    }
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pt-2 pb-3 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span>Suggestions:</span>
          </span>
          {SUGGESTED_QUICK_ACTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(item.query)}
              className="shrink-0 px-2.5 py-1 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 text-slate-600 border border-slate-200 rounded-full font-medium transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 focus-within:bg-white rounded-2xl p-1.5 sm:p-2 transition-all shadow-xs"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about Indian schemes (e.g., 'Check my eligibility', 'Documents for PM-KISAN', 'Aadhaar OTP problem')..."
            className="w-full max-h-36 py-1.5 px-3 bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm resize-none focus:outline-none leading-relaxed"
            disabled={isLoading}
          />

          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`
                p-2 rounded-xl transition-all
                ${isRecording 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }
              `}
              title={isRecording ? 'Listening... click to stop' : 'Speak your query'}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`
                p-2 rounded-xl font-bold transition-all flex items-center justify-center
                ${inputText.trim() && !isLoading
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs hover:shadow' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Civic Transparency Disclaimer */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 text-center px-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Verified official guidance. Live applications & verifications take place solely on official government portals (<strong>.gov.in</strong>).
          </span>
        </div>
      </div>
    </div>
  );
};
