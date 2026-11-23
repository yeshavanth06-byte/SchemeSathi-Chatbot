import { SCHEMES_DATABASE } from '../data/schemes';
import { TROUBLESHOOTING_ISSUES } from './troubleshootingData';
import { ChatMessage, Scheme, UserCriteria } from '../types';

export interface ProcessedResponse {
  message: string;
  type: 'text' | 'schemes_list' | 'eligibility_prompt' | 'scheme_detail' | 'troubleshoot_guide' | 'document_checklist' | 'eligibility_question';
  matchedSchemes?: Scheme[];
  selectedScheme?: Scheme;
  quickReplies?: string[];
  extractedCriteria?: Partial<UserCriteria>;
  nextEligibilityStep?: number;
  updatedCriteria?: UserCriteria;
  matchReasons?: Record<string, string[]>;
}

// Indian State & abbreviation normalizer
export function extractState(text: string): string | undefined {
  const lower = text.toLowerCase().trim();

  const stateMap: Record<string, string> = {
    'all india': 'All',
    'all': 'All',
    'any': 'All',
    'pan india': 'All',
    'uttar pradesh': 'Uttar Pradesh',
    'up': 'Uttar Pradesh',
    'u.p.': 'Uttar Pradesh',
    'maharashtra': 'Maharashtra',
    'mh': 'Maharashtra',
    'mumbai': 'Maharashtra',
    'pune': 'Maharashtra',
    'madhya pradesh': 'Madhya Pradesh',
    'mp': 'Madhya Pradesh',
    'm.p.': 'Madhya Pradesh',
    'bhopal': 'Madhya Pradesh',
    'indore': 'Madhya Pradesh',
    'karnataka': 'Karnataka',
    'ka': 'Karnataka',
    'bangalore': 'Karnataka',
    'bengaluru': 'Karnataka',
    'tamil nadu': 'Tamil Nadu',
    'tn': 'Tamil Nadu',
    't.n.': 'Tamil Nadu',
    'chennai': 'Tamil Nadu',
    'west bengal': 'West Bengal',
    'wb': 'West Bengal',
    'w.b.': 'West Bengal',
    'kolkata': 'West Bengal',
    'odisha': 'Odisha',
    'orissa': 'Odisha',
    'bhubaneswar': 'Odisha',
    'rajasthan': 'Rajasthan',
    'rj': 'Rajasthan',
    'jaipur': 'Rajasthan',
    'bihar': 'Bihar',
    'patna': 'Bihar',
    'andhra pradesh': 'Andhra Pradesh',
    'ap': 'Andhra Pradesh',
    'a.p.': 'Andhra Pradesh',
    'telangana': 'Telangana',
    'hyderabad': 'Telangana',
    'delhi': 'Delhi',
    'new delhi': 'Delhi',
    'punjab': 'Punjab',
    'haryana': 'Haryana',
    'gujarat': 'Gujarat',
    'kerala': 'Kerala',
    'assam': 'Assam',
    'jharkhand': 'Jharkhand',
    'chhattisgarh': 'Chhattisgarh',
    'uttarakhand': 'Uttarakhand',
    'himachal pradesh': 'Himachal Pradesh',
    'jammu and kashmir': 'Jammu & Kashmir',
    'j&k': 'Jammu & Kashmir'
  };

  for (const [key, val] of Object.entries(stateMap)) {
    const regex = new RegExp(`\\b${key.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(lower)) {
      return val;
    }
  }
  return undefined;
}

// Extract criteria from natural language inputs
export function extractCriteriaFromText(text: string): Partial<UserCriteria> {
  const criteria: Partial<UserCriteria> = {};
  const lower = text.toLowerCase();

  // State
  const detectedState = extractState(text);
  if (detectedState) {
    criteria.state = detectedState;
  }

  // Age extraction (e.g. "25 years old", "age 30", "age is 62", "I am 19", "18-25", "60+")
  if (lower.includes('60+') || lower.includes('senior citizen')) {
    criteria.age = 65;
  } else if (lower.includes('18-25')) {
    criteria.age = 21;
  } else if (lower.includes('26-40')) {
    criteria.age = 32;
  } else if (lower.includes('41-59')) {
    criteria.age = 50;
  } else {
    const ageMatch = lower.match(/(?:i am|age is|age)\s*(\d{1,2})|\b(\d{1,2})\s*(?:years old|yrs old|saal|year|yr|y\/o)/i);
    if (ageMatch) {
      const ageVal = parseInt(ageMatch[1] || ageMatch[2], 10);
      if (ageVal > 0 && ageVal < 110) {
        criteria.age = ageVal;
      }
    } else {
      const singleNum = lower.match(/^\s*(\d{2})\s*$/);
      if (singleNum) {
        const val = parseInt(singleNum[1], 10);
        if (val >= 10 && val <= 99) {
          criteria.age = val;
        }
      }
    }
  }

  // Gender extraction
  if (/\b(female|woman|women|girl|mahila|aurat|mother|lady|mother|sister|wife|daughter)\b/i.test(lower)) {
    criteria.gender = 'Female';
  } else if (/\b(male|man|boy|purush|aadmi|gentleman|father|husband|son)\b/i.test(lower) && !/\b(female|woman|mahila)\b/i.test(lower)) {
    criteria.gender = 'Male';
  }

  // Occupation extraction
  if (/\b(farmer|kisan|krishi|agriculture|farming|kheti|cultivator|tenant farmer)\b/i.test(lower)) {
    criteria.occupation = 'Farmer / Agriculture';
    criteria.isFarmer = true;
  } else if (/\b(student|studying|college|school|vidyarthi|padhai|pursuing|btech|ba|bsc|class|graduate|degree)\b/i.test(lower)) {
    criteria.occupation = 'Student / Scholar';
    criteria.isStudent = true;
  } else if (/\b(vendor|hawker|thela|rehri|street vendor|feriwala|cart)\b/i.test(lower)) {
    criteria.occupation = 'Street Vendor / Hawker';
  } else if (/\b(artisan|craft|carpenter|tailor|blacksmith|potter|karigar|darzi|badhai|lohar|vishwakarma|cobbler|goldsmith)\b/i.test(lower)) {
    criteria.occupation = 'Traditional Artisan / Craftsperson';
  } else if (/\b(business|shopkeeper|dukan|dukaan|trader|merchant|startup|entrepreneur|msme|self-employed|small shop)\b/i.test(lower)) {
    criteria.occupation = 'Self-Employed / Shopkeeper';
    criteria.isSmallBusiness = true;
  } else if (/\b(laborer|labourer|worker|majdoor|majdoor|daily wage|construction worker|unorganized|mgnrega)\b/i.test(lower)) {
    criteria.occupation = 'Daily Wage Laborer / Worker';
  } else if (/\b(homemaker|housewife|grihini|mother)\b/i.test(lower)) {
    criteria.occupation = 'Homemaker / Women';
    criteria.gender = 'Female';
  } else if (/\b(senior citizen|retired|old age|vridh|bujurg|pensioner)\b/i.test(lower)) {
    criteria.occupation = 'Senior Citizen / Retired';
    if (!criteria.age) criteria.age = 65;
  } else if (/\b(unemployed|jobless|job seeker|looking for job|berojgar)\b/i.test(lower)) {
    criteria.occupation = 'Unemployed / Jobseeker';
  }

  // Education extraction
  if (/\b(graduate|degree|btech|b\.tech|ba|b\.a|bsc|b\.sc|bcom|b\.com|masters|post graduate|pg|diploma|iti)\b/i.test(lower)) {
    if (lower.includes('diploma') || lower.includes('iti')) {
      criteria.education = 'Diploma / ITI';
    } else {
      criteria.education = 'Graduate / Degree';
    }
  } else if (/\b(10th|12th|matric|intermediate|school|10 pass|12 pass)\b/i.test(lower)) {
    criteria.education = '10th / 12th School';
  } else if (/\b(none|uneducated|illiterate|no formal education)\b/i.test(lower)) {
    criteria.education = 'None / Self-employed';
  }

  // Category extraction
  if (/\b(sc|scheduled caste)\b/i.test(lower)) {
    criteria.category = 'SC';
  } else if (/\b(st|scheduled tribe)\b/i.test(lower)) {
    criteria.category = 'ST';
  } else if (/\b(obc|other backward class)\b/i.test(lower)) {
    criteria.category = 'OBC';
  } else if (/\b(ews|economically weaker section)\b/i.test(lower)) {
    criteria.category = 'EWS';
  } else if (/\b(general category|general)\b/i.test(lower)) {
    criteria.category = 'General';
  }

  // Income extraction
  if (lower.includes('under 1 lakh') || lower.includes('below 1 lakh') || lower.includes('< 1 lakh') || lower.includes('50000') || lower.includes('80000')) {
    criteria.annualIncome = 90000;
  } else if (lower.includes('1 lakh - 2.5 lakh') || lower.includes('1-2.5 lakh') || lower.includes('1.5 lakh') || lower.includes('2 lakh') || lower.includes('2.5 lakh')) {
    criteria.annualIncome = 180000;
  } else if (lower.includes('2.5 lakh - 5 lakh') || lower.includes('3 lakh') || lower.includes('4 lakh') || lower.includes('5 lakh')) {
    criteria.annualIncome = 350000;
  } else if (lower.includes('above 5 lakh') || lower.includes('> 5 lakh') || lower.includes('6 lakh') || lower.includes('8 lakh') || lower.includes('10 lakh')) {
    criteria.annualIncome = 600000;
  } else {
    const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lpa)/i);
    if (lakhMatch) {
      criteria.annualIncome = parseFloat(lakhMatch[1]) * 100000;
    } else {
      const rawNumberMatch = lower.match(/(?:income|earning|salary|earns)\s*(?:is|of|around)?\s*(?:rs|inr|₹)?\s*(\d{4,7})/i);
      if (rawNumberMatch) {
        criteria.annualIncome = parseInt(rawNumberMatch[1], 10);
      }
    }
  }

  // Land ownership
  if (/\b(have land|own land|landowner|khet|cultivable land|yes i own land|i have land)\b/i.test(lower)) {
    criteria.isLandOwner = true;
  } else if (/\b(no land|landless|without land|tenant|no land owned)\b/i.test(lower)) {
    criteria.isLandOwner = false;
  }

  return criteria;
}

// Evaluate match score and detailed rationale for why a scheme matches the user
export function evaluateSchemeEligibility(scheme: Scheme, criteria: UserCriteria): { isEligible: boolean; score: number; reasons: string[] } {
  const rules = scheme.eligibilityRules;
  const reasons: string[] = [];
  let score = 50;

  // 1. State check
  if (criteria.state && criteria.state !== 'All') {
    const schemeStates = scheme.applicableStates;
    const isStateMatch = schemeStates.includes('All') || schemeStates.some(s => s.toLowerCase() === criteria.state!.toLowerCase());
    if (isStateMatch) {
      score += 15;
      if (scheme.level === 'State') {
        reasons.push(`✓ Specifically created for residents of ${criteria.state}`);
      } else {
        reasons.push(`✓ Available nationwide including in ${criteria.state}`);
      }
    } else {
      return { 
        isEligible: false, 
        score: 0, 
        reasons: [`✗ Only available in ${schemeStates.join(', ')} (not in ${criteria.state})`] 
      };
    }
  }

  // 2. Gender check
  if (rules.gender && rules.gender !== 'All' && criteria.gender) {
    if (rules.gender.toLowerCase() !== criteria.gender.toLowerCase()) {
      return { 
        isEligible: false, 
        score: 0, 
        reasons: [`✗ Specifically designed for ${rules.gender} citizens`] 
      };
    }
    score += 25;
    reasons.push(`✓ Targeted welfare support for ${rules.gender} citizens`);
  }

  // 3. Age check
  if (criteria.age !== undefined) {
    if (rules.minAge !== undefined && criteria.age < rules.minAge) {
      return { 
        isEligible: false, 
        score: 0, 
        reasons: [`✗ Requires minimum age of ${rules.minAge} years (You: ${criteria.age})`] 
      };
    }
    if (rules.maxAge !== undefined && criteria.age > rules.maxAge) {
      return { 
        isEligible: false, 
        score: 0, 
        reasons: [`✗ Maximum eligible age is ${rules.maxAge} years (You: ${criteria.age})`] 
      };
    }
    score += 15;
    if (rules.minAge !== undefined || rules.maxAge !== undefined) {
      reasons.push(`✓ Your age (${criteria.age}) falls in the eligible range`);
    }
  }

  // 4. Occupation check
  if (rules.occupations && rules.occupations.length > 0 && criteria.occupation) {
    const userOcc = criteria.occupation.toLowerCase();
    const matchesOcc = rules.occupations.some(o => 
      userOcc.includes(o.toLowerCase()) || o.toLowerCase().includes(userOcc.split('/')[0].trim().toLowerCase())
    );
    if (matchesOcc) {
      score += 30;
      reasons.push(`✓ Direct match for your occupation (${criteria.occupation})`);
    } else {
      score -= 20;
    }
  }

  // 5. Income check
  if (rules.maxAnnualIncome !== undefined && criteria.annualIncome !== undefined) {
    if (criteria.annualIncome > rules.maxAnnualIncome) {
      return { 
        isEligible: false, 
        score: 0, 
        reasons: [`✗ Family income exceeds the scheme cap of ₹${rules.maxAnnualIncome.toLocaleString('en-IN')}`] 
      };
    }
    score += 20;
    reasons.push(`✓ Family income ₹${criteria.annualIncome.toLocaleString('en-IN')} is within the eligibility ceiling (under ₹${rules.maxAnnualIncome.toLocaleString('en-IN')})`);
  }

  // 6. Land ownership check
  if (rules.landOwnerRequired && criteria.isLandOwner === false) {
    return { 
      isEligible: false, 
      score: 0, 
      reasons: ['✗ Requires cultivable agricultural land registered in the applicant\'s name'] 
    };
  } else if (rules.landOwnerRequired && criteria.isLandOwner === true) {
    score += 15;
    reasons.push('✓ Agricultural landholding confirmed for farmer subsidy');
  }

  // 7. Education check for specific schemes
  if (criteria.education && (scheme.id === 'yuva-nidhi-karnataka' || scheme.id === 'national-scholarship-portal')) {
    if (scheme.id === 'yuva-nidhi-karnataka') {
      if (criteria.education.toLowerCase().includes('graduate') || criteria.education.toLowerCase().includes('diploma')) {
        score += 20;
        reasons.push(`✓ Matches required higher education qualification (${criteria.education})`);
      }
    }
  }

  return {
    isEligible: true,
    score: Math.min(100, Math.max(30, score)),
    reasons: reasons.length > 0 ? reasons : ['✓ General socioeconomic guidelines satisfied']
  };
}

// Format the final personalized scheme recommendations
function buildPersonalizedRecommendationMessage(
  criteria: UserCriteria,
  topSchemes: Scheme[],
  matchReasonsMap: Record<string, string[]>
): string {
  const profileItems: string[] = [];
  if (criteria.state) profileItems.push(`📍 State: **${criteria.state}**`);
  if (criteria.age) profileItems.push(`🎂 Age: **${criteria.age} Years**`);
  if (criteria.occupation) profileItems.push(`💼 Occupation: **${criteria.occupation}**`);
  if (criteria.education) profileItems.push(`🎓 Education: **${criteria.education}**`);
  if (criteria.annualIncome) profileItems.push(`💰 Income: **₹${criteria.annualIncome.toLocaleString('en-IN')}/year**`);
  if (criteria.category) profileItems.push(`🏷️ Category: **${criteria.category}**`);

  let text = `### 🎯 Your Personalized Government Scheme Recommendations\n\n`;
  text += `Based on the profile information you provided:\n${profileItems.join(' • ')}\n\n`;
  text += `Here are the top **${topSchemes.length} verified government schemes** you qualify for:\n\n`;

  topSchemes.forEach((scheme, idx) => {
    const reasons = matchReasonsMap[scheme.id] || [];
    text += `**${idx + 1}. ${scheme.name}** (${scheme.shortName})\n`;
    text += `*${scheme.tagline}*\n`;
    if (scheme.benefitAmount) {
      text += `💵 **Benefit:** ${scheme.benefitAmount}\n`;
    }
    if (reasons.length > 0) {
      text += `💡 **Why this matches you:**\n`;
      reasons.slice(0, 3).forEach(r => {
        text += `  ${r}\n`;
      });
    }
    text += `🔗 Official Portal: [${scheme.portalName}](${scheme.officialUrl})\n\n`;
  });

  text += `💡 *Tip: Click any scheme below to see required documents and step-by-step application instructions, or ask me "How do I apply for [Scheme Name]?"*`;

  return text;
}

// Main Natural Language Query Processor
export function processUserQuery(
  rawInput: string, 
  currentCriteria: UserCriteria = {}, 
  activeEligibilityStep: number = 0,
  activeSchemeContext?: Scheme
): ProcessedResponse {
  const text = rawInput.trim();
  const lower = text.toLowerCase();

  // -------------------------------------------------------------
  // 1. CONVERSATIONAL STEP-BY-STEP ELIGIBILITY WORKFLOW
  // -------------------------------------------------------------
  if (activeEligibilityStep > 0) {
    const extracted = extractCriteriaFromText(text);
    const updatedCriteria: UserCriteria = { ...currentCriteria, ...extracted };

    // STEP 1: Waiting for State
    if (activeEligibilityStep === 1) {
      const state = extracted.state || (text.length > 2 && text.length < 30 ? text : 'All India');
      updatedCriteria.state = state;

      return {
        message: `Great! You are from **${state}**.\n\nNow, what is your **Age**? (e.g., 22, 35, 62)`,
        type: 'eligibility_question',
        nextEligibilityStep: 2,
        updatedCriteria,
        quickReplies: [
          '18-25 Years',
          '26-40 Years',
          '41-59 Years',
          '60+ Senior Citizen'
        ]
      };
    }

    // STEP 2: Waiting for Age
    if (activeEligibilityStep === 2) {
      if (!updatedCriteria.age) {
        updatedCriteria.age = 28;
      }

      return {
        message: `Noted, age **${updatedCriteria.age}**.\n\nWhat is your **primary occupation**?`,
        type: 'eligibility_question',
        nextEligibilityStep: 3,
        updatedCriteria,
        quickReplies: [
          '👨‍🌾 Farmer / Agriculture',
          '🎓 Student / Scholar',
          '👩 Homemaker / Mother',
          '💼 Small Business / Shop',
          '🔨 Artisan / Vishwakarma',
          '🛒 Street Vendor',
          '🏗️ Daily Wage Worker',
          '💼 Unemployed Jobseeker'
        ]
      };
    }

    // STEP 3: Waiting for Occupation
    if (activeEligibilityStep === 3) {
      if (!updatedCriteria.occupation) {
        updatedCriteria.occupation = text;
      }

      return {
        message: `Understood, working as **${updatedCriteria.occupation}**.\n\nWhat is your **highest education qualification**?`,
        type: 'eligibility_question',
        nextEligibilityStep: 4,
        updatedCriteria,
        quickReplies: [
          '🎓 Graduate / Degree',
          '📜 Diploma / ITI',
          '🎒 10th / 12th School',
          'None / Self-employed'
        ]
      };
    }

    // STEP 4: Waiting for Education
    if (activeEligibilityStep === 4) {
      if (!updatedCriteria.education) {
        updatedCriteria.education = text;
      }

      return {
        message: `What is your approximate **annual family income**? (This helps check income-capped welfare subsidies)`,
        type: 'eligibility_question',
        nextEligibilityStep: 5,
        updatedCriteria,
        quickReplies: [
          'Under ₹1 Lakh',
          '₹1 Lakh - ₹2.5 Lakh',
          '₹2.5 Lakh - ₹5 Lakh',
          'Above ₹5 Lakh'
        ]
      };
    }

    // STEP 5: Waiting for Income
    if (activeEligibilityStep === 5) {
      if (updatedCriteria.annualIncome === undefined) {
        updatedCriteria.annualIncome = 180000;
      }

      return {
        message: `Almost done! Do you belong to any specific **social category or condition**?`,
        type: 'eligibility_question',
        nextEligibilityStep: 6,
        updatedCriteria,
        quickReplies: [
          'General',
          'OBC',
          'SC / ST',
          'EWS',
          'Landowner Farmer',
          'None / Skip'
        ]
      };
    }

    // STEP 6: Final evaluation and presentation
    if (activeEligibilityStep === 6) {
      if (lower.includes('land')) updatedCriteria.isLandOwner = true;
      if (lower.includes('sc') || lower.includes('st')) updatedCriteria.category = 'SC';
      else if (lower.includes('obc')) updatedCriteria.category = 'OBC';
      else if (lower.includes('ews')) updatedCriteria.category = 'EWS';
      else if (lower.includes('general')) updatedCriteria.category = 'General';

      // Evaluate schemes against collected profile
      const matchReasonsMap: Record<string, string[]> = {};
      const eligibleSchemes: { scheme: Scheme; score: number; reasons: string[] }[] = [];

      for (const scheme of SCHEMES_DATABASE) {
        const evalResult = evaluateSchemeEligibility(scheme, updatedCriteria);
        if (evalResult.isEligible && evalResult.score >= 35) {
          eligibleSchemes.push({ scheme, score: evalResult.score, reasons: evalResult.reasons });
          matchReasonsMap[scheme.id] = evalResult.reasons;
        }
      }

      eligibleSchemes.sort((a, b) => b.score - a.score);
      const topMatches = eligibleSchemes.slice(0, 6).map(e => e.scheme);

      const reportMessage = buildPersonalizedRecommendationMessage(updatedCriteria, topMatches, matchReasonsMap);

      return {
        message: reportMessage,
        type: 'schemes_list',
        matchedSchemes: topMatches,
        matchReasons: matchReasonsMap,
        nextEligibilityStep: 0,
        updatedCriteria,
        quickReplies: [
          '📄 Documents for Top Scheme',
          '📝 How to Apply Guide',
          '🔄 Modify My Details',
          'Explore Central Schemes'
        ]
      };
    }
  }

  // -------------------------------------------------------------
  // 2. TRIGGER STEP-BY-STEP ELIGIBILITY QUESTIONNAIRE
  // -------------------------------------------------------------
  if (/\b(check eligibility|check my eligibility|am i eligible|eligibility criteria|which scheme for me|find schemes for me|find for me|suggest schemes|recommend schemes|patrata)\b/i.test(lower)) {
    const extracted = extractCriteriaFromText(text);
    const updated = { ...currentCriteria, ...extracted };
    const fieldCount = [updated.age, updated.occupation, updated.state, updated.annualIncome].filter(Boolean).length;

    if (fieldCount >= 3) {
      const matchReasonsMap: Record<string, string[]> = {};
      const eligibleSchemes: { scheme: Scheme; score: number; reasons: string[] }[] = [];

      for (const scheme of SCHEMES_DATABASE) {
        const evalResult = evaluateSchemeEligibility(scheme, updated);
        if (evalResult.isEligible && evalResult.score >= 35) {
          eligibleSchemes.push({ scheme, score: evalResult.score, reasons: evalResult.reasons });
          matchReasonsMap[scheme.id] = evalResult.reasons;
        }
      }

      eligibleSchemes.sort((a, b) => b.score - a.score);
      const topMatches = eligibleSchemes.slice(0, 6).map(e => e.scheme);
      const reportMessage = buildPersonalizedRecommendationMessage(updated, topMatches, matchReasonsMap);

      return {
        message: reportMessage,
        type: 'schemes_list',
        matchedSchemes: topMatches,
        matchReasons: matchReasonsMap,
        nextEligibilityStep: 0,
        updatedCriteria: updated,
        quickReplies: [
          '📄 Documents Checklist',
          '📝 Step-by-Step Application Guide',
          '🔄 Update Profile Details',
          '🌾 Farmer Schemes'
        ]
      };
    }

    // Start conversational step-by-step workflow
    return {
      message: `Namaste! 🙏 I can check your eligibility across all 30+ Central and State welfare schemes.\n\nTo find the schemes that genuinely match you, I'll ask you a few quick questions one at a time.\n\nFirst question: **Which State or Union Territory do you live in?**`,
      type: 'eligibility_question',
      nextEligibilityStep: 1,
      quickReplies: [
        'All India',
        'Uttar Pradesh',
        'Maharashtra',
        'Madhya Pradesh',
        'Karnataka',
        'Tamil Nadu',
        'West Bengal',
        'Odisha',
        'Rajasthan',
        'Bihar'
      ]
    };
  }

  // -------------------------------------------------------------
  // 3. NATURAL GREETINGS
  // -------------------------------------------------------------
  if (/^(hi|hello|hey|namaste|pranam|ram ram|kya hal|halo|good morning|good afternoon|good evening|adaab|greetings|kem cho|vanakkam|namaskara)\b/i.test(text) && text.split(' ').length < 5) {
    return {
      message: `Namaste! 🙏 Welcome to **SchemeSathi** — your trusted AI companion for Indian Central and State government welfare schemes.\n\nI can help you:\n1. 🎯 **Check your eligibility** conversationally and discover schemes suited for you\n2. 📄 **Get required document checklists** and official portal links\n3. 📝 **Understand step-by-step application procedures**\n4. 🛠️ **Troubleshoot portal problems** (Aadhaar OTP delays, NPCI DBT bank seeding, document upload size limits)\n\nWhat would you like to explore today?`,
      type: 'text',
      quickReplies: [
        '🔍 Check My Eligibility',
        '🌾 Schemes for Farmers',
        '🎓 Scholarships for Students',
        '👩 Schemes for Women & Mothers',
        '💼 Micro Loans & MSME Schemes',
        '🏥 Ayushman Health Card',
        '⚡ PM Surya Ghar Solar Subsidy',
        '🛠️ Troubleshoot Portal Errors'
      ]
    };
  }

  // -------------------------------------------------------------
  // 4. APPLICATION & PORTAL TROUBLESHOOTING INTENTS
  // -------------------------------------------------------------
  if (/\b(otp|not received|sms issue|login error|forgot password|upload error|file size|size limit|200kb|dbt|npci|payment failed|fto|money not credited|status check|track application|pfms|rejection|pending)\b/i.test(lower)) {
    if (/\b(otp|sms|message)\b/i.test(lower)) {
      const issue = TROUBLESHOOTING_ISSUES.find(i => i.id === 'otp-issues')!;
      return {
        message: `### 📱 Troubleshooting: ${issue.title}\n\n**Common Causes & Verified Fixes:**\n${issue.solutions.map((s, idx) => `${idx + 1}. ${s}`).join('\n\n')}\n\n🔗 **Official Portals:**\n${issue.helplineOrLinks?.map(l => `- [${l.label}](${l.url})`).join('\n')}\n\n*Note: SchemeSathi provides verified official guidance. OTPs must only be entered on authorized government portals.*`,
        type: 'troubleshoot_guide',
        quickReplies: ['Check Aadhaar Mobile Linking', 'Aadhaar Bank Seeding (DBT)', 'Document Upload Help', 'Back to Schemes']
      };
    }

    if (/\b(dbt|npci|bank|payment|fto|money not received|installment)\b/i.test(lower)) {
      const issue = TROUBLESHOOTING_ISSUES.find(i => i.id === 'dbt-npci-banking')!;
      return {
        message: `### 💳 Troubleshooting: ${issue.title}\n\n⚠️ **Crucial Distinction:** Regular KYC Aadhaar linking with your bank is **NOT** the same as Aadhaar NPCI Seeding for government DBT!\n\n**How to Fix DBT Payment Failures:**\n${issue.solutions.map((s, idx) => `${idx + 1}. ${s}`).join('\n\n')}\n\n🔗 **Official Verification Links:**\n${issue.helplineOrLinks?.map(l => `- [${l.label}](${l.url})`).join('\n')}\n\n*Important: Always verify your bank account on the official UIDAI Bank Seeding portal.*`,
        type: 'troubleshoot_guide',
        quickReplies: ['Check Aadhaar Bank Seeding Status', 'PM-KISAN Status Troubleshooting', 'NSP Scholarship Payment Status']
      };
    }

    if (/\b(upload|file size|200kb|pdf format|jpg|image size|compression)\b/i.test(lower)) {
      const issue = TROUBLESHOOTING_ISSUES.find(i => i.id === 'document-upload')!;
      return {
        message: `### 📄 Troubleshooting: ${issue.title}\n\n**How to prepare documents for central and state government portals:**\n${issue.solutions.map((s, idx) => `${idx + 1}. ${s}`).join('\n\n')}\n\n*Important: Ensure uploaded scans are sharp and uncropped to avoid rejection during physical scrutiny.*`,
        type: 'troubleshoot_guide',
        quickReplies: ['Check Required Documents', 'Back to Application Guide', 'Aadhaar OTP Help']
      };
    }

    if (/\b(login|password|locked|captcha|invalid credentials)\b/i.test(lower)) {
      const issue = TROUBLESHOOTING_ISSUES.find(i => i.id === 'login-password')!;
      return {
        message: `### 🔐 Troubleshooting: ${issue.title}\n\n${issue.solutions.map((s, idx) => `${idx + 1}. ${s}`).join('\n\n')}\n\n🔗 **Single Sign-On Portals:**\n${issue.helplineOrLinks?.map(l => `- [${l.label}](${l.url})`).join('\n')}`,
        type: 'troubleshoot_guide',
        quickReplies: ['MeriPehchaan Login Help', 'DigiLocker Integration', 'Back to Schemes']
      };
    }

    if (/\b(status|track|pending|reference number|grievance|complaint)\b/i.test(lower)) {
      const issue = TROUBLESHOOTING_ISSUES.find(i => i.id === 'status-tracking')!;
      return {
        message: `### 🔎 Application Status Tracking & Grievance Resolution\n\n${issue.solutions.map((s, idx) => `${idx + 1}. ${s}`).join('\n\n')}\n\n🔗 **Official Grievance & Tracking Links:**\n${issue.helplineOrLinks?.map(l => `- [${l.label}](${l.url})`).join('\n')}\n\n*Notice: SchemeSathi provides step-by-step navigation guidance. We do not access live private applicant data or pretend to file complaints.*`,
        type: 'troubleshoot_guide',
        quickReplies: ['Track on CPGRAMS Portal', 'PFMS Payment Tracking', 'Back to Schemes']
      };
    }

    return {
      message: `I can help you troubleshoot common hurdles on official government portals. Which issue are you experiencing?`,
      type: 'troubleshoot_guide',
      quickReplies: [
        '📱 OTP Not Received on Mobile',
        '💳 DBT Payment / NPCI Inactive',
        '📄 Document Upload & Size Errors',
        '🔐 Login / Password Locked',
        '🔎 Application Status Delayed'
      ]
    };
  }

  // -------------------------------------------------------------
  // 5. SPECIFIC SCHEME INQUIRY (Direct match by name/tag/ID)
  // -------------------------------------------------------------
  for (const scheme of SCHEMES_DATABASE) {
    const nameMatch = lower.includes(scheme.id.toLowerCase()) ||
      lower.includes(scheme.shortName.toLowerCase()) ||
      (scheme.name.toLowerCase().includes(lower) && lower.length > 5) ||
      scheme.tags.some(t => lower.includes(t) && t.length > 4);

    if (nameMatch) {
      if (/\b(documents?|kagaz|dastavez|papers?|proof|doc list)\b/i.test(lower)) {
        return {
          message: `### 📄 Required Documents for **${scheme.name}** (${scheme.shortName})\n\nHere is the official document checklist you need before applying:\n\n${scheme.documentsRequired.map(d => `- **${d.name}** ${d.mandatory ? '*(Mandatory)*' : '*(Optional)*'}: ${d.description}`).join('\n')}\n\n💡 *Tip: Keep scanned PDF or JPG copies under 200KB ready on your device.*`,
          type: 'document_checklist',
          selectedScheme: scheme,
          quickReplies: [
            `How to apply for ${scheme.shortName}`,
            `Check eligibility for ${scheme.shortName}`,
            `Official Portal link`,
            'Explore other schemes'
          ]
        };
      }

      if (/\b(how to apply|apply online|apply procedure|process|steps?|registration steps|portal link|website)\b/i.test(lower)) {
        return {
          message: `### 📝 Step-by-Step Application Guide: **${scheme.name}**\n\n- **Official Government Portal:** [${scheme.portalName}](${scheme.officialUrl})\n- **Helpline:** ${scheme.helplineNumber || '1800 National Helpline'}\n\n${scheme.applicationProcedure.map(p => `**Step ${p.step}: ${p.title}**\n${p.detail}`).join('\n\n')}\n\n*Reminder: Submit your application only on the authorized government portal (${scheme.officialUrl}).*`,
          type: 'scheme_detail',
          selectedScheme: scheme,
          quickReplies: [
            `Documents needed for ${scheme.shortName}`,
            `Check eligibility for ${scheme.shortName}`,
            `Troubleshoot issues with ${scheme.shortName}`,
            'Explore other schemes'
          ]
        };
      }

      return {
        message: `Here are the complete verified details for **${scheme.name}** (${scheme.shortName}):`,
        type: 'scheme_detail',
        selectedScheme: scheme,
        quickReplies: [
          `How to apply for ${scheme.shortName}`,
          `Documents for ${scheme.shortName}`,
          `Common problems with ${scheme.shortName}`,
          'Find more schemes'
        ]
      };
    }
  }

  // -------------------------------------------------------------
  // 6. CATEGORY-BASED CONVERSATIONAL SEARCH
  // -------------------------------------------------------------
  if (/\b(farmer|kisan|agriculture|kheti|crop|fasal)\b/i.test(lower)) {
    const farmerSchemes = SCHEMES_DATABASE.filter(s => s.category === 'agriculture');
    return {
      message: `Here are the major **Agriculture & Farmer Welfare Schemes** providing income assistance, low-interest crop credit, and risk protection:`,
      type: 'schemes_list',
      matchedSchemes: farmerSchemes,
      quickReplies: ['Documents for PM-KISAN', 'Apply for Kisan Credit Card (KCC)', 'Crop Insurance (PMFBY)', 'Back to All Schemes']
    };
  }

  if (/\b(student|scholarship|college|school|education|study|loan for study|fee|vidya)\b/i.test(lower)) {
    const studentSchemes = SCHEMES_DATABASE.filter(s => s.category === 'education');
    return {
      message: `Here are the prominent **Education and Student Scholarship Schemes** providing financial stipends, tuition support, and subsidized study loans:`,
      type: 'schemes_list',
      matchedSchemes: studentSchemes,
      quickReplies: ['National Scholarship Portal (NSP)', 'PM Vidya Lakshmi Portal', 'Check Student Eligibility']
    };
  }

  if (/\b(women|woman|girl|mother|mahila|beti|maternity|pregnant|ladli|ladki|sukanya|urimai)\b/i.test(lower)) {
    const womenSchemes = SCHEMES_DATABASE.filter(s => s.category === 'women_child');
    return {
      message: `Here are the central and state welfare schemes designed for **Women, Mothers, and the Girl Child**:`,
      type: 'schemes_list',
      matchedSchemes: womenSchemes,
      quickReplies: ['Sukanya Samriddhi Yojana (SSY)', 'PM Matru Vandana (PMMVY)', 'Majhi Ladki Bahin (MH)', 'Gruha Lakshmi (KA)']
    };
  }

  if (/\b(health|hospital|medical|ayushman|treatment|illness|bima)\b/i.test(lower)) {
    const healthSchemes = SCHEMES_DATABASE.filter(s => s.category === 'health' || s.id === 'pm-jay');
    return {
      message: `Here are the major **Healthcare & Medical Coverage Schemes** providing cashless hospitalization and health insurance:`,
      type: 'schemes_list',
      matchedSchemes: healthSchemes,
      quickReplies: ['How to generate Ayushman Card', 'Senior Citizen 70+ Ayushman Card', 'Check Empaneled Hospitals']
    };
  }

  if (/\b(business|loan|mudra|msme|shop|vendor|artisan|vishwakarma|svanidhi)\b/i.test(lower)) {
    const businessSchemes = SCHEMES_DATABASE.filter(s => s.category === 'business_msme');
    return {
      message: `Here are the government schemes offering **Collateral-Free Business Loans & Enterprise Support**:`,
      type: 'schemes_list',
      matchedSchemes: businessSchemes,
      quickReplies: ['Mudra Loan up to ₹20 Lakh', 'PM Vishwakarma ₹15,000 Toolkit', 'PM SVANidhi for Street Vendors']
    };
  }

  if (/\b(solar|bijli|electricity|light|energy|surya)\b/i.test(lower)) {
    const solarScheme = SCHEMES_DATABASE.filter(s => s.id === 'pm-surya-ghar');
    return {
      message: `Here are details for the **PM Surya Ghar: Muft Bijli Yojana** providing up to ₹78,000 subsidy for rooftop solar installation:`,
      type: 'schemes_list',
      matchedSchemes: solarScheme,
      quickReplies: ['Documents for PM Surya Ghar', 'How to Apply for Solar Subsidy', 'Subsidy Slabs Breakdown']
    };
  }

  if (/\b(housing|house|makan|home|awas|pmay)\b/i.test(lower)) {
    const housingSchemes = SCHEMES_DATABASE.filter(s => s.category === 'housing');
    return {
      message: `Here are the government **Housing & Clean Energy Schemes** helping families construct pucca homes and obtain clean cooking gas:`,
      type: 'schemes_list',
      matchedSchemes: housingSchemes,
      quickReplies: ['PMAY-Gramin ₹1.20 Lakh Subsidy', 'PM Ujjwala Free LPG Gas', 'Check Housing Eligibility']
    };
  }

  if (/\b(pension|old age|senior citizen|vridh|retirement|apy)\b/i.test(lower)) {
    const pensionSchemes = SCHEMES_DATABASE.filter(s => s.category === 'social_security');
    return {
      message: `Here are the government **Social Security & Guaranteed Pension Schemes**:`,
      type: 'schemes_list',
      matchedSchemes: pensionSchemes,
      quickReplies: ['Atal Pension Yojana (APY)', 'Old Age Pension (IGNOAPS)', 'PM Suraksha Bima (₹20/yr)']
    };
  }

  if (/\b(ration|food|grain|wheat|rice|gehun|chawal)\b/i.test(lower)) {
    const rationSchemes = SCHEMES_DATABASE.filter(s => s.id === 'pm-gkay');
    return {
      message: `Here are the details for **PM Garib Kalyan Anna Yojana (Free Ration Scheme)**:`,
      type: 'schemes_list',
      matchedSchemes: rationSchemes,
      quickReplies: ['How to collect ration via ONORC', 'Ration card Aadhaar linking', 'Helpline 1967']
    };
  }

  // -------------------------------------------------------------
  // 7. STATE-BASED SEARCH (e.g. "schemes in maharashtra", "mp schemes")
  // -------------------------------------------------------------
  const detectedState = extractState(text);
  if (detectedState && detectedState !== 'All') {
    const stateSchemes = SCHEMES_DATABASE.filter(s => s.applicableStates.includes(detectedState) || s.applicableStates.includes('All'));
    return {
      message: `Here are welfare schemes applicable for residents of **${detectedState}** (including Central and State programs):`,
      type: 'schemes_list',
      matchedSchemes: stateSchemes.slice(0, 6),
      quickReplies: [
        `Check eligibility in ${detectedState}`,
        'Farmer Schemes',
        'Women Schemes',
        'Student Scholarships'
      ]
    };
  }

  // -------------------------------------------------------------
  // 8. KEYWORD FALLBACK MATCH
  // -------------------------------------------------------------
  const keywordMatches = SCHEMES_DATABASE.filter(s => {
    return s.tags.some(tag => lower.includes(tag)) ||
      s.description.toLowerCase().includes(lower) ||
      s.benefits.some(b => b.toLowerCase().includes(lower));
  });

  if (keywordMatches.length > 0) {
    return {
      message: `I found **${keywordMatches.length} schemes** matching your query:`,
      type: 'schemes_list',
      matchedSchemes: keywordMatches.slice(0, 5),
      quickReplies: [
        'Check My Eligibility',
        'Required Documents',
        'Official Application Links',
        'Explore All Schemes'
      ]
    };
  }

  // -------------------------------------------------------------
  // 9. HELPFUL DEFAULT GUIDANCE
  // -------------------------------------------------------------
  return {
    message: `I'd love to help you find the right scheme or guide you with your application.\n\nYou can ask me things like:\n- *"Which schemes are available for farmers?"*\n- *"What documents are needed for PM-KISAN?"*\n- *"How to apply for Ayushman Bharat Card?"*\n- *"I am a 21-year-old student from Maharashtra, check my eligibility"*\n- *"My OTP is not coming on the portal, what to do?"*`,
    type: 'text',
    quickReplies: [
      '🔍 Check My Eligibility',
      '🌾 Farmer Schemes (PM-KISAN)',
      '🎓 Scholarship Schemes',
      '👩 Women Empowerment Schemes',
      '🛠️ Portal Troubleshooting Help'
    ]
  };
}
