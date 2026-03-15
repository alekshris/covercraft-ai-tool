import { useState } from 'react';
import { Copy, Loader2, Sparkles } from 'lucide-react';

interface FormData {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  experience: string;
  tone: 'professional' | 'enthusiastic' | 'concise';
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    experience: '',
    tone: 'professional',
  });
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!formData.jobTitle.trim()) newErrors.jobTitle = true;
    if (!formData.companyName.trim()) newErrors.companyName = true;
    if (!formData.jobDescription.trim()) newErrors.jobDescription = true;
    if (!formData.experience.trim()) newErrors.experience = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCoverLetter = async () => {
    if (!validateForm()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    setCoverLetter('');

    const toneInstructions = {
      professional: `PROFESSIONAL TONE — this is strict, follow exactly:
- Write like a senior professional speaking to a hiring committee
- Formal, composed, and confident — think Harvard Business School graduate
- NO contractions at all: write "I have" not "I've", "I am" not "I'm", "that is" not "that's"
- NO informal words: no "pretty", "honestly", "right?", "huge", "cool", "stuff", "things"
- NO casual sentence starters: never start with "And", "But", "So", "Look"
- NO filler phrases: no "let's see", "hit the ground running", "at the end of the day"
- Every sentence is deliberate and measured
- Show genuine interest through specific knowledge of the company, not enthusiasm words
- Confident but not arrogant — state facts about your experience, do not oversell
- The tone should feel like a well written business letter from a competent professional`,

      enthusiastic: `ENTHUSIASTIC TONE — warm and energetic but still professional:
- Write with genuine personality and warmth
- Contractions are fine: I've, I'm, that's, I'd
- Show real interest in the company with specific details
- Upbeat and positive but not over the top
- Sound like a motivated person, not a cheerleader
- Still professional enough for a job application
- Avoid being too casual — no slang, no jokes`,

      concise: `CONCISE TONE — short, sharp, and direct:
- Get to the point immediately, no warm up sentences
- Short sentences, no padding, no filler
- Every word earns its place
- Still professional and human
- Contractions are fine to keep it tight
- The whole letter should feel lean and efficient`,
    };

    const prompt = `You are a cover letter writer who writes like a real, confident human professional. Your job is to write cover letters that sound like they were written by the candidate themselves — not by AI, not by a career coach.

CRITICAL RULE: You will be penalized for every banned word or phrase you use. Read the full banned list before writing anything.

BANNED WORDS — never use these under any circumstance:
delve, optimize, pivotal, glimpse, stark, seamless, robust, paramount, crucial, notable, imperative, comprehensive, multifaceted, nuanced, elevate, foster, facilitate, streamline, harness, empower, transformative, impactful, vibrant, meticulous, dedicated, innovative, dynamic, spearhead, synergy, leverage, utilize, thrilled, delighted, rockstar, ninja, guru, thought leader, cutting-edge, seasoned, honed, attuned, relentless, profound, exceptional, eager, cross-functional, valuable addition, hard-working, results-driven, team player, go-getter

BANNED PHRASES — never use these:
- Any em dash anywhere in the letter
- "I am thrilled or delighted or excited to apply"
- "I would be a great fit"
- "I am passionate about"
- "my passion for"
- "change the world"
- "exceed expectations"
- "I look forward to the opportunity"
- "It is important to note"
- "Not only but also"
- "In today's fast paced world"
- "Furthermore" or "Moreover" or "Indeed" as sentence starters
- "As someone who"
- "With a passion for"
- "I am confident that I would"
- "hit the ground running"
- "let's see where it goes"
- "at the end of the day"
- "I am writing to express my interest"
- "please find attached"
- "as per your requirements"
- "I think I would be"
- "pretty confident"
- "pretty appealing"
- "And honestly"
- "right?" at end of sentences

TONE — follow the selected tone instructions exactly, they override everything else:
${toneInstructions[formData.tone]}

STRUCTURE — follow this exactly:
- Exactly 3 paragraphs, no more no less
- No heading, date, address, greeting or signature
- No bullet points inside the letter
- Paragraph 1: open directly by stating the role and what specifically draws you to this company — use a real specific detail about the company, not generic praise
- Paragraph 2: give ONE concrete achievement with specific numbers that directly connects to what the job requires
- Paragraph 3: short, confident close that moves things forward — no begging, no cliches, no "I look forward to hearing from you"

QUALITY CHECK — before finalising, verify:
- Does it contain any banned word? Remove it.
- Does it contain any em dash? Remove it.
- Does it match the selected tone exactly?
- Does it sound like a real human wrote it?
- Is it specific to this company and role, not generic?

Job Title: ${formData.jobTitle}
Company: ${formData.companyName}

Job Description:
${formData.jobDescription}

Candidate Experience and Background:
${formData.experience}

Write the cover letter now:`;

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error('Please set your Groq API key in the .env file');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate cover letter');
      }

      const data = await response.json();
      const generatedLetter = data.choices[0].message.content;
      setCoverLetter(generatedLetter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-[#0f172a] text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-3xl font-bold">CoverCraft AI</h1>
          </div>
          <p className="text-center text-gray-300 mt-2">
            Land interviews with AI-powered cover letters
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition ${
                  errors.jobTitle ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Senior Product Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Acme Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition resize-y ${
                  errors.jobDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Paste the job posting here..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Experience / Background *
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition resize-y ${
                  errors.experience ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your relevant experience, skills, and achievements..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tone
              </label>
              <select
                name="tone"
                value={formData.tone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition"
              >
                <option value="professional">Professional</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="concise">Concise</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={generateCoverLetter}
              disabled={loading}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-4 px-6 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Crafting your cover letter...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>
        </div>

        {coverLetter && (
          <div className="mt-8 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">Your Cover Letter</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={generateCoverLetter}
                    disabled={loading}
                    className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg transition disabled:opacity-50"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {coverLetter}
                </p>
              </div>
            </div>

            <a
              href="#"
              className="block bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-center py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition"
            >
              Want unlimited generations? Get lifetime access →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
