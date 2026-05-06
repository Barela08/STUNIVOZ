const SETTINGS_KEY = 'stunivoz_admin_settings';
const FEATURE_API_KEY = 'stunivoz_feature_apis';
const API_RECORDS_KEY = 'stunivoz_api_records';
const SMART_API_KEY = 'stunivoz_smart_apis_v2';
const FEATURE_ASSIGN_KEY = 'stunivoz_feature_assign_v2';

function getAIConfig(): { provider: string; model: string; apiKey: string; endpoint?: string } {
  try {
    const smartApis = JSON.parse(localStorage.getItem(SMART_API_KEY) || '[]') as any[];
    if (smartApis.length > 0) {
      const ready = smartApis.find(e => e.status === 'ready');
      if (ready) return { provider: ready.platform, model: ready.selectedModel, apiKey: ready.apiKey };
    }
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.aiProvider || 'gemini',
        model: parsed.aiModel || 'gemini-2.0-flash',
        apiKey: parsed.aiApiKey || '',
      };
    }
  } catch {}
  return { provider: 'gemini', model: 'gemini-2.0-flash', apiKey: '' };
}

function getFeatureConfig(feature: string): { provider: string; model: string; apiKey: string; endpoint?: string } {
  try {
    const featureAssign = JSON.parse(localStorage.getItem(FEATURE_ASSIGN_KEY) || '{}');
    const assignedId = featureAssign[feature];
    if (assignedId) {
      const smartApis = JSON.parse(localStorage.getItem(SMART_API_KEY) || '[]') as any[];
      const api = smartApis.find(e => e.id === assignedId && e.status === 'ready');
      if (api) return { provider: api.platform, model: api.selectedModel, apiKey: api.apiKey };
    }
    const featureApis = JSON.parse(localStorage.getItem(FEATURE_API_KEY) || '{}');
    const featureApiId = featureApis[feature];
    if (featureApiId !== undefined && featureApiId !== '') {
      const apis = JSON.parse(localStorage.getItem(API_RECORDS_KEY) || '[]');
      const api = apis.find((a: any) => String(a.id) === String(featureApiId));
      if (api && api.apiKey) {
        return { provider: api.platform || 'gemini', model: api.model || 'gemini-2.0-flash', apiKey: api.apiKey, endpoint: api.endpoint };
      }
    }
  } catch {}
  return getAIConfig();
}

