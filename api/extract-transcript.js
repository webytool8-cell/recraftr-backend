import { getTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Missing YouTube URL' });
    }

    const transcript = await getTranscript(url);
    const text = transcript.map(item => item.text).join(' ');

    res.status(200).json({ transcript: text });

  } catch (error) {
    res.status(500).json({
      error: 'Transcript unavailable or blocked'
    });
  }
}
