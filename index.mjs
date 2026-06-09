import { streamText } from 'ai'

const result = streamText({
  model: 'openai/gpt-3.5-turbo',
  prompt: 'Explain quantum computing in simple terms.',
})

for await (const chunk of result.textStream) {
  process.stdout.write(chunk)
}
