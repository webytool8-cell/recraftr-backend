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

    // --- Extract video ID robustly ---
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([0-9A-Za-z_-]{11})/
    );
    if (!match || !match[1]) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    const videoId = match[1];

    // --- Fetch transcript ---
    let transcriptArray;
    try {
      transcriptArray = await getTranscript(videoId);
    } catch (err) {
      console.error('YouTube transcript fetch error:', err.message);
      return res.status(404).json({
        error: 'Transcript not found or unavailable for this video',
        details: err.message
      });
    }

    if (!transcriptArray || transcriptArray.length === 0) {
      return res.status(404).json({ error: 'Transcript not found or unavailable' });
    }

    // --- Convert transcript array to plain text ---
    const transcript = transcriptArray.map(t => t.text).join(' ');

    res.status(200).json({ transcript });

  } catch (err) {
    console.error('Backend fetch error:', err);
    res.status(500).json({ error: 'YouTube Backend Error', details: err.message });
  }
}
