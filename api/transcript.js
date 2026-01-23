export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
    // Fetch the YouTube page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract captions track URL from the page
    const captionsRegex = /"captionTracks":(\[.*?\])/;
    const match = html.match(captionsRegex);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'No captions found for this video'
      });
    }
    
    const captionTracks = JSON.parse(match[1]);
    
    if (captionTracks.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No caption tracks available'
      });
    }
    
    // Get the first caption track URL
    const captionUrl = captionTracks[0].baseUrl;
    
    // Fetch the transcript XML
    const transcriptResponse = await fetch(captionUrl);
    const transcriptXml = await transcriptResponse.text();
    
    // Parse XML to extract text
    const textRegex = /<text[^>]*>(.*?)<\/text>/g;
    const texts = [];
    let textMatch;
    
    while ((textMatch = textRegex.exec(transcriptXml)) !== null) {
      // Decode HTML entities
      const text = textMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags
      
      texts.push(text);
    }
    
    const fullTranscript = texts.join(' ');
    
    return res.status(200).json({
      success: true,
      videoId: videoId,
      transcript: fullTranscript
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transcript'
    });
  }
}
