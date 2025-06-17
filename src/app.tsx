import process from 'node:process';
import React, {useEffect, useState} from 'react';
import {Box, Text, useInput, useApp} from 'ink';
import TextInput from 'ink-text-input';

import {generateResponse, getCodeFromFile, parseArgs} from './ai.js';

type Message = {
	id: number;
	type: 'user' | 'assistant';
	content: string;
};

export default function App() {
	const options = parseArgs(process.argv);

	const {exit} = useApp();
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
    if (options.mode === "file") {
      const content = getCodeFromFile(options.filePath);
      runReview(content);
    } else if (options.mode === "diff") {
      runReview(options.diff);
    }
  }, []);

  const runReview = async (value: any) => {
    if (value.trim()) {
			const newUserMessage: Message = {
				id: messages.length + 1,
				type: 'user',
				content: value,
			};
			setMessages(prev => [...prev, newUserMessage]);
			setInput('');
setLoading(true);
			try {
				const response = await generateResponse(value);
				const assistantMessage: Message = {
					id: messages.length + 2,
					type: 'assistant',
					content: response,
				};
				setLoading(false);
				setMessages(prev => [...prev, assistantMessage]);
			} catch (error) {
				console.error('Error:', error);
			}
		}
  };

	useInput((_, key) => {
		if (key.escape) {
			exit();
		}
	});

	const handleSubmit = async (value: string) => {
		await runReview(value);
	};

	return (
		<Box flexDirection="column" height="100%">
			<Box borderStyle="round" borderColor="yellow" paddingX={1} paddingY={0}>
				<Box flexDirection="column" width="100%">
					<Box>
						<Text> Welcome to ChatBot! </Text>
						<Text bold>Agent</Text>
						<Text>!</Text>
					</Box>
					<Text> </Text>
					<Text dimColor>/help for help</Text>
					<Text> </Text>
					<Text dimColor>cwd: {process.cwd()}</Text>
				</Box>
			</Box>
			<Box padding={1}>
				<Text dimColor>What do you want to build today?..</Text>
			</Box>
			<Box flexDirection="column" flexGrow={1} paddingLeft={1} paddingTop={1}>
				{messages.map(message => (
					<Box key={message.id} marginBottom={1}>
						{message.type === 'assistant' ? (
							<Text>
								<Text color="yellow">❯ 🤖</Text> <pre>{message.content}</pre>
							</Text>
						) : (
							<Text dimColor>
								<Text>›</Text> {message.content}
							</Text>
						)}
					</Box>
				))}
				{loading && <Text color="yellow">🧠 Reviewing with Gemini...</Text>}
			</Box>

			<Box borderStyle="round" borderColor="gray" paddingLeft={1}>
				<Text color="cyan">› </Text>
				<TextInput
					placeholder="Type your query..."
					value={input}
					onChange={setInput}
					onSubmit={handleSubmit}
				/>
			</Box>
		</Box>
	);
}
