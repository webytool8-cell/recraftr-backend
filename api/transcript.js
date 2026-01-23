export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId parameter is required' });
  }

  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map(item => item.text).join(' ');
    
    return res.status(200).json({
      success: true,
      videoId: videoId,
      transcript: fullText
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transcript'
    });
  }
}
