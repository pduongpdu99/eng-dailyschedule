// Basic English spell checker and grammar validator
// Common English words dictionary
const COMMON_WORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours',
  // Verbs
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did',
  'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would',
  'learn', 'learned', 'learning', 'improve', 'improved', 'improving',
  'today', 'improved', 'tomorrow', 'write', 'wrote', 'written',
  'understand', 'understood', 'know', 'knew', 'practice', 'practiced',
  'read', 'reading', 'speak', 'speaking', 'listen', 'listening',
  // Nouns
  'day', 'time', 'thing', 'way', 'work', 'life', 'year', 'man', 'woman', 'person',
  'english', 'grammar', 'vocabulary', 'skill', 'practice',
  // Prepositions
  'in', 'on', 'at', 'to', 'from', 'for', 'with', 'by', 'of', 'about', 'as',
  // Conjunctions
  'and', 'but', 'or', 'because', 'if', 'while', 'when', 'where',
  // Adjectives
  'good', 'bad', 'new', 'old', 'big', 'small', 'long', 'short', 'high', 'low',
  'happy', 'sad', 'easy', 'difficult', 'hard', 'simple', 'complex',
  // Common verbs/words
  'make', 'made', 'get', 'got', 'go', 'went', 'come', 'came', 'see', 'saw',
  'think', 'thought', 'know', 'knew', 'use', 'used', 'find', 'found',
  'help', 'helped', 'try', 'tried', 'need', 'needed', 'feel', 'felt',
  'take', 'took', 'put', 'give', 'gave', 'tell', 'told', 'ask', 'asked',
  'want', 'wanted', 'wish', 'hoped', 'hope', 'like', 'loved', 'love',
]);

export interface SpellCheckError {
  type: 'spelling' | 'grammar' | 'structure';
  message: string;
  word: string;
  position: number;
  severity: 'error' | 'warning';
}

export function checkSpelling(text: string): SpellCheckError[] {
  const errors: SpellCheckError[] = [];
  
  if (!text.trim()) {
    return errors;
  }

  // Check if text is in English (very basic check - contains English words)
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const englishWordCount = words.filter(word => COMMON_WORDS.has(word)).length;
  
  if (englishWordCount === 0 && words.length > 0) {
    errors.push({
      type: 'structure',
      message: 'Text does not appear to be in English',
      word: 'overall',
      position: 0,
      severity: 'error',
    });
  }

  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());

  let currentPosition = 0;

  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    // Check sentence structure
    const sentenceWords = trimmed.toLowerCase().match(/\b[a-z]+\b/g) || [];
    
    // Must start with capital letter
    const firstChar = trimmed.charAt(0);
    if (firstChar !== firstChar.toUpperCase() && firstChar.match(/[a-z]/)) {
      errors.push({
        type: 'structure',
        message: 'Sentence should start with a capital letter',
        word: trimmed.split(/\s+/)[0],
        position: currentPosition,
        severity: 'warning',
      });
    }

    // Check for common grammar issues
    const lowerSentence = trimmed.toLowerCase();
    
    // Check for double spaces
    if (lowerSentence.includes('  ')) {
      errors.push({
        type: 'grammar',
        message: 'Multiple spaces detected - use single space',
        word: 'spacing',
        position: currentPosition,
        severity: 'warning',
      });
    }

    // Check for articles
    const articlePattern = /\b(a|an)\s+([aeiou]|[bcdfghj-np-tv-z])/i;
    if (lowerSentence.match(articlePattern)) {
      const match = lowerSentence.match(/\ba\s+[aeiou]/i);
      if (match) {
        errors.push({
          type: 'grammar',
          message: 'Use "an" before vowel sounds, "a" before consonants',
          word: match[0],
          position: currentPosition + lowerSentence.indexOf(match[0]),
          severity: 'warning',
        });
      }
    }

    // Check for common misspellings and typos
    const commonMisspellings: Record<string, string> = {
      'recieve': 'receive',
      'occured': 'occurred',
      'seperate': 'separate',
      'untill': 'until',
      'wich': 'which',
      'teh': 'the',
      'taht': 'that',
      'thier': 'their',
      'beleive': 'believe',
      'acheive': 'achieve',
      'neccessary': 'necessary',
      'accomodate': 'accommodate',
      'dissapear': 'disappear',
      'explaination': 'explanation',
      'occassion': 'occasion',
    };

    Object.entries(commonMisspellings).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      let match;
      while ((match = regex.exec(lowerSentence)) !== null) {
        errors.push({
          type: 'spelling',
          message: `Did you mean "${correct}"?`,
          word: wrong,
          position: currentPosition + match.index,
          severity: 'error',
        });
      }
    });

    // Check for subject-verb agreement (basic)
    const verbPatterns = [
      { pattern: /\b(he|she|it)\s+(am|are)\b/i, correct: 'is' },
      { pattern: /\b(i)\s+(is|are)\b/i, correct: 'am' },
      { pattern: /\b(you|we|they)\s+(is|am)\b/i, correct: 'are' },
    ];

    verbPatterns.forEach(({ pattern, correct }) => {
      const match = trimmed.match(pattern);
      if (match) {
        errors.push({
          type: 'grammar',
          message: `Incorrect verb form - use "${correct}"`,
          word: match[0],
          position: currentPosition + trimmed.indexOf(match[0]),
          severity: 'error',
        });
      }
    });

    currentPosition += sentence.length + 1;
  });

  // Remove duplicate errors
  const uniqueErrors = Array.from(
    new Map(errors.map(e => [e.message + e.word, e])).values()
  );

  return uniqueErrors;
}
