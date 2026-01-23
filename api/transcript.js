export default async function handler(req, res) {
  // Enable CORS
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
    // Dynamic import of youtube-transcript
    const { YoutubeTranscript } = await import('youtube-transcript');
    
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No transcript found for this video'
      });
    }
    
    // Combine all transcript segments
    const fullText = transcript.map(item => item.text).join(' ');
    
    return res.status(200).json({
      success: true,
      videoId: videoId,
      transcript: fullText,
      segments: transcript
    });
  } catch (error) {
    console.error('Transcript error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transcript',
      details: error.toString()
    });
  }
}
```

### After updating both files:

Wait for Vercel to redeploy, then test:
```
https://youtube-transcript-api-6lsn.vercel.app/api/transcript?videoId=ZQ7QDWGfRNc
