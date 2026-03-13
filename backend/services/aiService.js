const OpenAI = require('openai');
const axios = require('axios');
const FormData = require('form-data');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const PROMPTS = {
  twitter: (text) => `You are an expert social media strategist. Transform the following content into a compelling Twitter/X thread.

REQUIREMENTS:
- Create exactly 8-10 numbered tweets (1/, 2/, etc.)
- Each tweet MUST be under 280 characters
- Tweet 1: Powerful hook that stops the scroll
- Tweets 2-8: Key insights, one per tweet, punchy and direct
- Final tweet: Strong call-to-action + 2-3 relevant hashtags
- No filler. Every tweet must deliver standalone value
- Conversational, opinionated tone

SOURCE CONTENT:
${text.substring(0, 4000)}

Output ONLY the numbered tweets. No preamble.`,

  linkedin: (text) => `You are a LinkedIn thought leader. Create a high-performing LinkedIn post from this content.

REQUIREMENTS:
- Length: 900-1200 characters
- Line 1: Bold hook (no "I" or generic opener)
- Use 2-3 sentence paragraphs max (white space is crucial)
- Include: 1 personal insight or contrarian take
- Include: 3-5 numbered key takeaways
- Include: 1 question to drive comments
- End with: 3-5 strategic hashtags
- Tone: Professional but human; authoritative but not arrogant

SOURCE CONTENT:
${text.substring(0, 4000)}

Output ONLY the LinkedIn post. No preamble.`,

  instagram: (text) => `You are an Instagram content creator with 500K+ followers. Create a caption that drives saves and shares.

REQUIREMENTS:
- Opening line: Must hook within 125 characters (shown before "more")
- Body: 200-350 words, storytelling format
- Use line breaks liberally for readability
- Include 4-6 relevant emojis woven naturally (not at start of lines)
- 3-5 concrete takeaways or tips
- End with: Engaging question + clear CTA
- Close: 25-30 niche hashtags on separate lines

SOURCE CONTENT:
${text.substring(0, 4000)}

Output ONLY the Instagram caption with hashtags.`,

  blog: (text) => `You are a senior content strategist and SEO writer. Transform this into a comprehensive blog article.

REQUIREMENTS:
- Meta Description: (first line, labeled "META:" under 160 chars)
- Title: (labeled "TITLE:", SEO-optimized, power word)
- Introduction: 120-150 words, hook + problem statement + thesis
- Body: 5-7 H2 sections with 150-200 words each, markdown formatted
- Include: Data points, actionable tips, and examples
- Conclusion: 100-120 words with summary + next steps
- Total: 1000-1400 words
- Format in clean Markdown

SOURCE CONTENT:
${text.substring(0, 4000)}

Output the full article in Markdown.`,

  email: (text) => `You are a high-conversion email copywriter. Create an email newsletter that gets opened and clicked.

REQUIREMENTS:
Line 1: SUBJECT: [compelling subject under 55 chars]
Line 2: PREVIEW: [preview text under 90 chars that complements subject]
Line 3: ---
Body structure:
- Greeting: Personalized opener
- Hook paragraph: 40-60 words, WIIFM
- Main value: 3-4 short sections with subheadings
- Each section: 60-90 words max
- CTA button text: [clear action, 3-6 words]
- P.S. line: Conversational teaser or secondary CTA
Total body: 350-500 words

SOURCE CONTENT:
${text.substring(0, 4000)}

Output the complete email including SUBJECT and PREVIEW lines.`,

  youtube_shorts: (text) => `You are a viral YouTube Shorts director and scriptwriter. Create a script optimized for maximum retention.

REQUIREMENTS:
Format each line as: [TIMESTAMP] [DIRECTION]: Content

Structure:
- [0-3s] [HOOK]: Pattern interrupt opening line (never start with "Hey")
- [3-8s] [PROMISE]: What they'll learn
- [8-45s] [VALUE]: 4-5 rapid-fire points with [B-ROLL] and [TEXT OVERLAY] directions
- [45-55s] [CTA]: Subscribe reason + like instruction
- [55-60s] [CLOSER]: Memorable sign-off

Additional requirements:
- Total spoken word count: 130-160 words (=60 seconds)
- Energy level: HIGH throughout
- Include 3-4 [VISUAL] direction notes

SOURCE CONTENT:
${text.substring(0, 4000)}

Output only the formatted script.`,
};

