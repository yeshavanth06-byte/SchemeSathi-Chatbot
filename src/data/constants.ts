export const INDIAN_STATES_AND_UTS = [
  'All India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export const OCCUPATIONS_LIST = [
  { value: 'Farmer / Agriculture', label: '👨‍🌾 Farmer / Agriculture Worker' },
  { value: 'Student / Scholar', label: '🎓 Student / Scholar / Higher Studies' },
  { value: 'Street Vendor / Hawker', label: '🛒 Street Vendor / Small Hawker' },
  { value: 'Traditional Artisan / Craftsperson', label: '🔨 Traditional Artisan / Craftsperson (Vishwakarma)' },
  { value: 'Self-Employed / Shopkeeper', label: '🏪 Small Shopkeeper / MSME Business Owner' },
  { value: 'Daily Wage Laborer / Worker', label: '🏗️ Daily Wage Construction / Unorganized Worker' },
  { value: 'Senior Citizen / Retired', label: '👴 Senior Citizen (60+ years)' },
  { value: 'Homemaker / Housewife', label: '👩 Homemaker / Mother' },
  { value: 'Unemployed Youth', label: '💼 Unemployed Job Seeker' }
];

export const CATEGORY_METADATA: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  agriculture: { label: 'Agriculture & Farmers', icon: '🌾', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  health: { label: 'Healthcare & Medical', icon: '🏥', color: 'text-rose-800', bg: 'bg-rose-50 border-rose-200' },
  education: { label: 'Education & Scholarships', icon: '🎓', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  women_child: { label: 'Women & Child Welfare', icon: '👩', color: 'text-pink-800', bg: 'bg-pink-50 border-pink-200' },
  housing: { label: 'Housing & Clean Energy', icon: '🏠', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  social_security: { label: 'Social Security & Pension', icon: '🛡️', color: 'text-indigo-800', bg: 'bg-indigo-50 border-indigo-200' },
  business_msme: { label: 'Loans & Micro Enterprises', icon: '💼', color: 'text-purple-800', bg: 'bg-purple-50 border-purple-200' },
  employment: { label: 'Skill & Employment', icon: '🛠️', color: 'text-cyan-800', bg: 'bg-cyan-50 border-cyan-200' },
  food_welfare: { label: 'Food & Nutrition Security', icon: '🍚', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200' }
};

export const NATIONAL_HELPLINES = [
  { name: 'National Emergency Response (All in One)', number: '112', purpose: 'Police, Fire, Ambulance & Disaster Response' },
  { name: 'Kisan Call Centre (Agriculture)', number: '1800-180-1551', purpose: 'Expert agricultural consultation and PM-KISAN help' },
  { name: 'Ayushman Bharat (PM-JAY)', number: '14555', purpose: 'Hospital empanelment, golden card & claims inquiry' },
  { name: 'National Cyber Crime Reporting', number: '1930', purpose: 'Report financial cyber fraud / OTP / online banking phishing' },
  { name: 'National Scholarship Portal (NSP)', number: '0120-6619540', purpose: 'Scholarship status, biometric and DNO inquiries' },
  { name: 'Women Helpline (Domestic/Distress)', number: '181', purpose: '24x7 emergency response and legal guidance for women' },
  { name: 'National Food Security (Ration)', number: '1967', purpose: 'Ration card issues, ONORC portability, Fair Price Shops' },
  { name: 'Senior Citizen Elderline', number: '14567', purpose: 'Support, legal and pension assistance for seniors' },
  { name: 'CPGRAMS Central Public Grievances', number: '1800-11-0031', purpose: 'Government department grievance escalations' }
];
