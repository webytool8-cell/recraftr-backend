import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, format } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Missing content' });
  }

  const prompt = `
You are an AI content restructuring assistant.

Restructure the following content into:
${format}

Preserve meaning. Optimize for clarity and platform conventions.

Content:
${content}
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    });

    res.status(200).json({
      result: response.content[0].text
    });

  } catch (error) {
    res.status(500).json({ error: 'AI processing failed' });
  }
}
