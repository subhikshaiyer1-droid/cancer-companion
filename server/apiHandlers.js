import dotenv from 'dotenv';
import { extractReadableText, analyzeReportWithAI } from './reportAnalyzer.js';

dotenv.config();

const MODEL = 'nvidia/nemotron-3.5-lightning:free';

// Strictly use OPENROUTER_API_KEY from process.env (never require VITE_ prefix)
export const getApiKey = () => (process.env.OPENROUTER_API_KEY || '').trim();

export async function handleChatRequest({ messages, reportContext }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error('The AI service is not configured. OPENROUTER_API_KEY is missing from the server environment.');
    err.status = 500;
    throw err;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    const err = new Error('Messages array is required.');
    err.status = 400;
    throw err;
  }

  let systemInstruction = `You are Cancer Companion, a warm, intelligent, empathetic conversational AI assistant.
Your primary purpose is to provide helpful conversation, emotional support, health education, and general assistance.
You are NOT a restricted FAQ bot. Answer the user's actual question rather than limiting responses to predefined cancer topics.

If the user is emotionally distressed, respond with empathy first.
Keep answers understandable and human. Do not pretend to be a doctor. Do not diagnose the user. Do not prescribe medication.
For medical questions, provide general educational information and encourage consultation with an appropriate healthcare professional.
For urgent or potentially life-threatening symptoms (such as fever during chemotherapy, severe breathing difficulty, uncontrolled bleeding, or confusion), clearly advise the user to contact emergency services or their healthcare team immediately.`;

  if (reportContext) {
    systemInstruction += `\n\n--- ACTIVE PATIENT MEDICAL REPORT CONTEXT ---
Document: ${reportContext.fileName || 'Uploaded Report'}
Document Type: ${reportContext.documentType || 'Not specified'}
Cancer Type: ${reportContext.cancerType || 'Not explicitly stated'}
Stage/Grade: ${reportContext.stageOrGrade || 'Not stated'}
Key Findings: ${JSON.stringify(reportContext.keyFindings || [])}
Guidance Notes: ${JSON.stringify(reportContext.summary || '')}

CRITICAL INSTRUCTIONS FOR REPORT DISCUSSION:
1. When discussing this report, refer ONLY to verified information present in the report above.
2. Clearly distinguish confirmed findings from unstated or missing clinical data.
3. NEVER invent laboratory values, cancer stages, or medications that do not exist in the report.
4. Never advise changing or stopping prescribed medications.
5. Provide helpful, calm explanations of medical terminology.`;
  }

  const payloadMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => ({
      role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
      content: m.content || m.text || ''
    }))
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  let response;
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cancer-companion.vercel.app',
        'X-Title': 'Cancer Companion'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: payloadMessages
      }),
      signal: controller.signal
    });
  } catch (fetchErr) {
    clearTimeout(timeout);
    if (fetchErr.name === 'AbortError') {
      const err = new Error('The AI service request timed out. Please try asking again.');
      err.status = 504;
      throw err;
    }
    console.error('OpenRouter fetch exception:', fetchErr);
    const err = new Error('Could not connect to the AI service provider. Please check network connectivity.');
    err.status = 502;
    throw err;
  }

  clearTimeout(timeout);

  if (!response.ok) {
    let errMessage = `AI Service Error (${response.status}): Unable to generate response.`;
    if (response.status === 401 || response.status === 403) {
      errMessage = 'The AI service is not authorized right now. Please check the OPENROUTER_API_KEY in your deployment environment settings.';
    } else if (response.status === 429) {
      errMessage = 'The AI service is temporarily busy or rate-limited. Please wait a moment and try again.';
    } else if (response.status >= 500) {
      errMessage = 'The AI provider is temporarily unavailable. Please try again in a few moments.';
    }
    const err = new Error(errMessage);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';

  // Strip OpenRouter / safety tags
  const finalContent = rawContent
    .replace(/^(User Safety:.*|Response Safety:.*|Reasoning:.*|Provider:.*|Usage:.*)$/gmi, '')
    .trim();

  if (!finalContent) {
    const err = new Error('The AI provider returned an empty response. Please try rephrasing your message.');
    err.status = 502;
    throw err;
  }

  return {
    message: finalContent,
    model: MODEL
  };
}

export async function handleAnalyzeRequest({ fileBase64, mimeType, fileName, text, patientContext }) {
  const apiKey = getApiKey();
  let extractedText = text || '';

  if (fileBase64) {
    const buffer = Buffer.from(fileBase64, 'base64');
    extractedText = await extractReadableText(buffer, mimeType, fileName);
  }

  if (!extractedText || extractedText.trim().length < 20) {
    const err = new Error('Unable to extract readable text from this document. The file may be blank, corrupted, password-protected, or in an unsupported format. Please try uploading a clearer image or a text-based PDF.');
    err.status = 400;
    throw err;
  }

  const analysis = await analyzeReportWithAI({
    extractedText,
    fileName: fileName || 'Uploaded Report',
    patientContext: patientContext || {},
    apiKey
  });

  return {
    success: true,
    fileName: fileName || 'Uploaded Report',
    analysisDate: new Date().toISOString(),
    extractedText,
    analysis
  };
}