exports.generateContent = async (text, formats, isPriority = false) => {
  const model = isPriority ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';
  const results = [];
  let totalTokens = 0;

  for (const format of formats) {
    if (!PROMPTS[format]) continue;
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert content repurposing specialist. Follow instructions precisely. Output ONLY the requested content — no meta-commentary, no preamble.',
          },
          { role: 'user', content: PROMPTS[format](text) },
        ],
        max_tokens: 2500,
        temperature: 0.72,
      });
      totalTokens += completion.usage?.total_tokens || 0;
      results.push({
        type: format,
        content: completion.choices[0].message.content.trim(),
        tokensUsed: completion.usage?.total_tokens || 0,
      });
      console.log(`✅ Generated ${format} using ${model}`);
    } catch (err) {
      console.error(`❌ Error generating ${format}:`, err.message);
      results.push({
        type: format,
        content: `⚠️ Generation failed for ${format}. Please regenerate this format.`,
        tokensUsed: 0,
        error: true,
      });
    }
  }
  return { results, totalTokens, model };
};

exports.regenerateSingle = async (text, format, isPriority = false) => {
  if (!PROMPTS[format]) throw new Error(`Unknown format: ${format}`);
  const model = isPriority ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert content repurposing specialist. Generate a COMPLETELY DIFFERENT version. Output ONLY the content.',
      },
      { role: 'user', content: PROMPTS[format](text) },
    ],
    max_tokens: 2500,
    temperature: 0.88,
  });
  return {
    type: format,
    content: completion.choices[0].message.content.trim(),
    tokensUsed: completion.usage?.total_tokens || 0,
    model,
  };
};

exports.transcribeAudio = async (audioBuffer, fileName, mimeType) => {
  const formData = new FormData();
  formData.append('file', audioBuffer, {
    filename: fileName,
    contentType: mimeType || 'audio/mpeg',
  });
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'text');
  formData.append('language', 'en');
  const response = await axios.post(
    'https://api.groq.com/openai/v1/audio/transcriptions',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      maxBodyLength: Infinity,
      timeout: 120000,
    }
  );
  return response.data;
};

const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1].trim();
  }
  return null;
};

const tryYoutubeTranscriptLib = async (videoId) => {
  const { YoutubeTranscript } = require('youtube-transcript');
  const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
  if (!transcript || transcript.length === 0) throw new Error('Empty transcript');
  return transcript.map((t) => t.text).join(' ').replace(/\s+/g, ' ').trim();
};

const tryTimedTextAPI = async (videoId) => {
  const watchRes = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 15000,
  });
  const html = watchRes.data;
  const captionMatch = html.match(/"captionTracks":\[(\{.*?\})\]/);
  if (!captionMatch) throw new Error('No caption tracks found');
  const captionData = JSON.parse(`[${captionMatch[1]}]`);
  const englishTrack = captionData.find(
    (t) => t.languageCode === 'en' || t.languageCode === 'en-US'
  ) || captionData[0];
  if (!englishTrack?.baseUrl) throw new Error('No usable caption track URL');
  const transcriptRes = await axios.get(englishTrack.baseUrl, { timeout: 10000 });
  const xml = transcriptRes.data;
  const texts = [];
  const regex = /<text[^>]*>([\s\S]*?)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const text = match[1]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]+>/g, '').trim();
    if (text) texts.push(text);
  }
  if (texts.length === 0) throw new Error('Parsed transcript is empty');
  return texts.join(' ').replace(/\s+/g, ' ').trim();
};

const tryOEmbedFallback = async (videoId) => {
  const res = await axios.get(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    { timeout: 8000 }
  );
  const { title, author_name } = res.data;
  if (!title) throw new Error('Could not get video metadata');
  return `Video Title: "${title}" by ${author_name}. Generate content based on this video title and topic.`;
};

exports.fetchYouTubeTranscript = async (url) => {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error('Invalid YouTube URL.');
  const methods = [
    { name: 'youtube-transcript', fn: () => tryYoutubeTranscriptLib(videoId) },
    { name: 'timedtext-api',      fn: () => tryTimedTextAPI(videoId) },
    { name: 'oembed-fallback',    fn: () => tryOEmbedFallback(videoId) },
  ];
  for (const method of methods) {
    try {
      console.log(`[YouTube] Trying: ${method.name}`);
      const transcript = await method.fn();
      console.log(`[YouTube] ✅ Success: ${method.name} (${transcript.length} chars)`);
      return transcript;
    } catch (err) {
      console.warn(`[YouTube] ❌ ${method.name} failed: ${err.message}`);
    }
  }
  throw new Error('Could not fetch transcript. Try using "Paste Text" instead.');
};

exports.estimateTokens = (text) => Math.ceil(text.split(/\s+/).length * 1.3);