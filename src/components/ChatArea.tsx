import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  User, 
  ExternalLink, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  FileText, 
  ListOrdered, 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { ChatMessage, Scheme } from '../types';
import { CATEGORY_METADATA } from '../data/constants';

interface ChatAreaProps {
  messages: ChatMessage[];
  onQuickReply: (text: string) => void;
  onOpenSchemeDetail: (scheme: Scheme) => void;
  isLoading?: boolean;
}

// Lightweight, secure Markdown renderer for chat responses
function renderMarkdown(content: string, onLinkClick?: (url: string) => void) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    // Headers (### or ##)
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={lineIdx} className="text-base font-bold text-slate-900 mt-2.5 mb-1.5 tracking-tight flex items-center gap-1.5">
          {renderInlineFormatting(line.replace('### ', ''))}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={lineIdx} className="text-lg font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">
          {renderInlineFormatting(line.replace('## ', ''))}
        </h2>
      );
      return;
    }

    // Bullet points (- or * )
    if (/^\s*[-*]\s+/.test(line)) {
      const cleanLine = line.replace(/^\s*[-*]\s+/, '');
      elements.push(
        <div key={lineIdx} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-slate-700 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
          <span className="flex-1 leading-relaxed">{renderInlineFormatting(cleanLine)}</span>
        </div>
      );
      return;
    }

    // Numbered items (1. 2.)
    const numMatch = line.match(/^\s*(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={lineIdx} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-slate-700 pl-1">
          <span className="font-bold text-orange-600 text-xs mt-0.5 shrink-0 min-w-[16px]">{numMatch[1]}.</span>
          <span className="flex-1 leading-relaxed">{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={lineIdx} className="h-1.5" />);
      return;
    }

    // Regular paragraphs
    elements.push(
      <p key={lineIdx} className="my-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
  });

  return elements;
}

// Inline formatting: Bold **text**, Links [text](url), Italic *text*, Code `code`
function renderInlineFormatting(text: string): React.ReactNode {
  // Replace links [label](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(formatBoldItalic(text.slice(lastIndex, match.index)));
    }
    const label = match[1];
    const url = match[2];
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 text-orange-600 hover:text-orange-700 font-semibold underline decoration-orange-300 hover:decoration-orange-600 underline-offset-2 transition-colors"
      >
        <span>{label}</span>
        <ExternalLink className="w-2.5 h-2.5 inline" />
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(formatBoldItalic(text.slice(lastIndex)));
  }

  return parts.length > 0 ? parts : formatBoldItalic(text);
}

