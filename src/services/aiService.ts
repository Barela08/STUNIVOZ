const SETTINGS_KEY = 'stunivoz_admin_settings';

function getAIConfig(): { provider: string; model: string; apiKey: string } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.aiProvider || 'gemini',
        model: parsed.aiModel || 'gemini-1.5-flash',
        apiKey: parsed.aiApiKey || '',
      };
    }
  } catch {}
  return { provider: 'gemini', model: 'gemini-1.5-flash', apiKey: '' };
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
    throw new Error(err?.error?.message || `API error: ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAI(prompt: string, model: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function callAI(prompt: string): Promise<string> {
  const { provider, model, apiKey } = getAIConfig();
  if (!apiKey) throw new Error('No API key configured. Please set your AI API key in Admin → AI Settings.');
  if (provider === 'openai') return callOpenAI(prompt, model, apiKey);
  return callGemini(prompt, model, apiKey);
}

export interface DiscoveredInternship {
  title: string;
  company: string;
  location: string;
  type: string;
  stipend: string;
  duration: string;
  skills: string;
  description: string;
  applyUrl: string;
  expiresAt: string;
  isScam: boolean;
  scamReason?: string;
}

export interface DiscoveredEvent {
  title: string;
  host: string;
  date: string;
  location: string;
  type: string;
  description: string;
  link: string;
  expiresAt: string;
  isScam: boolean;
  scamReason?: string;
  bannerKeyword: string;
}

export interface DiscoveredCourse {
  title: string;
  instructor: string;
  platform: string;
  category: string;
  duration: string;
  level: string;
  description: string;
  link: string;
  isFree: boolean;
  price: string;
  isScam: boolean;
  scamReason?: string;
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

  const raw = await callAI(prompt);
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

  const raw = await callAI(prompt);
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

  const raw = await callAI(prompt);
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid format. Please try again.');
  return JSON.parse(jsonMatch[0]) as DiscoveredCourse[];
}

export async function careerChatReply(userMessage: string, history: {role: string; text: string}[]): Promise<string> {
  const historyText = history.slice(-6).map(m => `${m.role === 'bot' ? 'Assistant' : 'User'}: ${m.text}`).join('\n');

  const prompt = `You are a helpful AI Career Advisor for STUNIVOZ, a student career development platform for Indian college students.

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
Assistant:`;

  return await callAI(prompt);
}
