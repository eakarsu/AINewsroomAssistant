const express = require('express');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');

const router = express.Router();

// AI: Analyze story lead
router.post('/analyze-lead', auth, async (req, res) => {
  try {
    const { title, summary, source } = req.body;
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
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Verify source
router.post('/verify-source', auth, async (req, res) => {
  try {
    const { name, type, url, notes } = req.body;
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
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Fact check
router.post('/fact-check', auth, async (req, res) => {
  try {
    const { claim, source_article, evidence } = req.body;
    const systemPrompt = `You are an expert fact-checker AI. Analyze the following claim and provide:
1. **Verdict**: TRUE / MOSTLY TRUE / MIXED / MOSTLY FALSE / FALSE / UNVERIFIABLE
2. **Confidence Level** (1-100): How confident are you in this assessment
3. **Analysis**: Detailed breakdown of the claim
4. **Supporting Evidence**: What supports this claim
5. **Contradicting Evidence**: What contradicts this claim
6. **Context**: Important context that affects interpretation
7. **Methodology**: How you would recommend verifying this claim
8. **Similar Claims**: Related claims that have been fact-checked

Format your response with clear headers and bullet points.`;

    const userMessage = `Claim: "${claim}"\nSource Article: ${source_article || 'N/A'}\nExisting Evidence: ${evidence || 'N/A'}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Analyze bias
router.post('/analyze-bias', auth, async (req, res) => {
  try {
    const { article_title, article_content } = req.body;
    const systemPrompt = `You are a media bias detection specialist AI. Analyze the following article for bias and provide:
1. **Overall Bias Rating**: LEFT / CENTER-LEFT / CENTER / CENTER-RIGHT / RIGHT / UNBIASED
2. **Bias Score** (1-10, where 1=no bias, 10=extreme bias)
3. **Types of Bias Detected**: List each type found (confirmation, selection, framing, etc.)
4. **Loaded Language**: Identify emotionally charged or loaded words/phrases
5. **Missing Perspectives**: Viewpoints not represented
6. **Fairness Assessment**: How balanced is the coverage
7. **Specific Examples**: Quote specific sentences showing bias
8. **Improvement Suggestions**: How to make the article more balanced

Format your response with clear headers and bullet points.`;

    const userMessage = `Article Title: "${article_title}"\nArticle Content:\n${article_content}`;
    const result = await callOpenRouter(systemPrompt, userMessage);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Deadline prioritization
router.post('/prioritize-deadlines', auth, async (req, res) => {
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
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI: Generate article draft
router.post('/generate-draft', auth, async (req, res) => {
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
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Analyze trending topic
router.post('/analyze-trend', auth, async (req, res) => {
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
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Generate interview questions
router.post('/generate-questions', auth, async (req, res) => {
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
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Analyze media asset
router.post('/analyze-media', auth, async (req, res) => {
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
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI: Content strategy for editorial calendar
router.post('/content-strategy', auth, async (req, res) => {
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
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
