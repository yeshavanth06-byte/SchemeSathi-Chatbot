import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  HelpCircle, 
  Phone, 
  ShieldCheck, 
  Sliders, 
  Send,
  Building,
  CheckSquare,
  Square
} from 'lucide-react';
import { Scheme } from '../types';
import { CATEGORY_METADATA } from '../data/constants';

interface SchemeModalProps {
  scheme: Scheme | null;
  onClose: () => void;
  onAskAboutScheme: (scheme: Scheme, questionType?: string) => void;
}

export const SchemeModal: React.FC<SchemeModalProps> = ({
  scheme,
  onClose,
  onAskAboutScheme
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'documents' | 'procedure' | 'troubleshooting'>('overview');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  if (!scheme) return null;

  const categoryMeta = CATEGORY_METADATA[scheme.category] || { 
    label: scheme.category, 
    icon: '🏛️', 
    color: 'text-slate-800', 
    bg: 'bg-slate-50 border-slate-200' 
  };

  const toggleDoc = (docName: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const totalDocs = scheme.documentsRequired.length;
  const readyDocs = scheme.documentsRequired.filter(d => checkedDocs[d.name]).length;
  const progressPercent = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-navy-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-sm`}>
              <span>{categoryMeta.icon}</span>
              <span>{categoryMeta.label}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-200 border border-orange-400/30">
              {scheme.level} Govt Scheme
            </span>
            {scheme.benefitAmount && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                💰 {scheme.benefitAmount}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight pr-8">
            {scheme.name} <span className="text-orange-400 font-bold">({scheme.shortName})</span>
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{scheme.ministry}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium italic">
            "{scheme.tagline}"
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 sm:px-6 gap-2 text-xs sm:text-sm font-semibold text-slate-600 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'overview' 
                ? 'border-orange-600 text-orange-600 font-bold bg-white -mb-px rounded-t-lg' 
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Overview & Benefits</span>
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'eligibility' 
                ? 'border-orange-600 text-orange-600 font-bold bg-white -mb-px rounded-t-lg' 
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Eligibility Criteria</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'documents' 
                ? 'border-orange-600 text-orange-600 font-bold bg-white -mb-px rounded-t-lg' 
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Documents Checklist ({readyDocs}/{totalDocs})</span>
          </button>

          <button
            onClick={() => setActiveTab('procedure')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'procedure' 
                ? 'border-orange-600 text-orange-600 font-bold bg-white -mb-px rounded-t-lg' 
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>How to Apply</span>
          </button>

          <button
            onClick={() => setActiveTab('troubleshooting')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'troubleshooting' 
                ? 'border-orange-600 text-orange-600 font-bold bg-white -mb-px rounded-t-lg' 
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Troubleshooting</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-sm text-slate-700 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  About the Scheme
                </h4>
                <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                  {scheme.description}
                </p>
              </div>

              {/* Key Benefits List */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Key Financial & Welfare Benefits</span>
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {scheme.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheme Specs quick grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Coverage</span>
                  <span className="font-semibold text-slate-800">
                    {scheme.applicableStates.includes('All') ? 'Pan India (All States)' : scheme.applicableStates.join(', ')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Application Mode</span>
                  <span className="font-semibold text-slate-800">Online & CSC Centers</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block mb-0.5">Toll-Free Helpline</span>
                  <span className="font-semibold text-orange-700">{scheme.helplineNumber || '1800 National Helpline'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ELIGIBILITY */}
          {activeTab === 'eligibility' && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3">
                  Eligibility Summary
                </h4>
                <ul className="space-y-2">
                  {scheme.eligibilitySummary.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                      <span className="text-blue-600 font-bold shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exact Rules Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Detailed Criteria Parameters
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {scheme.eligibilityRules.minAge !== undefined && (
                    <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <span className="text-slate-400 block">Age Requirement</span>
                      <span className="font-semibold text-slate-800">
                        {scheme.eligibilityRules.minAge} {scheme.eligibilityRules.maxAge ? `to ${scheme.eligibilityRules.maxAge} years` : 'years and above'}
                      </span>
                    </div>
                  )}

                  {scheme.eligibilityRules.gender && (
                    <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <span className="text-slate-400 block">Gender Criteria</span>
                      <span className="font-semibold text-slate-800">
                        {scheme.eligibilityRules.gender === 'All' ? 'All Genders (Male & Female)' : `Only ${scheme.eligibilityRules.gender}`}
                      </span>
                    </div>
                  )}

                  {scheme.eligibilityRules.maxAnnualIncome !== undefined && (
                    <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <span className="text-slate-400 block">Income Ceiling</span>
                      <span className="font-semibold text-slate-800">
                        Up to ₹{scheme.eligibilityRules.maxAnnualIncome.toLocaleString('en-IN')} / year
                      </span>
                    </div>
                  )}

                  {scheme.eligibilityRules.occupations && scheme.eligibilityRules.occupations.length > 0 && (
                    <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <span className="text-slate-400 block">Target Occupations</span>
                      <span className="font-semibold text-slate-800">
                        {scheme.eligibilityRules.occupations.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special conditions or exclusions */}
              {scheme.eligibilityRules.specialConditions && scheme.eligibilityRules.specialConditions.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Special Conditions & Exclusions</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {scheme.eligibilityRules.specialConditions.map((cond, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-400">›</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTS CHECKLIST */}
          {activeTab === 'documents' && (
            <div className="space-y-5">
              {/* Readiness bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2 text-xs font-semibold">
                  <span className="text-slate-700">Your Document Readiness:</span>
                  <span className={`${progressPercent === 100 ? 'text-emerald-700' : 'text-orange-700'}`}>
                    {readyDocs} of {totalDocs} Prepared ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${progressPercent === 100 ? 'bg-emerald-600' : 'bg-orange-500'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Check the boxes as you prepare each document. Keep scanned PDF/JPG files under 200KB.
                </p>
              </div>

              <div className="space-y-3">
                {scheme.documentsRequired.map((doc, idx) => {
                  const isChecked = Boolean(checkedDocs[doc.name]);
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleDoc(doc.name)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked 
                          ? 'bg-emerald-50/70 border-emerald-300' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button className="mt-0.5 text-slate-500 hover:text-emerald-600">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-bold ${isChecked ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                            {doc.name}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            doc.mandatory ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {doc.mandatory ? 'Mandatory' : 'Optional'}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Document Preparation Tips */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Portal Rule:</strong> Scanned files must be under <strong>200KB</strong> in PDF or JPG format. Use scanner resolution 100-150 DPI in Grayscale to avoid upload errors.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: PROCEDURE */}
          {activeTab === 'procedure' && (
            <div className="space-y-6">
              {/* Official Portal Header Card */}
              <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-200 font-semibold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified Official Portal</span>
                  </div>
                  <h4 className="text-base font-bold">{scheme.portalName}</h4>
                  <p className="text-xs text-blue-200 font-mono mt-0.5 truncate max-w-sm">
                    {scheme.officialUrl}
                  </p>
                </div>

                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-blue-900 font-bold text-xs sm:text-sm rounded-lg hover:bg-blue-50 transition-colors shadow-xs"
                >
                  <span>Open Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Numbered Steps */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step-by-Step Application Roadmap
                </h4>
                
                <div className="space-y-3">
                  {scheme.applicationProcedure.map((step) => (
                    <div key={step.step} className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1 text-xs sm:text-sm">
                        <h5 className="font-bold text-slate-900 mb-1">{step.title}</h5>
                        <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Helpline Information */}
              {scheme.helplineNumber && (
                <div className="p-3 bg-slate-100 rounded-lg flex items-center gap-2 text-xs text-slate-700">
                  <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Need human assistance? Call official scheme helpline: <strong className="text-slate-900">{scheme.helplineNumber}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TROUBLESHOOTING */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Frequently Encountered Portal Problems & Fixes
              </h4>

              <div className="space-y-3">
                {scheme.troubleshootingTips.map((tip, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900">{tip.issue}</h5>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 pl-6 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                      💡 <strong>Resolution:</strong> {tip.solution}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-2">
                <span>Still experiencing issues with your registration or payment?</span>
                <button
                  onClick={() => {
                    onClose();
                    onAskAboutScheme(scheme, 'troubleshooting');
                  }}
                  className="px-3 py-1.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors shrink-0"
                >
                  Troubleshoot in Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAskAboutScheme(scheme, 'general');
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask SchemeSathi about this</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
            >
              <span>Apply on Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
