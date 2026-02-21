import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export type TaskType = 'summarize' | 'analyze' | 'rewrite' | 'extract' | 'custom';

export const TASKS = [
  { id: 'summarize', label: 'Summarize', prompt: 'Summarize the following text concisely, highlighting the key points.' },
  { id: 'analyze', label: 'Analyze', prompt: 'Analyze the following text for sentiment, tone, and main themes.' },
  { id: 'rewrite', label: 'Rewrite', prompt: 'Rewrite the following text to be more professional and clear.' },
  { id: 'extract', label: 'Extract Data', prompt: 'Extract any structured data (names, dates, numbers, lists) from the following text and format it as a table or list.' },
  { id: 'custom', label: 'Custom', prompt: '' },
] as const;

export async function processText(text: string, taskType: TaskType, customPrompt?: string) {
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const task = TASKS.find(t => t.id === taskType);
  const systemInstruction = taskType === 'custom' ? customPrompt : task?.prompt;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: text,
    config: {
      systemInstruction: systemInstruction || "Process the following text.",
    },
  });

  return response.text || "No response generated.";
}
