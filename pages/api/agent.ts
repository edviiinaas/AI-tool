import type { NextApiRequest, NextApiResponse } from 'next'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }
  try {
    const { messages, agentConfig, files, context } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing or invalid messages' })
    }
    // Compose system prompt with file and context
    let systemPrompt = agentConfig?.systemPrompt || ''
    if (files && Array.isArray(files) && files.length > 0) {
      const fileContext = files.map((f: any, i: number) => `File #${i+1} Text: ${f.extractedText || ''}`).join('\n')
      systemPrompt += `\n\nContext from uploaded files:\n${fileContext}`
    }
    if (context && typeof context === 'object' && Object.keys(context).length > 0) {
      const contextSummary = Object.entries(context).map(([agent, output]) => `From ${agent}: ${typeof output === 'string' ? output : JSON.stringify(output)}`).join('\n')
      systemPrompt += `\n\nContext from previous agents:\n${contextSummary}`
    }
    const openaiMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages
    ]
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: agentConfig?.model || 'gpt-4o',
        messages: openaiMessages,
        temperature: agentConfig?.temperature || 0.7,
        max_tokens: agentConfig?.maxTokens || 1024
      })
    })
    if (!response.ok) {
      const error = await response.json()
      return res.status(response.status).json({ error })
    }
    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
} 