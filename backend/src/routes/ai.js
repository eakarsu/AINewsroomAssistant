const express = require('express');
const https = require('https');
const http = require('http');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openrouter');
const db = require('../models/db');

const router = express.Router();

// Helper: parse JSON from AI result text
function parseAIJson(text) {
  // Try to find JSON block
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch (_) {}
  }
  try { return JSON.parse(text); } catch (_) {}
  return { raw: text };
}

// Helper: persist to ai_analyses table
async function persistToAnalyses(endpoint, entityId, result) {
  try {
    await db.query(
      'INSERT INTO ai_analyses (endpoint, entity_id, result) VALUES ($1, $2, $3)',
      [endpoint, entityId || null, typeof result === 'string' ? result : JSON.stringify(result)]
    );
  } catch (err) {
    console.error('Failed to persist to ai_analyses:', err.message);
  }
}

// Apply rate limiter to all AI routes
router.use(auth, aiRateLimiter);

// AI: Analyze story lead
router.post('/analyze-lead', async (req, res) => {
  try {
    const { title, summary, source, id } = req.body;
    const systemPrompt = `You are an expert news editor AI assistant. Analyze the following story lead and provide:
1. **Newsworthiness Score** (1-10): Rate how newsworthy this story is
2. **Key Angles**: Identify 3-4 unique angles to pursue
3. **Target Audience**: Who would be most interested
4. **Recommended Sources**: Suggest 3-5 types of sources to contact
5. **Potential Impact**: Assess the potential societal impact
6. **Urgency Level**: How time-sensitive is this story
7. **Recommended Next Steps**: Actionable steps for the reporter

Format your response with clear headers and bullet points.`;

    const userMessage = `Story Lead: "${title}"\nSummary: ${summary}\nSource: ${source}`;
    const result = await callOpenRouter(systemPrompt, userMessage);

    if (result.success && id) {
      // Persist to story_leads row
      await db.query('UPDATE story_leads SET ai_analysis = $1 WHERE id = $2', [result.result, id]).catch(() => {});
      // Also persist to ai_analyses
      await persistToAnalyses('analyze-lead', id, result.result);
    } else if (result.success) {
      await persistToAnalyses('analyze-lead', null, result.result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Verify source
router.post('/verify-source', async (req, res) => {
  try {
    const { name, type, url, notes, id } = req.body;
    const systemPrompt = `You are a source verification specialist AI. Analyze the following source and provide:
1. **Credibility Assessment** (1-100): Rate the likely credibility
2. **Source Type Analysis**: Categorize the source type and reliability tier
3. **Red Flags**: Identify any potential concerns
4. **Verification Steps**: Recommend specific steps to verify this source
5. **Cross-Reference Suggestions**: Other sources to corroborate
6. **Historical Reliability**: Assessment of source type's track record
7. **Recommendation**: Overall recommendation for using this source

Format your response with clear headers and bullet points.`;

    const userMessage = `Source Name: "${name}"\nType: ${type}\nURL: ${url || 'N/A'}\nNotes: ${notes || 'N/A'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);

    if (result.success && id) {
      await db.query('UPDATE sources SET ai_analysis = $1 WHERE id = $2', [result.result, id]).catch(() => {});
      await persistToAnalyses('verify-source', id, result.result);
    } else if (result.success) {
      await persistToAnalyses('verify-source', null, result.result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Fact check
router.post('/fact-check', async (req, res) => {
  try {
    const { claim, source_article, evidence, id } = req.body;
    const systemPrompt = `You are an expert fact-checker AI. Analyze the following claim and respond ONLY with a JSON object in this exact format:
{
  "verdict": "TRUE|MOSTLY_TRUE|MIXED|MOSTLY_FALSE|FALSE|UNVERIFIABLE",
  "confidence": <number 1-100>,
  "analysis": "<detailed breakdown>",
  "supporting_evidence": ["<point>"],
  "contradicting_evidence": ["<point>"],
  "context": "<important context>",
  "methodology": "<verification steps>",
  "similar_claims": ["<claim>"]
}`;

    const userMessage = `Claim: "${claim}"\nSource Article: ${source_article || 'N/A'}\nExisting Evidence: ${evidence || 'N/A'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);

    if (result.success) {
      const parsed = parseAIJson(result.result);
      result.parsed = parsed;
      if (id) {
        const analysisText = typeof parsed === 'object' ? JSON.stringify(parsed) : result.result;
        await db.query('UPDATE fact_checks SET ai_analysis = $1 WHERE id = $2', [analysisText, id]).catch(() => {});
        await persistToAnalyses('fact-check', id, analysisText);
      } else {
        await persistToAnalyses('fact-check', null, result.result);
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Analyze bias
router.post('/analyze-bias', async (req, res) => {
  try {
    const { article_title, article_content, id } = req.body;
    const systemPrompt = `You are a media bias detection specialist AI. Analyze the following article and respond ONLY with a JSON object in this exact format:
{
  "bias_rating": "LEFT|CENTER-LEFT|CENTER|CENTER-RIGHT|RIGHT|UNBIASED",
  "bias_score": <number 1-10>,
  "bias_types": ["<type>"],
  "loaded_language": ["<word/phrase>"],
  "missing_perspectives": ["<viewpoint>"],
  "fairness_assessment": "<assessment>",
  "specific_examples": ["<quote>"],
  "improvement_suggestions": ["<suggestion>"]
}`;

    const userMessage = `Article Title: "${article_title}"\nArticle Content:\n${article_content}`;
    const result = await callOpenRouter(systemPrompt, userMessage);

    if (result.success) {
      const parsed = parseAIJson(result.result);
      result.parsed = parsed;
      if (id) {
        const analysisText = typeof parsed === 'object' ? JSON.stringify(parsed) : result.result;
        await db.query('UPDATE bias_reports SET ai_analysis = $1 WHERE id = $2', [analysisText, id]).catch(() => {});
        await persistToAnalyses('analyze-bias', id, analysisText);
      } else {
        await persistToAnalyses('analyze-bias', null, result.result);
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Deadline prioritization
router.post('/prioritize-deadlines', async (req, res) => {
  try {
    const { deadlines } = req.body;
    const systemPrompt = `You are a newsroom management AI specializing in deadline prioritization. Analyze these deadlines and provide:
1. **Priority Ranking**: Rank all deadlines by urgency and importance
2. **Time Management Tips**: Specific advice for each deadline
3. **Risk Assessment**: Which deadlines are at risk of being missed
4. **Resource Allocation**: How to distribute team effort
5. **Dependencies**: Any deadlines that depend on others
6. **Recommendations**: Overall workflow recommendations

Format your response with clear headers and bullet points.`;

    const userMessage = `Current Deadlines:\n${JSON.stringify(deadlines, null, 2)}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('prioritize-deadlines', null, result.result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Generate article draft
router.post('/generate-draft', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const systemPrompt = `You are a professional journalist and writing assistant AI. Based on the article draft provided, generate:
1. **Improved Headline**: A compelling, SEO-friendly headline
2. **Lead Paragraph**: A strong opening paragraph following the inverted pyramid
3. **Article Structure**: Recommended structure with section headings
4. **Key Quotes Needed**: Types of quotes to strengthen the story
5. **Data Points**: Statistics or data that should be included
6. **Closing Paragraph**: A strong conclusion
7. **SEO Keywords**: Top 5-8 keywords for online publishing
8. **Social Media Hooks**: 2-3 tweet-length teasers for the article

Format your response with clear headers and bullet points.`;

    const userMessage = `Title: "${title}"\nCategory: ${category || 'General'}\nDraft Content:\n${content || 'No draft content yet - please suggest a full structure.'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('generate-draft', null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Analyze trending topic
router.post('/analyze-trend', async (req, res) => {
  try {
    const { topic, category, keywords, volume } = req.body;
    const systemPrompt = `You are a trend analysis specialist AI for newsrooms. Analyze this trending topic and provide:
1. **Trend Assessment**: Why this topic is trending now
2. **Audience Interest** (1-10): Rate the public interest level
3. **Story Angles**: 4-5 unique story angles to pursue
4. **Key Stakeholders**: Who are the main players/voices
5. **Timeline**: Expected trajectory of this trend
6. **Competitive Analysis**: How other outlets are covering it
7. **Content Recommendations**: Best format (feature, breaking, analysis, etc.)
8. **Social Media Strategy**: How to leverage this trend online

Format your response with clear headers and bullet points.`;

    const userMessage = `Topic: "${topic}"\nCategory: ${category || 'General'}\nKeywords: ${keywords || 'N/A'}\nSearch Volume: ${volume || 'Unknown'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('analyze-trend', null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Generate interview questions
router.post('/generate-questions', async (req, res) => {
  try {
    const { subject_name, subject_role, topic, notes } = req.body;
    const systemPrompt = `You are an expert interview preparation AI for journalists. Generate comprehensive interview preparation including:
1. **Opening Questions**: 3 warm-up questions to build rapport
2. **Core Questions**: 8-10 substantive questions on the topic
3. **Follow-up Probes**: 5 probing follow-up questions for key areas
4. **Tough Questions**: 3 challenging but fair accountability questions
5. **Closing Questions**: 2 wrap-up questions
6. **Background Research**: Key facts the journalist should know
7. **Red Flags**: Things to watch for during the interview
8. **Interview Tips**: Specific advice for this type of interview

Format your response with clear headers and bullet points.`;

    const userMessage = `Subject: ${subject_name}\nRole: ${subject_role || 'N/A'}\nTopic: ${topic}\nNotes: ${notes || 'N/A'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('generate-questions', null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Analyze media asset
router.post('/analyze-media', async (req, res) => {
  try {
    const { title, type, description, source, article_title } = req.body;
    const systemPrompt = `You are a media asset management AI for newsrooms. Analyze this media asset and provide:
1. **Usage Assessment**: How this asset can best be used editorially
2. **Caption Suggestions**: 3 professional caption options
3. **Legal Considerations**: Copyright, licensing, or ethical concerns
4. **Alt Text**: Accessible alternative text description
5. **Placement Recommendations**: Where in the article to use this
6. **Related Assets Needed**: What other media would complement this
7. **Verification Notes**: Steps to verify authenticity if applicable
8. **Quality Assessment**: Professional quality evaluation

Format your response with clear headers and bullet points.`;

    const userMessage = `Asset Title: "${title}"\nType: ${type}\nDescription: ${description || 'N/A'}\nSource: ${source || 'N/A'}\nFor Article: ${article_title || 'N/A'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('analyze-media', null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Content strategy for editorial calendar
router.post('/content-strategy', async (req, res) => {
  try {
    const { entries } = req.body;
    const systemPrompt = `You are an editorial strategy AI. Analyze this content calendar and provide:
1. **Coverage Gaps**: Topics or sections that are underrepresented
2. **Content Balance**: Assessment of content type diversity
3. **Timing Optimization**: Suggestions for better publish timing
4. **Audience Engagement**: Which pieces will drive the most engagement
5. **Resource Allocation**: How to best distribute editorial resources
6. **Cross-Promotion**: Opportunities to link related content
7. **Seasonal Relevance**: Upcoming events/dates to plan for
8. **Strategic Recommendations**: Overall content strategy improvements

Format your response with clear headers and bullet points.`;

    const userMessage = `Editorial Calendar Entries:\n${JSON.stringify(entries, null, 2)}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('content-strategy', null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Headline optimizer - generates A/B headline variants
router.post('/optimize-headline', async (req, res) => {
  try {
    const { title, content, category, target_audience } = req.body;
    const systemPrompt = `You are a headline optimization expert AI for digital newsrooms. Generate A/B headline variants and analyze them. Respond ONLY with a JSON object:
{
  "headline_variants": [
    {
      "headline": "<text>",
      "type": "direct|question|listicle|how-to|emotional|seo",
      "click_score": <1-10>,
      "seo_score": <1-10>,
      "rationale": "<why this works>",
      "target_audience": "<who this appeals to>"
    }
  ],
  "winner_recommendation": "<which variant and why>",
  "seo_keywords": ["<keyword>"],
  "meta_description": "<155 char meta description>",
  "social_headline": "<shortened for social media>"
}`;
    const userMessage = `Original Headline: "${title}"\nArticle Category: ${category || 'General'}\nTarget Audience: ${target_audience || 'General public'}\nContent Summary: ${content ? content.substring(0, 500) : 'N/A'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) {
      const parsed = parseAIJson(result.result);
      result.parsed = parsed;
      await persistToAnalyses('optimize-headline', null, result.result);
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Story angle generator
router.post('/generate-angles', async (req, res) => {
  try {
    const { topic, context, audience, outlet_type } = req.body;
    const systemPrompt = `You are a story angle strategist AI for newsrooms. Generate unique and compelling story angles. Respond ONLY with a JSON object:
{
  "angles": [
    {
      "angle": "<title>",
      "approach": "<how to cover it>",
      "unique_hook": "<what makes it different>",
      "key_questions": ["<question>"],
      "sources_needed": ["<source type>"],
      "difficulty": "easy|medium|hard",
      "impact_score": <1-10>
    }
  ],
  "recommended_angle": "<which and why>",
  "timely_pegs": ["<news peg>"],
  "data_opportunities": ["<data angle>"]
}`;
    const userMessage = `Topic: "${topic}"\nContext: ${context || 'N/A'}\nTarget Audience: ${audience || 'General public'}\nOutlet Type: ${outlet_type || 'Digital news'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) {
      const parsed = parseAIJson(result.result);
      result.parsed = parsed;
      await persistToAnalyses('generate-angles', null, result.result);
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Readability scorer
router.post('/score-readability', async (req, res) => {
  try {
    const { content, title, target_grade_level } = req.body;
    const systemPrompt = `You are a readability analysis AI for journalism. Analyze the text and respond ONLY with a JSON object:
{
  "overall_score": <1-100>,
  "grade_level": "<grade level>",
  "flesch_kincaid_estimate": <score>,
  "avg_sentence_length": <words>,
  "avg_word_length": <chars>,
  "passive_voice_instances": <count>,
  "jargon_detected": ["<term>"],
  "complex_sentences": ["<excerpt>"],
  "strengths": ["<strength>"],
  "improvements": ["<suggestion>"],
  "simplified_alternatives": {"<original phrase>": "<simpler version>"},
  "verdict": "easy|moderate|complex|very complex"
}`;
    const userMessage = `Article Title: "${title || 'Untitled'}"\nTarget Grade Level: ${target_grade_level || 'Grade 8'}\n\nContent:\n${content || ''}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) {
      const parsed = parseAIJson(result.result);
      result.parsed = parsed;
      await persistToAnalyses('score-readability', null, result.result);
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Source credibility scorer
router.post('/score-source-credibility', async (req, res) => {
  try {
    const { source_name, source_type, url, track_record, context } = req.body;
    const systemPrompt = `You are a source credibility AI for investigative journalism. Score this source and respond ONLY with a JSON object:
{
  "credibility_score": <1-100>,
  "tier": "tier1|tier2|tier3|unreliable",
  "bias_assessment": "left|center-left|center|center-right|right|unknown",
  "reliability_factors": ["<factor>"],
  "risk_factors": ["<risk>"],
  "verification_requirements": ["<requirement>"],
  "cross_reference_sources": ["<suggested source>"],
  "use_with_conditions": ["<condition>"],
  "verdict": "high confidence|use with caution|avoid|needs verification"
}`;
    const userMessage = `Source Name: "${source_name}"\nSource Type: ${source_type || 'Unknown'}\nURL: ${url || 'N/A'}\nTrack Record Notes: ${track_record || 'N/A'}\nContext of Use: ${context || 'N/A'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) {
      const parsed = parseAIJson(result.result);
      result.parsed = parsed;
      await persistToAnalyses('score-source-credibility', null, result.result);
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI History endpoint - paginated list from ai_analyses
router.get('/history', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const countResult = await db.query('SELECT COUNT(*) FROM ai_analyses');
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      'SELECT * FROM ai_analyses ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Story competitive analysis
router.post('/story-competitive-analysis', async (req, res) => {
  try {
    const { topic, your_angle, competitor_coverage, deadline, id } = req.body || {};
    const systemPrompt = `You are a media-competitive-analysis specialist. Compare a story plan with rival outlets' coverage.`;
    const userMessage = `Topic: ${topic || ''}\nOur angle: ${your_angle || ''}\nCompetitor coverage (snippets/links): ${JSON.stringify(competitor_coverage || [])}\nDeadline: ${deadline || 'flexible'}\n\nProvide JSON only: { "differentiation_score": number, "unique_angles": [string], "gaps_in_competitor_coverage": [string], "must-have_quotes_or_data": [string], "risk_of_being_scooped": "low"|"medium"|"high", "recommended_publish_window": string }`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('story-competitive-analysis', id || null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Source matching
router.post('/source-matching', async (req, res) => {
  try {
    const { story_topic, expertise_needed, geography, language } = req.body || {};
    let sources = [];
    try {
      const r = await db.query('SELECT id, name, type, expertise, location, languages FROM sources LIMIT 80');
      sources = r.rows;
    } catch {}
    const systemPrompt = `You match journalists' stories to expert sources from a list. Return only JSON.`;
    const userMessage = `Story topic: ${story_topic || ''}\nExpertise needed: ${expertise_needed || ''}\nGeography: ${geography || 'any'}\nLanguage: ${language || 'any'}\nAvailable sources: ${JSON.stringify(sources).slice(0, 6000)}\n\nReturn JSON only: { "ranked_sources": [{"id": any, "name": string, "fit_score": number, "why": string, "interview_focus": [string]}], "outreach_template": string }`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('source-matching', null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Correction suggestion
router.post('/correction-suggestion', async (req, res) => {
  try {
    const { article_text, complaint, evidence, id } = req.body || {};
    if (!article_text) return res.status(400).json({ error: 'article_text required' });
    const systemPrompt = `You are an editorial standards expert. Recommend whether and how an article should be corrected, including correction language and disclosure type.`;
    const userMessage = `Article (excerpt): ${String(article_text).slice(0, 4000)}\nComplaint or issue: ${complaint || ''}\nEvidence: ${JSON.stringify(evidence || [])}\n\nReturn JSON only: { "correction_needed": boolean, "severity": "minor"|"material"|"retraction-worthy", "recommended_correction_text": string, "disclosure_type": "correction"|"clarification"|"editor's note"|"retraction"|"none", "publishing_steps": [string], "rationale": string }`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('correction-suggestion', id || null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Embargo management plan
router.post('/embargo-management', async (req, res) => {
  try {
    const { story_title, embargo_until, jurisdictions, distribution_partners, sensitivity, id } = req.body || {};
    if (!story_title) return res.status(400).json({ error: 'story_title required' });
    const systemPrompt = `You are a newsroom embargo and distribution coordinator. Build a precise embargo plan, with timezone-aware release schedule, partner notifications, and risk mitigations. Return JSON only.`;
    const userMessage = `Story: ${story_title}\nEmbargo until (ISO): ${embargo_until || 'unspecified'}\nJurisdictions: ${JSON.stringify(jurisdictions || [])}\nDistribution partners: ${JSON.stringify(distribution_partners || [])}\nSensitivity: ${sensitivity || 'standard'}\n\nReturn JSON only: { "embargo_plan_summary": string, "release_schedule": [{"timezone": string, "release_at_local": string, "release_at_utc": string, "channel": string}], "partner_notifications": [{"partner": string, "notify_at_utc": string, "method": "email"|"phone"|"signal"|"in-person", "talking_points": [string]}], "leak_risk_assessment": "low"|"medium"|"high", "leak_mitigations": [string], "stakeholder_briefing_order": [string], "post_embargo_followups": [string], "compliance_notes": [string] }`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('embargo-management', id || null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Accessibility - alt text + captions for media
router.post('/accessibility-altcaption', async (req, res) => {
  try {
    const { media_kind, media_description, headline, caption_lang, audience, id } = req.body || {};
    if (!media_description) return res.status(400).json({ error: 'media_description required' });
    const systemPrompt = `You are an accessibility editor. Produce WCAG-compliant alt text and captions for newsroom media. Be concise, factual, and avoid editorialising. Return JSON only.`;
    const userMessage = `Media kind: ${media_kind || 'image'}\nDescription supplied by reporter: ${String(media_description).slice(0, 3000)}\nAssociated headline: ${headline || ''}\nCaption language: ${caption_lang || 'en'}\nIntended audience: ${audience || 'general'}\n\nReturn JSON only: { "short_alt_text": string, "long_description": string, "decorative": boolean, "caption_options": [{"style": "factual"|"contextual"|"social", "text": string, "char_count": number}], "wcag_checks": {"meaningful_text_alt": "pass"|"fail"|"n/a", "no_redundant_alt": "pass"|"fail", "color_dependence_warning": boolean, "screen_reader_friendly": "pass"|"fail"}, "sensitive_content_flags": [string], "transcript_recommended": boolean, "audio_description_recommended": boolean }`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    if (result.success) await persistToAnalyses('accessibility-altcaption', id || null, result.result);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