function formatBoldItalic(text: string): React.ReactNode {
  // Split on **bold**
  const boldParts = text.split(/\*\*([^*]+)\*\*/g);
  return boldParts.map((part, idx) => {
    if (idx % 2 === 1) {
      return <strong key={idx} className="font-bold text-slate-900">{part}</strong>;
    }
    // Split on *italic*
    const italicParts = part.split(/\*([^*]+)\*/g);
    return italicParts.map((iPart, iIdx) => {
      if (iIdx % 2 === 1) {
        return <em key={iIdx} className="italic text-slate-600">{iPart}</em>;
      }
      return iPart;
    });
  });
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onQuickReply,
  onOpenSchemeDetail,
  isLoading = false
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [checkedDocsMap, setCheckedDocsMap] = useState<Record<string, Record<string, boolean>>>({});

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text to Speech
  const handleSpeak = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      // Clean markdown tags for clear speech
      const cleanText = text.replace(/[*#_`\[\]]/g, '').replace(/https?:\/\/\S+/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Try Indian English or standard voice
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
      if (indianVoice) utterance.voice = indianVoice;

      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  const toggleDocumentCheck = (msgId: string, docName: string) => {
    setCheckedDocsMap(prev => {
      const msgDocs = prev[msgId] || {};
      return {
        ...prev,
        [msgId]: {
          ...msgDocs,
          [docName]: !msgDocs[docName]
        }
      };
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
      {messages.map((message) => {
        const isUser = message.sender === 'user';
        const isCopied = copiedId === message.id;
        const isSpeaking = speakingId === message.id;

        return (
          <div 
            key={message.id} 
            className={`flex items-start gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} group animate-in fade-in duration-200`}
          >
            {/* Avatar */}
            <div className={`
              w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs
              ${isUser 
                ? 'bg-slate-800 text-white' 
                : 'bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-600 text-white font-bold'
              }
            `}>
              {isUser ? (
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
              ) : (
                <span className="text-xs font-black tracking-tight">SS</span>
              )}
            </div>

            {/* Message Bubble & Content */}
            <div className={`flex flex-col max-w-[88%] sm:max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-bold text-slate-500">
                  {isUser ? 'You' : 'SchemeSathi AI'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {message.timestamp}
                </span>
              </div>

              <div className={`
                relative p-4 sm:p-5 rounded-2xl text-slate-800 text-xs sm:text-sm leading-relaxed
                ${isUser 
                  ? 'bg-orange-600 text-white rounded-tr-none shadow-xs' 
                  : 'bg-white border border-slate-200/90 rounded-tl-none shadow-xs'
                }
              `}>
                {/* Text Content */}
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                ) : (
                  <div>{renderMarkdown(message.text)}</div>
                )}

                {/* 1. MATCHED SCHEMES CARDS (when type === 'schemes_list') */}
                {message.matchedSchemes && message.matchedSchemes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Matching Schemes ({message.matchedSchemes.length})</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {message.matchedSchemes.map((scheme) => {
                        const meta = CATEGORY_METADATA[scheme.category] || { 
                          label: scheme.category, 
                          icon: '🏛️', 
                          color: 'text-slate-800', 
                          bg: 'bg-slate-50 border-slate-200' 
                        };
                        const reasons = message.matchReasons?.[scheme.id] || [];

                        return (
                          <div 
                            key={scheme.id}
                            className="bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-orange-300 rounded-xl p-3.5 transition-all shadow-2xs hover:shadow-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
                                  <span>{meta.icon}</span>
                                  <span>{meta.label}</span>
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${scheme.level === 'State' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                  {scheme.level === 'State' ? `${scheme.applicableStates[0]} State` : 'Central Govt'}
                                </span>
                              </div>

                              {scheme.benefitAmount && (
                                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  💰 {scheme.benefitAmount}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 flex items-baseline gap-1.5">
                              <span>{scheme.name}</span>
                              <span className="text-xs font-semibold text-orange-600">({scheme.shortName})</span>
                            </h4>

                            <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-2">
                              "{scheme.tagline}"
                            </p>

                            {/* Why this matches you rationale box */}
                            {reasons.length > 0 && (
                              <div className="mt-2.5 p-2 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] text-amber-950">
                                <div className="font-bold flex items-center gap-1 text-amber-900 mb-0.5">
                                  <Info className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Why you qualify for this scheme:</span>
                                </div>
                                <ul className="space-y-0.5 pl-1">
                                  {reasons.map((r, rIdx) => (
                                    <li key={rIdx} className="leading-tight">{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Buttons for Scheme */}
                            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  onClick={() => onQuickReply(`What documents are required for ${scheme.shortName}?`)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-orange-50 hover:text-orange-700 border border-slate-200 hover:border-orange-200 rounded-lg transition-all flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3 text-slate-500" />
                                  <span>Documents</span>
                                </button>

                                <button
                                  onClick={() => onQuickReply(`How do I apply for ${scheme.shortName}?`)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-orange-50 hover:text-orange-700 border border-slate-200 hover:border-orange-200 rounded-lg transition-all flex items-center gap-1"
                                >
                                  <ListOrdered className="w-3 h-3 text-slate-500" />
                                  <span>Apply Steps</span>
                                </button>

                                <a
                                  href={scheme.officialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all flex items-center gap-1"
                                >
                                  <span>Official Portal</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>

                              <button
                                onClick={() => onOpenSchemeDetail(scheme)}
                                className="px-2.5 py-1 text-[11px] font-bold text-orange-700 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                              >
                                <span>Full Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. INTERACTIVE DOCUMENT CHECKLIST */}
                {message.selectedScheme && message.type === 'document_checklist' && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Checklist for {message.selectedScheme.shortName}</span>
                        <span className="text-[11px] text-orange-600 font-semibold">
                          Click to mark ready
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {message.selectedScheme.documentsRequired.map((doc, idx) => {
                          const isChecked = checkedDocsMap[message.id]?.[doc.name] ?? false;
                          return (
                            <div 
                              key={idx}
                              onClick={() => toggleDocumentCheck(message.id, doc.name)}
                              className={`
                                flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border text-xs
                                ${isChecked 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }
                              `}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold flex items-center gap-1">
                                  <span>{doc.name}</span>
                                  {doc.mandatory ? (
                                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 rounded border border-rose-200">Mandatory</span>
                                  ) : (
                                    <span className="text-[9px] font-medium text-slate-500">Optional</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 leading-snug">{doc.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-200">
                        <span>
                          Ready:{' '}
                          <strong className="text-slate-800">
                            {Object.values(checkedDocsMap[message.id] || {}).filter(Boolean).length} of {message.selectedScheme.documentsRequired.length}
                          </strong>
                        </span>
                        <a
                          href={message.selectedScheme.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
                        >
                          <span>Open {message.selectedScheme.portalName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bot Message Bottom Actions (Copy, TTS) */}
              {!isUser && (
                <div className="flex items-center gap-1 mt-1 pl-1">
                  <button
                    onClick={() => handleCopy(message.id, message.text)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                    title={isCopied ? 'Copied to clipboard' : 'Copy message'}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleSpeak(message.id, message.text)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                    title={isSpeaking ? 'Stop audio' : 'Listen aloud'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-orange-600 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* Quick Reply Pills */}
              {message.quickReplies && message.quickReplies.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 max-w-full">
                  {message.quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => onQuickReply(reply)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 active:scale-95"
                    >
                      <span>{reply}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in duration-200">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
            <span className="text-xs font-black">SS</span>
          </div>
          <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-xs text-slate-400 ml-1 font-medium">Finding verified scheme information...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
};
