/**
 * AI-powered post summarization using Google Gemini API
 * Note: Requires REACT_APP_GEMINI_API_KEY environment variable
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Summarize post content using Google Gemini
 * @param {string} title - Post title
 * @param {string} content - Post content/text
 * @returns {Promise<string>} Summarized text
 */
export async function summarizePost(title, content) {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured. Set REACT_APP_GEMINI_API_KEY environment variable.');
    return fallbackSummarize(title, content);
  }

  try {
    const fullText = `Title: ${title}\n\nContent: ${content}`;
    const prompt = `Please summarize the following Reddit post in 2-3 sentences. Keep it concise and capture the main idea:\n\n${fullText}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!summary) {
      throw new Error('No summary generated');
    }

    return summary;
  } catch (error) {
    console.error('Gemini summarization failed:', error);
    // Fall back to simple summary
    return fallbackSummarize(title, content);
  }
}

/**
 * Fallback summarization when API is not available
 */
function fallbackSummarize(title, content) {
  // Extract first 150 characters or first sentence
  const text = content || '';
  let summary = text.substring(0, 150);
  
  // Try to cut at sentence boundary
  const lastPeriod = summary.lastIndexOf('.');
  if (lastPeriod > 100) {
    summary = summary.substring(0, lastPeriod + 1);
  } else {
    summary += '...';
  }
  
  return `${title} — ${summary}`;
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiAvailable() {
  return !!GEMINI_API_KEY;
}

/**
 * Batch summarize multiple posts
 */
export async function summarizePosts(posts) {
  return Promise.all(
    posts.map(post =>
      summarizePost(post.title, post.textBody || post.content)
        .then(summary => ({ ...post, summary }))
        .catch(err => {
          console.error(`Failed to summarize post ${post.postId}:`, err);
          return { ...post, summary: post.textBody?.substring(0, 100) || 'No summary available' };
        })
    )
  );
}
