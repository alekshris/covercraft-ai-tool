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
      professional: 'Write in a professional, polished tone that demonstrates competence and maturity.',
      enthusiastic: 'Write with genuine enthusiasm and energy while remaining professional.',
      concise: 'Write in a brief, direct manner that gets straight to the point while covering key qualifications.',
    };

    const prompt = `You are an expert cover letter writer. Write a personalized, compelling 3-paragraph cover letter for this job application.

Job Title: ${formData.jobTitle}
Company: ${formData.companyName}

Job Description:
${formData.jobDescription}

Candidate's Experience/Background:
${formData.experience}

Tone: ${toneInstructions[formData.tone]}

IMPORTANT GUIDELINES:

TONE AND VOICE:
- Write like a real person talking, not a robot writing
- Use simple everyday words — avoid all corporate buzzwords
- Vary sentence length — mix short punchy sentences with longer ones
- Write how a confident person talks, not how they think they should sound on paper

BANNED WORDS — never use any of these under any circumstance:
delve, optimize, pivotal, glimpse, stark, seamless, robust,
paramount, crucial, notable, imperative, comprehensive,
multifaceted, nuanced, elevate, foster, facilitate, streamline,
harness, empower, transformative, impactful, vibrant, meticulous,
dedicated, innovative, dynamic, passionate, spearhead, synergy,
leverage, utilize, thrilled, delighted, rockstar, ninja, guru,
thought leader, cutting-edge, excited

BANNED PHRASES — never use any of these:
- Any em dash (—) anywhere in the letter
- "It's important to note that"
- "In today's fast-paced world"
- "Not only...but also"
- "It's not just X, it's Y"
- "No X. No Y. Just Z"
- "I am writing to express"
- "I would be a great fit"
- "I am passionate about"
- "I am excited to apply"
- "Please find attached"
- "As per your requirements"
- Starting any sentence with "Furthermore," "Moreover," or "Indeed,"
- "I am thrilled" or "I am delighted"

STRUCTURE:
- Exactly 3 paragraphs, no more no less
- No heading, date, address or signature
- No bullet points inside the letter
- First paragraph: strong direct opening that mentions 
  the specific role and company naturally
- Second paragraph: connect experience to the job 
  with ONE specific concrete example or achievement with numbers if possible
- Third paragraph: short confident closing — no begging or over-enthusiasm

HUMAN WRITING PATTERNS:
- Use contractions naturally: I've, I'm, that's, it's, I'd
- Add one small specific personal detail that feels real
- Vary paragraph length slightly
- Avoid overly perfect parallel structure in sentences
- Never repeat the same word twice in one paragraph
- Mix active and passive voice naturally
- Include one slightly informal phrase per paragraph
- Make logic flow conversationally not as a perfectly structured argument

Write the cover letter now:

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
