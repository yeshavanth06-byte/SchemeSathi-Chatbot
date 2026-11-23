import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  UserCheck,
  Building
} from 'lucide-react';
import { Scheme, UserCriteria } from '../types';
import { SCHEMES_DATABASE } from '../data/schemes';
import { evaluateSchemeEligibility } from '../services/nlpEngine';
import { INDIAN_STATES_AND_UTS, OCCUPATIONS_LIST, CATEGORY_METADATA } from '../data/constants';

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCriteria: UserCriteria;
  onSaveCriteria: (criteria: UserCriteria) => void;
  onSelectScheme: (scheme: Scheme) => void;
  onDiscussEligibilityInChat: (criteria: UserCriteria, topSchemes: Scheme[]) => void;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({
  isOpen,
  onClose,
  currentCriteria,
  onSaveCriteria,
  onSelectScheme,
  onDiscussEligibilityInChat
}) => {
  const [criteria, setCriteria] = useState<UserCriteria>({
    age: currentCriteria.age || 28,
    gender: currentCriteria.gender || 'Female',
    state: currentCriteria.state || 'All India',
    occupation: currentCriteria.occupation || 'Farmer / Agriculture',
    annualIncome: currentCriteria.annualIncome !== undefined ? currentCriteria.annualIncome : 180000,
    category: currentCriteria.category || 'OBC',
    isLandOwner: currentCriteria.isLandOwner ?? true,
    hasDisability: currentCriteria.hasDisability ?? false,
    isStudent: currentCriteria.isStudent ?? false
  });

  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  if (!isOpen) return null;

  // Run eligibility calculation
  const evaluatedResults = SCHEMES_DATABASE.map(scheme => {
    const result = evaluateSchemeEligibility(scheme, criteria);
    return {
      scheme,
      isEligible: result.isEligible,
      score: result.score,
      reasons: result.reasons
    };
  }).filter(r => r.isEligible && r.score >= 35);

  evaluatedResults.sort((a, b) => b.score - a.score);

  const handleCalculate = () => {
    setHasCalculated(true);
    onSaveCriteria(criteria);
  };

  const handleReset = () => {
    const resetValues: UserCriteria = {
      age: 25,
      gender: 'Female',
      state: 'All India',
      occupation: 'Student / Scholar',
      annualIncome: 150000,
      category: 'General',
      isLandOwner: false,
      hasDisability: false
    };
    setCriteria(resetValues);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Citizen Welfare Eligibility Assessment
              </h2>
              <p className="text-xs text-orange-100 font-medium">
                Enter your profile parameters to discover all central & state schemes you qualify for.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Split View */}
        <div className="flex-1 overflow-y-auto grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column: Form Questionnaire (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 space-y-4 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Your Details
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Age Input with Slider */}
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">Age of Applicant</label>
                <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {criteria.age} years
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                value={criteria.age || 25}
                onChange={(e) => setCriteria({ ...criteria, age: parseInt(e.target.value, 10) })}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <div className="flex gap-1.5 pt-1 overflow-x-auto text-[11px]">
                {[18, 22, 35, 60, 70].map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setCriteria({ ...criteria, age: a })}
                    className={`px-2 py-0.5 rounded border text-[11px] ${criteria.age === a ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                  >
                    {a} yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Select */}
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Female', 'Male', 'Other'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setCriteria({ ...criteria, gender: g })}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      criteria.gender === g
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* State Dropdown */}
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700">State / Union Territory</label>
              <select
                value={criteria.state || 'All India'}
                onChange={(e) => setCriteria({ ...criteria, state: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {INDIAN_STATES_AND_UTS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Occupation Selector */}
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700">Occupation / Role</label>
              <select
                value={criteria.occupation || OCCUPATIONS_LIST[0].value}
                onChange={(e) => {
                  const val = e.target.value;
                  const isFarm = val.includes('Farmer');
                  const isStud = val.includes('Student');
                  setCriteria({ 
                    ...criteria, 
                    occupation: val,
                    isLandOwner: isFarm ? true : criteria.isLandOwner,
                    isStudent: isStud
                  });
                }}
                className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {OCCUPATIONS_LIST.map((occ) => (
                  <option key={occ.value} value={occ.value}>{occ.label}</option>
                ))}
              </select>
            </div>

            {/* Annual Income */}
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">Annual Family Income</label>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ₹{(criteria.annualIncome || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1200000"
                step="25000"
                value={criteria.annualIncome || 0}
                onChange={(e) => setCriteria({ ...criteria, annualIncome: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-1 pt-1 text-[10px]">
                {[80000, 200000, 350000, 600000].map(inc => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setCriteria({ ...criteria, annualIncome: inc })}
                    className={`py-0.5 text-center rounded border ${criteria.annualIncome === inc ? 'bg-emerald-700 text-white border-emerald-700 font-semibold' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                  >
                    ₹{(inc / 100000).toFixed(1)}L
                  </button>
                ))}
              </div>
            </div>

            {/* Social Category */}
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700">Social Category</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['General', 'OBC', 'SC', 'ST', 'EWS'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCriteria({ ...criteria, category: cat })}
                    className={`py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                      criteria.category === cat
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Conditions: Land & Disability */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(criteria.isLandOwner)}
                  onChange={(e) => setCriteria({ ...criteria, isLandOwner: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="font-medium text-slate-700 text-[11px]">Owns Farm Land</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(criteria.hasDisability)}
                  onChange={(e) => setCriteria({ ...criteria, hasDisability: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="font-medium text-slate-700 text-[11px]">PwD (Divyangjan)</span>
              </label>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Update & Calculate Eligibility</span>
            </button>
          </div>

          {/* Right Column: Matching Schemes Results (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Eligible Welfare Schemes
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {evaluatedResults.length} Schemes Match
                  </span>
                </div>

                <button
                  onClick={() => {
                    onSaveCriteria(criteria);
                    onDiscussEligibilityInChat(criteria, evaluatedResults.slice(0, 5).map(r => r.scheme));
                    onClose();
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1 hover:underline"
                >
                  <span>Discuss in Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {evaluatedResults.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-700 text-sm">No Direct Match Found</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting the income ceiling or occupation category on the left to see matching welfare programs.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
                  {evaluatedResults.map(({ scheme, score, reasons }) => {
                    const meta = CATEGORY_METADATA[scheme.category] || { icon: '🏛️', label: scheme.category };
                    return (
                      <div
                        key={scheme.id}
                        className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-xs transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm">{meta.icon}</span>
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                                {scheme.name}
                              </h4>
                              <span className="text-orange-600 font-extrabold text-xs">
                                ({scheme.shortName})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {scheme.tagline}
                            </p>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {score}% Match
                            </span>
                            {scheme.benefitAmount && (
                              <span className="text-[10px] font-semibold text-slate-600 mt-0.5">
                                {scheme.benefitAmount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                          {reasons.slice(0, 3).map((r, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{r}</span>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="text-[10px] text-slate-400">
                            {scheme.ministry}
                          </span>
                          <button
                            onClick={() => {
                              onSelectScheme(scheme);
                            }}
                            className="font-bold text-orange-600 hover:text-orange-800 text-[11px] flex items-center gap-0.5"
                          >
                            <span>Inspect & Documents</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom action banner */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                SchemeSathi checks 22+ verified central and state welfare databases.
              </span>
              <button
                onClick={() => {
                  onSaveCriteria(criteria);
                  onClose();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors"
              >
                Apply Criteria & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
