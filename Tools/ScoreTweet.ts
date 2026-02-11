#!/usr/bin/env bun

/**
 * XPoster Quality Scoring Tool
 *
 * Deterministic scoring for X post quality assessment.
 * Four gates: Quality Score, Human Authenticity, Engagement Potential, Platform Compliance.
 *
 * Usage:
 *   bun run Tools/ScoreTweet.ts "Your tweet"
 *   bun run Tools/ScoreTweet.ts --file path/to/tweet.json
 */

// ============================================================================
// Types
// ============================================================================

interface QualityScore {
  total: number;
  passed: boolean;
  breakdown: {
    base: number;
    additions: number;
    deductions: number;
    details: ScoreDetail[];
  };
  humanAuthenticity: {
    score: number;
    passed: boolean;
    elements: string[];
  };
  engagementPotential: {
    average: number;
    passed: boolean;
    metrics: Record<string, number>;
  };
  platformCompliance: {
    passed: boolean;
    issues: string[];
  };
  recommendations: string[];
}

interface ScoreDetail {
  criterion: string;
  points: number;
  reason: string;
}

// ============================================================================
// AI Pattern Detection
// ============================================================================

const AI_PATTERNS = [
  /let's dive into/i,
  /let's explore/i,
  /in today's digital landscape/i,
  /it's worth noting/i,
  /interestingly,/i,
  /notably,/i,
  /here's what i learned/i,
  /unpopular opinion but/i,
  /🧵\s*thread/i,
  /thread\s*🧵/i,
  /^1\//,
  /in conclusion,/i,
  /to summarize,/i,
  /the bottom line is/i,
  /at the end of the day/i,
  /it goes without saying/i,
  /needless to say/i,
  /as we all know/i,
  /it's no secret that/i,
];