async function callGemini(prompt: string, model: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAICompat(prompt: string, model: string, apiKey: string, baseUrl: string = 'https://api.openai.com/v1'): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 4096, temperature: 0.7 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callClaude(prompt: string, model: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Claude API error: ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

export async function callAI(prompt: string, feature?: string): Promise<string> {
  const config = feature ? getFeatureConfig(feature) : getAIConfig();
  const { provider, model, apiKey, endpoint } = config;
  if (!apiKey) throw new Error('No API key configured. Please set your AI API key in Admin → AI Settings.');
  if (provider === 'gemini') return callGemini(prompt, model, apiKey);
  if (provider === 'openai') return callOpenAICompat(prompt, model, apiKey);
  if (provider === 'groq') return callOpenAICompat(prompt, model, apiKey, 'https://api.groq.com/openai/v1');
  if (provider === 'openrouter') return callOpenAICompat(prompt, model, apiKey, endpoint || 'https://openrouter.ai/api/v1');
  if (provider === 'claude') return callClaude(prompt, model, apiKey);
  return callGemini(prompt, model, apiKey);
}

export interface DiscoveredInternship {
  title: string; company: string; location: string; type: string;
  stipend: string; duration: string; skills: string; description: string;
  applyUrl: string; expiresAt: string; isScam: boolean; scamReason?: string;
}

export interface DiscoveredEvent {
  title: string; host: string; date: string; location: string; type: string;
  description: string; link: string; expiresAt: string; isScam: boolean;
  scamReason?: string; bannerKeyword: string;
}

export interface DiscoveredCourse {
  title: string; instructor: string; platform: string; category: string;
  duration: string; level: string; description: string; link: string;
  isFree: boolean; price: string; isScam: boolean; scamReason?: string;
}

export async function discoverInternships(topic: string, count: number = 5): Promise<DiscoveredInternship[]> {
  const today = new Date();
  const expiry = new Date(today);
  expiry.setMonth(expiry.getMonth() + 2);
  const expiresAt = expiry.toISOString().split('T')[0];

  const prompt = `You are an AI that discovers real internship opportunities from across the web and social media platforms (LinkedIn, Internshala, Naukri, AngelList, company websites).

Search for up to ${count} internship/job opportunities matching: "${topic}"

For each opportunity:
1. Check if it looks legitimate (not spam, clear company, real apply link)
2. Generate realistic details based on what you know about the current job market

Return ONLY a valid JSON array (no markdown, no explanation) with this structure:
[
  {
    "title": "Role title",
    "company": "Company name",
    "location": "City, State or Remote",
    "type": "Full-time | Part-time | Remote | Hybrid",
    "stipend": "₹XX,XXX/month or Unpaid",
    "duration": "X months",
    "skills": "skill1, skill2, skill3",
    "description": "2-3 sentence description of the role and responsibilities",
    "applyUrl": "https://example.com/apply",
    "expiresAt": "${expiresAt}",
    "isScam": false,
    "scamReason": ""
  }
]

Make the data realistic for the Indian job market in 2025-2026. Include a mix of companies (startups, mid-size, large corps). Mark any that seem suspicious as isScam: true with a reason.`;

  const raw = await callAI(prompt, 'discover');
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid format. Please try again.');
  return JSON.parse(jsonMatch[0]) as DiscoveredInternship[];
}

export async function discoverEvents(topic: string, count: number = 5): Promise<DiscoveredEvent[]> {
  const today = new Date();
  const eventDate = new Date(today);
  eventDate.setMonth(eventDate.getMonth() + 1);
  const expiry = new Date(eventDate);
  expiry.setDate(expiry.getDate() + 7);

  const prompt = `You are an AI that discovers real events, hackathons, webinars, and workshops from across the web and social media (LinkedIn, Devfolio, Unstop, Eventbrite, company pages).

Search for up to ${count} events matching: "${topic}"

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "title": "Event title",
    "host": "Organizer/Company",
    "date": "Month DD, YYYY or Month DD-DD, YYYY",
    "location": "City or Virtual",
    "type": "Hackathon | Webinar | Workshop | Drive | Conference",
    "description": "2-3 sentence description of the event and what participants will gain",
    "link": "https://example.com/register",
    "expiresAt": "${expiry.toISOString().split('T')[0]}",
    "isScam": false,
    "scamReason": "",
    "bannerKeyword": "single keyword for banner image e.g. hackathon coding technology"
  }
]

Include a mix of virtual and in-person events. Dates should be in 2025-2026. Mark suspicious ones with isScam: true.`;

  const raw = await callAI(prompt, 'discover');
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid format. Please try again.');
  return JSON.parse(jsonMatch[0]) as DiscoveredEvent[];
}

export async function discoverCourses(topic: string, count: number = 5): Promise<DiscoveredCourse[]> {
  const prompt = `You are an AI that discovers real online courses from platforms like Coursera, Udemy, edX, NPTEL, YouTube, Scaler, and other learning platforms.

Search for up to ${count} courses matching: "${topic}"

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "title": "Course title",
    "instructor": "Instructor name",
    "platform": "Udemy | Coursera | edX | YouTube | NPTEL | Scaler | Other",
    "category": "Web Development | Data Science | AI/ML | Cybersecurity | Design | Other",
    "duration": "X hours or X weeks",
    "level": "Beginner | Intermediate | Advanced",
    "description": "2-3 sentence description of what students will learn",
    "link": "https://example.com/course",
    "isFree": false,
    "price": "₹X,XXX or Free or $XX",
    "isScam": false,
    "scamReason": ""
  }
]

Include a mix of free and paid courses, different platforms, and difficulty levels. Mark any suspicious or low-quality courses with isScam: true.`;

  const raw = await callAI(prompt, 'discover');
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid format. Please try again.');
  return JSON.parse(jsonMatch[0]) as DiscoveredCourse[];
}

export async function careerChatReply(userMessage: string, history: {role: string; text: string}[]): Promise<string> {
  let assistantName = 'Career Advisor';
  try {
    const { db } = await import('./firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'system_config', 'ai_settings'));
    if (snap.exists()) {
      const d = snap.data();
      if (d.assistantName) assistantName = d.assistantName;
    }
  } catch {}

  const historyText = history.slice(-6).map(m => `${m.role === 'bot' ? assistantName : 'User'}: ${m.text}`).join('\n');

  const prompt = `You are ${assistantName}, a helpful AI Career Advisor for STUNIVOZ, a student career development platform for Indian college students.

You help students with:
- Finding and applying for internships
- Resume writing and ATS optimization  
- Interview preparation (DSA, system design, HR)
- Career roadmaps and skill building
- Salary and stipend benchmarks
- College-to-career transitions

Be specific, practical, and encouraging. Use Indian context (companies, stipends in ₹, Indian job portals like Internshala, LinkedIn, Naukri). Format responses with bullet points and headers where helpful. Keep responses concise but valuable (150-250 words max).

Previous conversation:
${historyText}

User: ${userMessage}
${assistantName}:`;

  return await callAI(prompt, 'career_chat');
}
