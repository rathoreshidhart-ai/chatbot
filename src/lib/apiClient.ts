import OpenAI from "openai";
import type { SendMessageParams, Message, APIError } from '../types';
import { getApiKey } from '../store/settingsStore';

function getClient() {
  return new OpenAI({
    apiKey: getApiKey(),
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true
  });
}

function handleAPIError(error: any): never {
  console.error("API Error encountered:", error);
  let status = error?.status || 500;
  let message = error?.message || 'Unknown error occurred.';
  let type: APIError['type'] = 'unknown';

  if (status === 401) {
    type = 'auth';
    message = 'Invalid API Key. Please check your environment variables.';
  } else if (status === 429) {
    type = 'rate_limit';
    message = 'Rate limit hit. Please slow down and try again.';
  } else if (status >= 500) {
    type = 'server';
    message = `API provider error (${status}): ${message}`;
  } else if (status === 404) {
    type = 'unknown';
    message = `Error (404): The requested model may not exist or is not available. Please check your model settings.`;
  } else {
    // For 400 or network errors where status might be undefined initially
    message = `Error (${status}): ${message}`;
  }

  throw { status, message, type } as APIError;
}

export async function* sendMessage(
  params: SendMessageParams,
  signal: AbortSignal
): AsyncGenerator<string> {
  const { model, messages, systemPrompt, stream, temperature = 0.7, maxTokens = 2048, topP = 1.0 } = params;

  if (!getApiKey()) {
    throw { status: 0, message: 'No API key configured. The admin must set VITE_GROQ_API_KEY in the .env file.', type: 'auth' } as APIError;
  }

  const client = getClient();

  // Format messages
  const formattedMessages: any[] = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  for (const msg of messages) {
    if (msg.role !== 'system') {
      formattedMessages.push({ role: msg.role, content: msg.content });
    }
  }

  try {
    if (!stream) {
      const response = await client.chat.completions.create({
        model,
        messages: formattedMessages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream: false
      }, { signal });
      yield response.choices[0]?.message?.content || '';
      return;
    }

    const streamResponse = await client.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: true
    }, { signal });

    for await (const chunk of streamResponse) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return;
    }
    handleAPIError(error);
  }
}

export async function testApiKey(): Promise<{ success: boolean; message: string }> {
  if (!getApiKey()) {
    return { success: false, message: 'No API key found in environment (VITE_GROQ_API_KEY).' };
  }
  try {
    const client = getClient();
    await client.models.list();
    return { success: true, message: 'API key is valid!' };
  } catch (err: any) {
    if (err?.status === 401) {
      return { success: false, message: 'Invalid API key' };
    }
    return { success: false, message: `Connection error: ${err.message}` };
  }
}