const HUMAN_PATTERNS = {
  midThoughtStart: /^(been thinking|wondering|noticed|realized|honestly|actually|okay so|so i)/i,
  uncertainty: /(still figuring|not sure|might be wrong|i think|maybe|probably|could be)/i,
  specificDetails: /\b(back in|last (week|month|year)|yesterday|this morning|in (january|february|march|april|may|june|july|august|september|october|november|december))/i,
  contractions: /\b(i'm|don't|can't|won't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|didn't|wouldn't|couldn't|shouldn't|i've|you've|we've|they've|i'll|you'll|we'll|they'll|i'd|you'd|we'd|they'd)\b/i,
  emotionalReaction: /(love|hate|frustrated|excited|surprised|confused|annoyed|amazed|blown away|mind-blown)/i,
  struggle: /(struggled|failed|messed up|screwed up|took forever|wasted|lost)/i,
  question: /\?$/,
  personalPronoun: /^(i |my |we )/i,
  admitsConfusion: /(confus|don't understand|no idea|lost me|over my head)/i,
};

// ============================================================================
// Scoring Functions
// ============================================================================

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function hasAllCaps(text: string): boolean {
  const words = text.split(/\s+/);
  const commonAbbreviations = ['AI', 'API', 'UI', 'UX', 'CSS', 'HTML', 'JS', 'TS', 'SQL', 'AWS', 'GCP', 'CLI', 'SDK', 'IDE', 'TDD', 'GPT', 'LLM'];

  for (const word of words) {
    const cleanWord = word.replace(/[^A-Za-z]/g, '');
    if (cleanWord.length >= 3 &&
        cleanWord === cleanWord.toUpperCase() &&
        !commonAbbreviations.includes(cleanWord)) {
      return true;
    }
  }
  return false;
}

function hasLink(text: string): boolean {
  return /https?:\/\/|www\./i.test(text);
}

function hasOffensiveContent(text: string): boolean {
  const offensivePatterns = [
    /\bf+u+c+k/i,
    /\bs+h+i+t/i,
    /\ba+s+s+h+o+l+e/i,
  ];
  return offensivePatterns.some(p => p.test(text));
}

function detectAIPatterns(text: string): string[] {
  const found: string[] = [];
  for (const pattern of AI_PATTERNS) {
    if (pattern.test(text)) {
      found.push(pattern.source);
    }
  }
  return found;
}

function detectHumanElements(text: string): string[] {
  const elements: string[] = [];

  if (HUMAN_PATTERNS.midThoughtStart.test(text)) elements.push('mid-thought start');
  if (HUMAN_PATTERNS.uncertainty.test(text)) elements.push('shows uncertainty');
  if (HUMAN_PATTERNS.specificDetails.test(text)) elements.push('specific time/date details');
  if (HUMAN_PATTERNS.contractions.test(text)) elements.push('natural contractions');
  if (HUMAN_PATTERNS.emotionalReaction.test(text)) elements.push('emotional reaction');
  if (HUMAN_PATTERNS.struggle.test(text)) elements.push('references struggle/failure');
  if (HUMAN_PATTERNS.question.test(text)) elements.push('ends with question');
  if (HUMAN_PATTERNS.personalPronoun.test(text)) elements.push('personal start');
  if (HUMAN_PATTERNS.admitsConfusion.test(text)) elements.push('admits confusion');

  if (/^[a-z]/.test(text)) elements.push('informal capitalization');

  return elements;
}

function hasWhiteSpace(text: string): boolean {
  return text.includes('\n\n') || text.includes('\n');
}

function isDiscussionStarter(text: string): boolean {
  return /\?$/.test(text.trim()) ||
         /(what do you think|anyone else|thoughts\??|agree\??|disagree\??)$/i.test(text.trim());
}

function isPracticalActionable(text: string): boolean {
  return /\b(tip|trick|how to|step|tool|app|feature|setting|config|command)\b/i.test(text) ||
         /\b\d+%|\d+ (hours?|minutes?|days?|times?)\b/i.test(text);
}

function hasPersonalExperience(text: string): boolean {
  return /\b(i (tried|tested|used|built|made|found|discovered|learned|realized)|my (experience|project|workflow|team))\b/i.test(text);
}

function isNaturalVoice(text: string): boolean {
  const humanElements = detectHumanElements(text);
  const aiPatterns = detectAIPatterns(text);
  return humanElements.length >= 2 && aiPatterns.length === 0;
}

// ============================================================================
// Main Scoring Function
// ============================================================================

export function scoreTweet(text: string): QualityScore {
  const details: ScoreDetail[] = [];
  let additions = 0;
  let deductions = 0;

  const wordCount = countWords(text);
  const charCount = text.length;
  const sentenceCount = countSentences(text);

  // Additions
  if (wordCount >= 40) {
    additions += 10;
    details.push({ criterion: 'word_count', points: 10, reason: `${wordCount} words (>=40 required)` });
  }

  if (isDiscussionStarter(text)) {
    additions += 10;
    details.push({ criterion: 'discussion_starter', points: 10, reason: 'Ends with question or open prompt' });
  }

  if (isPracticalActionable(text)) {
    additions += 10;
    details.push({ criterion: 'practical_actionable', points: 10, reason: 'Contains actionable insight or specific details' });
  }

  if (hasPersonalExperience(text)) {
    additions += 10;
    details.push({ criterion: 'personal_experience', points: 10, reason: 'Includes personal experience' });
  }

  if (isNaturalVoice(text)) {
    additions += 10;
    details.push({ criterion: 'natural_voice', points: 10, reason: 'Natural human voice detected' });
  }

  if (hasWhiteSpace(text)) {
    additions += 5;
    details.push({ criterion: 'white_space', points: 5, reason: 'Good use of white space' });
  }

  const humanElements = detectHumanElements(text);
  if (humanElements.length >= 3) {
    additions += 5;
    details.push({ criterion: 'platform_native', points: 5, reason: 'Platform-native language patterns' });
  }

  if (HUMAN_PATTERNS.emotionalReaction.test(text)) {
    additions += 5;
    details.push({ criterion: 'shows_emotion', points: 5, reason: 'Shows genuine emotion' });
  }

  // Deductions
  if (hasLink(text)) {
    deductions += 20;
    details.push({ criterion: 'has_link', points: -20, reason: 'Contains link (penalized by algorithm)' });
  }

  if (hasAllCaps(text)) {
    deductions += 30;
    details.push({ criterion: 'all_caps', points: -30, reason: 'Contains ALL CAPS words' });
  }

  if (hasOffensiveContent(text)) {
    deductions += 50;
    details.push({ criterion: 'offensive', points: -50, reason: 'Contains potentially offensive content' });
  }

  const aiPatterns = detectAIPatterns(text);
  if (aiPatterns.length > 0) {
    deductions += 20;
    details.push({ criterion: 'ai_patterns', points: -20, reason: `AI patterns detected: ${aiPatterns.slice(0, 3).join(', ')}` });
  }

  if (wordCount < 40) {
    deductions += 5;
    details.push({ criterion: 'under_40_words', points: -5, reason: `Only ${wordCount} words (need >=40)` });
  }

  if (/🧵|thread|^1\//i.test(text)) {
    deductions += 10;
    details.push({ criterion: 'thread_format', points: -10, reason: 'Thread format detected (not allowed)' });
  }

  // Calculate Total
  const base = 50;
  const total = Math.max(0, Math.min(100, base + additions - deductions));

  // Human Authenticity
  const humanAuthenticityScore = humanElements.length;
  const humanAuthenticityPassed = humanAuthenticityScore >= 3;

  // Engagement Potential
  const engagementMetrics = {
    quotes: isDiscussionStarter(text) ? 4 : 2,
    bookmarks: isPracticalActionable(text) ? 4 : 2,
    replies: HUMAN_PATTERNS.question.test(text) ? 5 : 3,
    reposts: hasPersonalExperience(text) ? 4 : 2,
    dwell_time: wordCount >= 50 ? 4 : wordCount >= 40 ? 3 : 2,
  };

  const engagementAverage = Object.values(engagementMetrics).reduce((a, b) => a + b, 0) / 5;
  const engagementPassed = engagementAverage >= 3.0;

  // Platform Compliance
  const platformIssues: string[] = [];
  if (wordCount > 280) platformIssues.push(`Word count ${wordCount} exceeds 280`);
  if (sentenceCount > 15) platformIssues.push(`Sentence count ${sentenceCount} exceeds 15`);
  if (hasAllCaps(text)) platformIssues.push('Contains ALL CAPS');
  if (hasLink(text)) platformIssues.push('Contains link');
  if (hasOffensiveContent(text)) platformIssues.push('Contains offensive content');
  if (/🧵|thread/i.test(text)) platformIssues.push('Thread format not allowed');

  const platformPassed = platformIssues.length === 0;

  // Recommendations
  const recommendations: string[] = [];

  if (total < 70) {
    if (wordCount < 40) recommendations.push('Increase word count to 40+ for algorithm dwell time');
    if (!isDiscussionStarter(text)) recommendations.push('Add a question or open prompt to encourage replies');
    if (!hasPersonalExperience(text)) recommendations.push('Include personal experience for authenticity');
    if (aiPatterns.length > 0) recommendations.push('Remove AI-sounding phrases: ' + aiPatterns.join(', '));
  }

  if (!humanAuthenticityPassed) {
    recommendations.push('Add more human elements: uncertainty, specific details, contractions');
  }

  if (!engagementPassed) {
    recommendations.push('Improve engagement potential: add practical value or controversy');
  }

  return {
    total,
    passed: total >= 70 && humanAuthenticityPassed && engagementPassed && platformPassed,
    breakdown: {
      base,
      additions,
      deductions,
      details,
    },
    humanAuthenticity: {
      score: humanAuthenticityScore,
      passed: humanAuthenticityPassed,
      elements: humanElements,
    },
    engagementPotential: {
      average: Math.round(engagementAverage * 10) / 10,
      passed: engagementPassed,
      metrics: engagementMetrics,
    },
    platformCompliance: {
      passed: platformPassed,
      issues: platformIssues,
    },
    recommendations,
  };
}

// ============================================================================
// CLI Interface
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
XPoster Quality Scoring Tool

Usage:
  bun run Tools/ScoreTweet.ts "Your tweet content here"
  bun run Tools/ScoreTweet.ts --file path/to/tweet.json

Examples:
  bun run Tools/ScoreTweet.ts "Been thinking about AI debugging lately..."
  bun run Tools/ScoreTweet.ts --file OUTPUT/ready/my-tweet.json
`);
    process.exit(0);
  }

  let text: string;

  if (args[0] === '--file') {
    const filePath = args[1];
    if (!filePath) {
      console.error('Error: --file requires a path argument');
      process.exit(1);
    }

    try {
      const file = Bun.file(filePath);
      const content = await file.json();
      text = content.content?.text || content.text || '';
    } catch (e) {
      console.error(`Error reading file: ${e}`);
      process.exit(1);
    }
  } else {
    text = args.join(' ');
  }

  if (!text) {
    console.error('Error: No tweet content provided');
    process.exit(1);
  }

  const result = scoreTweet(text);

  console.log('\n========================================');
  console.log('X-POSTER QUALITY SCORE');
  console.log('========================================\n');

  console.log(`TOTAL SCORE: ${result.total}/100 ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Base: ${result.breakdown.base}`);
  console.log(`  Additions: +${result.breakdown.additions}`);
  console.log(`  Deductions: -${result.breakdown.deductions}`);
  console.log('');

  console.log('BREAKDOWN:');
  for (const detail of result.breakdown.details) {
    const sign = detail.points > 0 ? '+' : '';
    console.log(`  ${sign}${detail.points}: ${detail.reason}`);
  }
  console.log('');

  console.log(`HUMAN AUTHENTICITY: ${result.humanAuthenticity.score}/10 ${result.humanAuthenticity.passed ? '✅' : '❌'}`);
  console.log(`  Elements: ${result.humanAuthenticity.elements.join(', ') || 'none detected'}`);
  console.log('');

  console.log(`ENGAGEMENT POTENTIAL: ${result.engagementPotential.average}/5.0 ${result.engagementPotential.passed ? '✅' : '❌'}`);
  for (const [metric, score] of Object.entries(result.engagementPotential.metrics)) {
    console.log(`  ${metric}: ${score}/5`);
  }
  console.log('');

  console.log(`PLATFORM COMPLIANCE: ${result.platformCompliance.passed ? '✅ PASSED' : '❌ FAILED'}`);
  if (result.platformCompliance.issues.length > 0) {
    for (const issue of result.platformCompliance.issues) {
      console.log(`  ❌ ${issue}`);
    }
  }
  console.log('');

  if (result.recommendations.length > 0) {
    console.log('RECOMMENDATIONS:');
    for (const rec of result.recommendations) {
      console.log(`  → ${rec}`);
    }
  }

  console.log('\n========================================\n');

  process.exit(result.passed ? 0 : 1);
}

if (import.meta.main) {
  main();
}
