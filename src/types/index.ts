export type SchemeCategory = 
  | 'agriculture'
  | 'health'
  | 'education'
  | 'women_child'
  | 'housing'
  | 'social_security'
  | 'business_msme'
  | 'employment'
  | 'food_welfare';

export interface DocumentItem {
  name: string;
  description: string;
  mandatory: boolean;
  sampleFormat?: string;
}

export interface ApplicationStep {
  step: number;
  title: string;
  detail: string;
}

export interface TroubleshootingTip {
  issue: string;
  solution: string;
}

export interface EligibilityRules {
  minAge?: number;
  maxAge?: number;
  gender?: 'All' | 'Female' | 'Male';
  occupations?: string[];
  maxAnnualIncome?: number; // In INR (e.g., 250000)
  categories?: ('General' | 'OBC' | 'SC' | 'ST' | 'EWS')[];
  landOwnerRequired?: boolean;
  applicableStates?: string[]; // ['All'] or specific states like ['Madhya Pradesh', 'Uttar Pradesh']
  specialConditions?: string[];
}

export interface Scheme {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  ministry: string;
  category: SchemeCategory;
  level: 'Central' | 'State';
  applicableStates: string[];
  description: string;
  benefits: string[];
  benefitAmount?: string;
  eligibilityRules: EligibilityRules;
  eligibilitySummary: string[];
  documentsRequired: DocumentItem[];
  applicationProcedure: ApplicationStep[];
  officialUrl: string;
  portalName: string;
  helplineNumber?: string;
  troubleshootingTips: TroubleshootingTip[];
  tags: string[];
}

export interface UserCriteria {
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  state?: string;
  occupation?: string;
  education?: string;
  annualIncome?: number;
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  isLandOwner?: boolean;
  hasDisability?: boolean;
  isStudent?: boolean;
  isFarmer?: boolean;
  isSmallBusiness?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  type?: 'text' | 'schemes_list' | 'eligibility_prompt' | 'scheme_detail' | 'troubleshoot_guide' | 'document_checklist' | 'eligibility_question';
  matchedSchemes?: Scheme[];
  selectedScheme?: Scheme;
  quickReplies?: string[];
  categoryFilter?: SchemeCategory;
  eligibilityStep?: number;
  matchReasons?: Record<string, string[]>;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  userCriteria?: UserCriteria;
  currentEligibilityStep?: number;
}

export interface TroubleshootingIssue {
  id: string;
  category: 'otp' | 'login' | 'upload' | 'payment_dbt' | 'status' | 'general';
  title: string;
  symptoms: string[];
  solutions: string[];
  helplineOrLinks?: { label: string; url: string }[];
}
