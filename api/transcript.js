import { Innertube } from 'youtubei.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ 
      success: false,
      error: 'videoId parameter is required' 
    });
  }

  try {
    const youtube = await Innertube.create();
    const info = await youtube.getInfo(videoId);
    
    const transcriptData = await info.getTranscript();
    
    if (!transcriptData || !transcriptData.transcript) {
      return res.status(404).json({
        success: false,
        error: 'No transcript available for this video'
      });
    }

    const fullText = transcriptData.transcript.content.body.initial_segments
      .map(segment => segment.snippet.text)
      .join(' ');
    
    return res.status(200).json({
      success: true,
      videoId: videoId,
      transcript: fullText
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transcript'
    });
  }
}
