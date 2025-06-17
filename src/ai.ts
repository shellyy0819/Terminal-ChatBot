import {GoogleGenerativeAI} from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({path: path.join(__dirname, '../.env')});

export const CONFIG = {
	GOOGLE_API_KEY: process.env['GOOGLE_API_KEY'],
	MODEL: 'gemini-2.0-flash',
};

if (!CONFIG.GOOGLE_API_KEY) {
	throw new Error('GOOGLE_API_KEY environment variable is not set');
}

export const genAI = new GoogleGenerativeAI(CONFIG.GOOGLE_API_KEY);

const HISTORY_FILE = path.resolve(__dirname, './chat-history.json');
console.log("HISTORY_FILE",HISTORY_FILE)
const MAX_HISTORY = 20;

let history = fs.existsSync(HISTORY_FILE) ? fs.readJSONSync(HISTORY_FILE) : [];

let chatSession: any = null;

// Load saved history if available (only on app start)
export function loadHistory() {
	if (fs.existsSync(HISTORY_FILE)) {
		history = fs.readJSONSync(HISTORY_FILE).slice(-MAX_HISTORY);
	}
}

// Save history only when exiting
function saveHistory() {
	fs.writeJSONSync(HISTORY_FILE, history.slice(-MAX_HISTORY), {spaces: 2});
}

// Graceful shutdown logic
export function setupExitHandlers() {
  const saveAndLog = (reason: string) => {
    console.log(`\n💾 Saving chat history on ${reason}...`);
    try {
      saveHistory();
      console.log('✅ History saved.');
    } catch (err) {
      console.error('❌ Failed to save history:', err);
    }
  };

  process.on('exit', () => saveAndLog('exit'));
  process.on('SIGINT', () => {
    saveAndLog('SIGINT (Ctrl+C)');
    process.exit(0); // safe now
  });
  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    saveAndLog('uncaughtException');
    process.exit(1);
  });
}

loadHistory();
setupExitHandlers();

export async function generateResponse(prompt: string): Promise<string> {
	try {
    if (prompt.trim() === '/reset') {
      history = [];
      fs.removeSync(HISTORY_FILE);
      chatSession = null;
      return '🧼 Session reset.';
    }
		

		if (!chatSession) {
			const model = genAI.getGenerativeModel({model: CONFIG.MODEL});
			chatSession = model.startChat({history});
		}

		const finalPrompt = `You are a senior developer. Review the following code and suggest improvements, best practices, and identify any bugs:\n\n${prompt}`;

    // Update history with user input
		history.push({role: 'user', parts: finalPrompt});

		const result = await chatSession.sendMessage(finalPrompt);
		const responseText = result.response.text();

		// Update history with model response
		history.push({role: 'model', parts: responseText});

		// Save to disk
		// fs.writeJSONSync(HISTORY_FILE, history, {spaces: 2});

		return responseText;
	} catch (error) {
		console.error('Error generating response:', error);
		return 'Sorry, there was an error generating the response.';
	}
}

export function parseArgs(argv: any) {
  const args = argv.slice(2);
  const options: { mode?: string; filePath?: string; diff?: string } = {};

  if (args.includes('--file')) {
	const idx = args.indexOf('--file');
	options.mode = 'file';
	options.filePath = args[idx + 1];
  } else if (args.includes('--diff')) {
	const idx = args.indexOf('--diff');
	options.mode = 'diff';
	options.diff = args[idx + 1];
  } else {
	options.mode = 'prompt';
  }

  return options;
}

export function getCodeFromFile(path: any): string {
  if (!fs.existsSync(path)) {
	return `File not found: ${path}`;
	  }

  try {
    return fs.readFileSync(path, 'utf8');
  } catch (err: any) {
    return `Error reading file: ${err.message}`;
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
		},
	},
	clear: {
		name: 'clear',
		description: 'Clear conversation history',
		action: () => 'Conversation history cleared.',
	},
	exit: {
		name: 'exit',
		description: 'Exit the application',
		action: () => process.exit(0),
	},
	model: {
		name: 'model',
		description: 'Show current AI model',
		action: () => `Current model: ${CONFIG.MODEL} (Gemini)`,
	},
};
