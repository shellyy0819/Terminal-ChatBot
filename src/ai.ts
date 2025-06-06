import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({path: path.join(__dirname, '../.env')});

export const CONFIG = {
  GOOGLE_API_KEY: process.env['GOOGLE_API_KEY'],
  MODEL: 'gemini-2.0-flash'
};

if (!CONFIG.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is not set');
}

export const genAI = new GoogleGenerativeAI(CONFIG.GOOGLE_API_KEY);

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    return 'Sorry, there was an error generating the response.';
  }
}

export type Command = {
  name: string;
  description: string;
  action: (args?: string) => Promise<string> | string;
};

export const commands: Record<string, Command> = {
  help: {
    name: 'help',
    description: 'Show available commands',
    action: () => {
      return Object.values(commands)
        .map(cmd => `/${cmd.name} - ${cmd.description}`)
        .join('\n');
    }
  },
  clear: {
    name: 'clear',
    description: 'Clear conversation history',
    action: () => 'Conversation history cleared.'
  },
  exit: {
    name: 'exit',
    description: 'Exit the application',
    action: () => process.exit(0)
  },
  model: {
    name: 'model',
    description: 'Show current AI model',
    action: () => `Current model: ${CONFIG.MODEL} (Gemini)`
  }
};