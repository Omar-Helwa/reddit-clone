/**
 * AI-powered post summarization using Hugging Face Inference API
 * Model: google/pegasus-xsum (very short, concise summaries)
 * Routes through backend to avoid CORS issues
 */

const HF_API_TOKEN = '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';
const HF_MODEL = 'google/pegasus-xsum';

/**
 * Summarize post content using Hugging Face Pegasus-XSum
 * @param {string} title - Post title
 * @param {string} content - Post content/text
 * @param {number} retries - Number of retries for cold start
 * @returns {Promise<string>} Summarized text
 */
export async function summarizePost(title, content, retries = 3) {
  try {
    const fullText = `${title}. ${content || ''}`.trim();
    
    // If text is too short, just return it
    if (fullText.length < 100) {
      return fullText;
    }

    // Route through backend proxy to avoid CORS
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: fullText.substring(0, 1024),
        token: HF_API_TOKEN,
        model: HF_MODEL,
        parameters: {
          min_length: 30,
          max_length: 120,
        },
      }),
    });

    const result = await response.json();

    // Handle model loading (cold start)
    if (result.error && result.error.includes('loading') && retries > 0) {
      console.log('Model is loading, retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return summarizePost(title, content, retries - 1);
    }

    if (result.error) {
      throw new Error(result.error);
    }

    const summary = result.summary || result[0]?.summary_text || null;

    if (!summary) {
      throw new Error('No summary generated');
    }

    return summary.trim();
  } catch (error) {
    console.error('Hugging Face API error:', error);
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
 * Check if Hugging Face API is configured
 */
export function isGeminiAvailable() {
  return !!HF_API_TOKEN;
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
          return { ...post, summary: post.textBody?.substring(0, 100) || 'No summary available' };
        })
    )
  );
}
