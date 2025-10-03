/**
 * Convert markdown formatting to Slack formatting
 * 
 * IMPORTANT: Use ONLY Slack formatting, NOT markdown:
 * - Bold: *text* (not **text**)
 * - Italic: _text_ (not *text*)
 * - Links: <https://example.com|link text> (not [text](url))
 * - Code: `code`
 * - Lists: Use • for bullets
 * - Never use markdown syntax like **bold** or [text](url)
 */
export function convertMarkdownToSlack(text: string): string {
  if (!text) {
    return text;
  }

  // Convert markdown links [text](url) to Slack format <url|text>
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>');

  // Convert markdown bold **text** to Slack format *text*
  text = text.replace(/\*\*([^*]+)\*\*/g, '*$1*');

  // Convert markdown italic *text* to Slack format _text_ (but avoid conflicts with bold)
  // Only convert single asterisks that aren't part of Slack bold formatting
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '_$1_');

  return text;
}

/**
 * Add system prompt instructions for Slack formatting
 */
export const SLACK_FORMAT_INSTRUCTIONS = `
IMPORTANT: Use ONLY Slack formatting, NOT markdown:
- Bold: *text* (not **text**)
- Italic: _text_ (not *text*)
- Links: <https://example.com|link text> (not [text](url))
- Code: \`code\`
- Lists: Use • for bullets
- Never use markdown syntax like **bold** or [text](url)
`;

