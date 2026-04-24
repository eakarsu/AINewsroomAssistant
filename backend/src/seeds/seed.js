const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ai_newsroom',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  const client = await pool.connect();
  try {
    // Drop and recreate tables
    await client.query(`
      DROP TABLE IF EXISTS expenses CASCADE;
      DROP TABLE IF EXISTS notes CASCADE;
      DROP TABLE IF EXISTS contacts CASCADE;
      DROP TABLE IF EXISTS editorial_calendar CASCADE;
      DROP TABLE IF EXISTS media_assets CASCADE;
      DROP TABLE IF EXISTS interviews CASCADE;
      DROP TABLE IF EXISTS trending_topics CASCADE;
      DROP TABLE IF EXISTS article_drafts CASCADE;
      DROP TABLE IF EXISTS bias_reports CASCADE;
      DROP TABLE IF EXISTS deadlines CASCADE;
      DROP TABLE IF EXISTS fact_checks CASCADE;
      DROP TABLE IF EXISTS sources CASCADE;
      DROP TABLE IF EXISTS story_leads CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'reporter',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE story_leads (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        source VARCHAR(255),
        category VARCHAR(100),
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'new',
        summary TEXT,
        data_feed VARCHAR(255),
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        credibility_score INTEGER DEFAULT 50,
        url VARCHAR(500),
        contact_info VARCHAR(500),
        verification_status VARCHAR(50) DEFAULT 'pending',
        ai_assessment TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE fact_checks (
        id SERIAL PRIMARY KEY,
        claim TEXT NOT NULL,
        source_article VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending',
        verdict VARCHAR(50) DEFAULT 'unverified',
        evidence TEXT,
        ai_analysis TEXT,
        checked_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE deadlines (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        article_title VARCHAR(500),
        priority VARCHAR(20) DEFAULT 'medium',
        due_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        assigned_to VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE bias_reports (
        id SERIAL PRIMARY KEY,
        article_title VARCHAR(500) NOT NULL,
        article_content TEXT,
        bias_type VARCHAR(100),
        severity VARCHAR(20) DEFAULT 'low',
        ai_analysis TEXT,
        suggestions TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE article_drafts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'draft',
        author VARCHAR(255),
        word_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE trending_topics (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(500) NOT NULL,
        category VARCHAR(100),
        trend_score INTEGER DEFAULT 50,
        volume INTEGER DEFAULT 0,
        sentiment VARCHAR(50) DEFAULT 'neutral',
        region VARCHAR(100) DEFAULT 'Global',
        keywords TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE interviews (
        id SERIAL PRIMARY KEY,
        subject_name VARCHAR(255) NOT NULL,
        subject_role VARCHAR(255),
        topic VARCHAR(500),
        scheduled_date TIMESTAMP,
        duration_minutes INTEGER DEFAULT 30,
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'scheduled',
        reporter VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE media_assets (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        type VARCHAR(50) DEFAULT 'photo',
        source VARCHAR(255),
        description TEXT,
        article_title VARCHAR(500),
        photographer VARCHAR(255),
        location VARCHAR(255),
        license VARCHAR(50) DEFAULT 'unknown',
        status VARCHAR(50) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE editorial_calendar (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        section VARCHAR(100),
        publish_date TIMESTAMP,
        content_type VARCHAR(50) DEFAULT 'article',
        assigned_to VARCHAR(255),
        status VARCHAR(50) DEFAULT 'planned',
        priority VARCHAR(20) DEFAULT 'medium',
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        organization VARCHAR(255),
        role VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        category VARCHAR(50) DEFAULT 'general',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        category VARCHAR(50) DEFAULT 'general',
        related_story VARCHAR(500),
        pinned BOOLEAN DEFAULT FALSE,
        author VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE expenses (
        id SERIAL PRIMARY KEY,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(10,2) DEFAULT 0,
        category VARCHAR(50) DEFAULT 'other',
        expense_date DATE,
        related_story VARCHAR(500),
        reporter VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        receipt_ref VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed users
    const passwordHash = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, name, role) VALUES
      ('editor@newsroom.com', '${passwordHash}', 'Sarah Chen', 'editor'),
      ('reporter@newsroom.com', '${passwordHash}', 'James Wilson', 'reporter'),
      ('admin@newsroom.com', '${passwordHash}', 'Maria Rodriguez', 'admin');
    `);

    // Seed story leads (15 items)
    await client.query(`
      INSERT INTO story_leads (title, source, category, priority, status, summary, data_feed) VALUES
      ('Tech Giants Face New Antitrust Regulations in EU', 'Reuters Wire', 'Technology', 'high', 'investigating', 'European Commission announces sweeping new regulations targeting major tech companies including Apple, Google, and Meta. The Digital Markets Act enforcement begins next quarter.', 'Reuters API'),
      ('Climate Summit Yields Breakthrough Agreement', 'AP News', 'Environment', 'high', 'assigned', 'World leaders at COP30 reach unprecedented agreement on carbon emission targets, with binding commitments from all G20 nations for the first time.', 'AP Wire'),
      ('Local Hospital System Reports Data Breach', 'Anonymous Tip', 'Healthcare', 'critical', 'new', 'Major healthcare system serving 2 million patients reports unauthorized access to patient records. Investigation reveals breach lasted 6 months.', 'Email Tip'),
      ('Housing Market Shows Signs of Recovery', 'Federal Reserve Data', 'Economy', 'medium', 'investigating', 'New housing starts increase 15% quarter-over-quarter, suggesting the market correction may be ending. Mortgage rates trending downward.', 'Fed API'),
      ('School District Implements AI Tutoring Program', 'Press Release', 'Education', 'medium', 'new', 'Largest school district in the state rolls out AI-powered tutoring platform for 50,000 students, with early results showing 20% improvement in test scores.', 'Press Release'),
      ('New Study Links Microplastics to Health Risks', 'Nature Journal', 'Science', 'high', 'assigned', 'Landmark study published in Nature finds direct correlation between microplastic exposure and cardiovascular disease risk in humans.', 'Academic Feed'),
      ('City Council Approves Controversial Zoning Changes', 'City Hall Reporter', 'Local Government', 'medium', 'investigating', 'City council votes 7-4 to approve mixed-use zoning in residential neighborhoods, sparking protests from homeowner associations.', 'Local Beat'),
      ('Major Airline Announces Fleet Electrification Plan', 'Company Filing', 'Transportation', 'medium', 'new', 'Delta Airlines commits $10B to electric aircraft development, plans to have 30% electric fleet by 2035.', 'SEC Filing'),
      ('Cybersecurity Firm Discovers Zero-Day Vulnerability', 'Security Advisory', 'Technology', 'critical', 'assigned', 'Critical zero-day vulnerability found in widely-used enterprise software affecting 500,000+ organizations globally.', 'CERT Feed'),
      ('Immigration Reform Bill Advances in Senate', 'Congressional Record', 'Politics', 'high', 'investigating', 'Bipartisan immigration bill clears Senate committee with 14-8 vote, includes pathway for skilled workers and border security funding.', 'Congress.gov'),
      ('Startup Raises $500M for Fusion Energy Research', 'TechCrunch', 'Energy', 'medium', 'new', 'Silicon Valley startup secures largest-ever private funding round for fusion energy, claiming commercial viability within 5 years.', 'VC Wire'),
      ('Water Crisis Deepens in Southwest Regions', 'USGS Data', 'Environment', 'high', 'assigned', 'Lake Mead reaches historic low levels, triggering emergency water rationing for 40 million residents across three states.', 'USGS API'),
      ('Professional Athletes Union Demands Revenue Sharing Reform', 'Sports Wire', 'Sports', 'low', 'new', 'Players union files formal complaint demanding restructuring of revenue sharing model, threatening lockout before next season.', 'ESPN Wire'),
      ('FDA Approves Revolutionary Cancer Treatment', 'FDA Announcement', 'Healthcare', 'high', 'assigned', 'New CAR-T cell therapy receives fast-track approval for treatment of aggressive lymphomas, showing 85% remission rate in trials.', 'FDA Feed'),
      ('International Space Station Crew Reports Equipment Failure', 'NASA', 'Science', 'critical', 'investigating', 'ISS crew reports failure of primary life support system. Backup systems engaged. NASA schedules emergency supply mission.', 'NASA Feed');
    `);

    // Seed sources (15 items)
    await client.query(`
      INSERT INTO sources (name, type, credibility_score, url, contact_info, verification_status, notes) VALUES
      ('Reuters News Agency', 'Wire Service', 95, 'https://www.reuters.com', 'press@reuters.com', 'verified', 'Tier 1 international wire service, highly reliable for breaking news'),
      ('Dr. Emily Watson - MIT', 'Academic Expert', 88, 'https://mit.edu/ewatson', 'ewatson@mit.edu', 'verified', 'Leading climate researcher, frequently cited in peer-reviewed journals'),
      ('Anonymous Government Insider', 'Confidential Source', 45, NULL, 'Secure drop #2847', 'pending', 'Claims to be senior official at EPA. Information partially corroborated.'),
      ('City Hall Press Office', 'Government PR', 72, 'https://city.gov/press', 'press@city.gov', 'verified', 'Official government communications, may be politically filtered'),
      ('TechWatch Blog', 'Online Media', 55, 'https://techwatch.io', 'tips@techwatch.io', 'pending', 'Independent tech blog, good for scoops but occasionally inaccurate'),
      ('FBI Public Affairs', 'Law Enforcement', 80, 'https://fbi.gov/news', 'publicaffairs@fbi.gov', 'verified', 'Official FBI communications, reliable but limited in scope'),
      ('Dr. James Park - WHO', 'International Organization', 90, 'https://who.int', 'parkj@who.int', 'verified', 'WHO epidemiologist, authoritative on global health matters'),
      ('Wall Street Insider Forum', 'Social Media', 30, 'https://reddit.com/r/wallstreet', NULL, 'unverified', 'Anonymous forum, high noise-to-signal ratio but occasional valuable leads'),
      ('Sarah Mitchell - Whistleblower', 'Whistleblower', 65, NULL, 'Via attorney: legalcounsel@law.com', 'under_review', 'Former VP at MegaCorp, provided documents under legal protection'),
      ('Associated Press', 'Wire Service', 96, 'https://apnews.com', 'info@ap.org', 'verified', 'Tier 1 wire service, gold standard for factual reporting'),
      ('Local Police Scanner', 'Public Records', 60, NULL, 'Broadcastify Channel 4421', 'verified', 'Real-time police communications, useful for breaking local news'),
      ('Congressional Budget Office', 'Government Agency', 92, 'https://cbo.gov', 'communications@cbo.gov', 'verified', 'Non-partisan federal agency, highly reliable for fiscal analysis'),
      ('GreenPeace Research Division', 'NGO', 58, 'https://greenpeace.org/research', 'research@greenpeace.org', 'verified', 'Environmental advocacy group, data is accurate but framing may be biased'),
      ('Prof. Lisa Chang - Stanford Law', 'Legal Expert', 85, 'https://law.stanford.edu/lchang', 'lchang@stanford.edu', 'verified', 'Constitutional law expert, frequently consulted by major outlets'),
      ('Industry Trade Group - PharmaCo Alliance', 'Industry Group', 40, 'https://pharmacoalliance.org', 'media@pharmacoalliance.org', 'verified', 'Pharmaceutical industry lobby group, data skewed toward industry interests');
    `);

    // Seed fact checks (15 items)
    await client.query(`
      INSERT INTO fact_checks (claim, source_article, status, verdict, evidence, checked_by) VALUES
      ('Global temperatures have risen 1.5°C since pre-industrial era', 'Climate Report 2026', 'completed', 'true', 'IPCC AR7 confirms global mean temperature increase of 1.48°C as of 2025, within margin of 1.5°C threshold.', 'Sarah Chen'),
      ('New vaccine is 99% effective against all COVID variants', 'Social Media Post', 'completed', 'mostly_false', 'Clinical trials show 78% efficacy against dominant variants, not 99%. No vaccine covers all variants.', 'James Wilson'),
      ('City unemployment rate dropped to 3.2%', 'Mayor Press Conference', 'completed', 'mostly_true', 'BLS data shows 3.4% unemployment, not 3.2%. Close but slightly understated by mayor.', 'Sarah Chen'),
      ('Tech company laid off 10,000 employees', 'Industry Blog', 'in_progress', 'unverified', 'Company confirmed layoffs but has not disclosed exact numbers. SEC filing pending.', 'Maria Rodriguez'),
      ('New drug cures Type 2 diabetes in 90% of patients', 'Press Release', 'completed', 'mostly_false', 'Phase 2 trial showed improvement in 60% of patients, not cure. 90% figure refers to blood sugar improvement, not cure.', 'James Wilson'),
      ('Senator voted against veterans benefits 5 times', 'Political Ad', 'completed', 'mixed', 'Senator voted against 3 specific veterans bills but supported 2 others. Context of amendments matters.', 'Sarah Chen'),
      ('Electric vehicles produce more lifetime emissions than gas cars', 'Opinion Column', 'completed', 'false', 'Multiple lifecycle analyses show EVs produce 50-70% fewer lifetime emissions even accounting for battery production.', 'Maria Rodriguez'),
      ('Local school test scores improved 30% after new curriculum', 'School Board Report', 'in_progress', 'unverified', 'Preliminary data shows improvement but methodology of measurement changed, making direct comparison difficult.', 'James Wilson'),
      ('Housing prices will drop 20% by end of year', 'Real Estate Blog', 'completed', 'unverified', 'Prediction based on limited data. Most economists forecast 5-10% correction, not 20%.', 'Sarah Chen'),
      ('New bridge construction is $500M over budget', 'Watchdog Report', 'completed', 'true', 'Government audit confirms $487M in cost overruns, effectively confirming the $500M claim within reasonable rounding.', 'Maria Rodriguez'),
      ('Company CEO earned 500x average worker salary', 'Union Flyer', 'completed', 'mostly_true', 'SEC filings show CEO compensation at 478x median employee salary. Close to claimed ratio.', 'James Wilson'),
      ('Wildfire was caused by power company negligence', 'Lawsuit Filing', 'in_progress', 'unverified', 'Investigation ongoing. Power company equipment found near origin point but causation not yet established.', 'Sarah Chen'),
      ('New trade agreement will create 1 million jobs', 'Government Press Release', 'completed', 'mixed', 'Independent economic models estimate 400K-700K net new jobs, not 1 million. Depends heavily on implementation.', 'Maria Rodriguez'),
      ('Water contamination levels exceed EPA standards by 10x', 'Environmental Group Report', 'completed', 'true', 'Independent lab tests confirm PFAS levels at 12x EPA maximum contaminant level in affected water supply.', 'James Wilson'),
      ('AI will replace 40% of jobs within 5 years', 'Tech Conference Keynote', 'completed', 'mostly_false', 'McKinsey and WEF studies suggest 15-20% of tasks (not jobs) may be automated in 5 years. Job displacement estimates much lower.', 'Sarah Chen');
    `);

    // Seed deadlines (15 items)
    await client.query(`
      INSERT INTO deadlines (title, description, article_title, priority, due_date, status, assigned_to) VALUES
      ('Morning Edition Feature', 'Complete 2000-word feature on tech regulation for morning edition', 'Tech Giants Face New EU Regulations', 'critical', '2026-03-21 06:00:00', 'in_progress', 'Sarah Chen'),
      ('Climate Summit Coverage', 'File daily coverage from climate summit including expert interviews', 'COP30 Summit Day 3 Coverage', 'high', '2026-03-22 18:00:00', 'in_progress', 'James Wilson'),
      ('Data Breach Investigation', 'Complete FOIA requests and source interviews for hospital breach story', 'Hospital Data Breach Exposé', 'critical', '2026-03-23 12:00:00', 'pending', 'Maria Rodriguez'),
      ('Housing Market Analysis', 'Compile quarterly housing data and expert commentary', 'Q1 Housing Market Report', 'medium', '2026-03-25 17:00:00', 'pending', 'Sarah Chen'),
      ('Education Series Part 3', 'Third installment of AI in education series', 'AI Tutoring: Promise and Peril', 'medium', '2026-03-26 09:00:00', 'not_started', 'James Wilson'),
      ('Weekend Magazine Piece', 'Long-form piece on microplastics research for weekend magazine', 'The Invisible Threat in Our Water', 'high', '2026-03-28 15:00:00', 'in_progress', 'Maria Rodriguez'),
      ('City Council Follow-up', 'Reaction piece from affected neighborhoods on zoning changes', 'Neighborhoods React to Zoning Overhaul', 'medium', '2026-03-24 10:00:00', 'pending', 'Sarah Chen'),
      ('Aviation Industry Spotlight', 'Analysis of airline electrification feasibility', 'Can Airlines Really Go Electric?', 'low', '2026-03-30 17:00:00', 'not_started', 'James Wilson'),
      ('Cybersecurity Alert Brief', 'Breaking news brief on zero-day vulnerability', 'Critical Software Vulnerability Discovered', 'critical', '2026-03-20 14:00:00', 'in_progress', 'Maria Rodriguez'),
      ('Immigration Bill Explainer', 'Comprehensive explainer on immigration reform provisions', 'What the Immigration Bill Means for You', 'high', '2026-03-24 09:00:00', 'pending', 'Sarah Chen'),
      ('Fusion Energy Deep Dive', 'Technical analysis with expert interviews on fusion startup', 'The Race to Commercial Fusion', 'medium', '2026-03-29 17:00:00', 'not_started', 'James Wilson'),
      ('Water Crisis Update', 'Daily update on water levels and rationing measures', 'Southwest Water Emergency: Day 15', 'high', '2026-03-21 08:00:00', 'in_progress', 'Maria Rodriguez'),
      ('Sports Labor Dispute', 'Background piece on revenue sharing in professional sports', 'The Money Game: Athletes vs Owners', 'low', '2026-04-01 17:00:00', 'not_started', 'Sarah Chen'),
      ('Cancer Treatment Breakthrough', 'Science desk coverage of FDA approval with patient stories', 'New Hope: Revolutionary Cancer Therapy Approved', 'high', '2026-03-22 12:00:00', 'pending', 'James Wilson'),
      ('Space Station Emergency', 'Continuous coverage of ISS situation with NASA updates', 'ISS Crisis: Life Support Failure', 'critical', '2026-03-20 16:00:00', 'in_progress', 'Maria Rodriguez');
    `);

    // Seed bias reports (15 items)
    await client.query(`
      INSERT INTO bias_reports (article_title, article_content, bias_type, severity, suggestions, status) VALUES
      ('Government Wastes Millions on Failed Program', 'The incompetent bureaucrats at the Department of Energy have thrown away $50 million of taxpayer money on a solar program that predictably failed...', 'framing', 'high', 'Replace loaded language like "incompetent bureaucrats" and "thrown away." Present facts about program outcomes neutrally.', 'reviewed'),
      ('Tech Billionaire Saves Local Community', 'Visionary tech mogul John Smith heroically stepped in to save the struggling community center, proving once again that private enterprise succeeds where government fails...', 'selection', 'medium', 'Include context about public funding history. Remove hero narrative framing. Present as straight news.', 'reviewed'),
      ('Immigration Surge Threatens Local Jobs', 'A flood of immigrants is pouring into the region, threatening to overwhelm local services and steal jobs from hardworking Americans...', 'framing', 'critical', 'Replace dehumanizing language ("flood," "pouring"). Present economic data objectively. Include immigrant perspectives.', 'flagged'),
      ('Study Shows Organic Food is Healthier', 'A groundbreaking new study proves once and for all that organic food is significantly healthier than conventional produce...', 'confirmation', 'medium', 'Note study limitations. Include counter-studies. Change "proves" to "suggests." Mention funding sources.', 'reviewed'),
      ('Police Officer Involved in Shooting Incident', 'An officer-involved shooting occurred Tuesday when police responded to a disturbance call...', 'framing', 'medium', 'Use active voice to clarify who shot whom. Include victim background equally with officer background.', 'pending'),
      ('Union Boss Demands Higher Wages', 'Union boss threatened to shut down operations unless management caves to unreasonable wage demands...', 'framing', 'high', 'Replace "boss" with "leader." Remove "caves" and "unreasonable." Present both sides positions equally.', 'reviewed'),
      ('Young Entrepreneur Disrupts Traditional Industry', 'The brilliant 25-year-old founder is disrupting the outdated insurance industry with her revolutionary app...', 'selection', 'low', 'Balance enthusiasm with industry perspective. Include challenges and competition. Remove age bias framing.', 'pending'),
      ('Crime Wave Hits Downtown Area', 'A shocking crime wave has gripped the downtown area, leaving residents terrified and businesses fleeing...', 'framing', 'high', 'Present crime statistics in context of long-term trends. Remove emotional language. Include multiple perspectives.', 'flagged'),
      ('Conservative Judge Blocks Progressive Policy', 'A far-right judge appointed by the previous administration blocked the popular new environmental regulation...', 'political', 'high', 'Remove political characterizations from judicial coverage. Present legal reasoning. Note appointment context neutrally.', 'reviewed'),
      ('Miracle Drug Shows Promise in Trials', 'Scientists have discovered what could be a miracle cure for the disease that affects millions...', 'sensationalism', 'medium', 'Avoid "miracle" claims. Present trial results with proper statistical context. Note trial phase and limitations.', 'pending'),
      ('Small Business Owner Struggles Under New Regulations', 'Hardworking small business owner Mary Johnson is being crushed under the weight of burdensome new regulations...', 'framing', 'medium', 'Present regulation impact data broadly. Include perspectives from supporters. Remove emotional narrative framing.', 'reviewed'),
      ('Foreign Company Takes Over American Brand', 'Another beloved American brand has fallen to foreign takeover as Company X acquires the 100-year-old institution...', 'nationalism', 'medium', 'Remove nationalistic framing. Present acquisition facts neutrally. Include business rationale and stakeholder views.', 'pending'),
      ('Students Protest University Decision', 'Radical student activists disrupted campus operations by staging an unauthorized protest...', 'framing', 'high', 'Replace "radical" and "disrupted." Note protest as protected speech. Include student and administration perspectives equally.', 'flagged'),
      ('New Housing Development Divides Community', 'The controversial development project, pushed through by well-connected developers, threatens the character of the historic neighborhood...', 'selection', 'medium', 'Present both pro-development and preservation viewpoints. Remove implication of corruption without evidence.', 'reviewed'),
      ('Healthcare Costs Continue to Rise', 'Greedy insurance companies and overpaid hospital executives continue to drive healthcare costs through the roof while ordinary families suffer...', 'framing', 'high', 'Remove characterizations like "greedy" and "overpaid." Present cost data objectively. Include industry perspective on cost drivers.', 'flagged');
    `);

    // Seed article drafts (15 items)
    await client.query(`
      INSERT INTO article_drafts (title, content, category, status, author, word_count) VALUES
      ('The Future of Remote Work in 2026', 'As companies worldwide continue to adapt to hybrid models, the landscape of remote work is evolving rapidly. New technologies, shifting employee expectations, and changing corporate policies are reshaping how we think about the workplace...', 'Business', 'draft', 'Sarah Chen', 850),
      ('Inside the Race for Quantum Computing Supremacy', 'The quantum computing race has intensified with three major breakthroughs in the past quarter alone. IBM, Google, and a surprising Chinese startup are pushing the boundaries of what quantum processors can achieve...', 'Technology', 'in_review', 'James Wilson', 2100),
      ('Climate Migration: The Invisible Crisis', 'Millions of people are being displaced by climate change each year, yet this growing crisis receives a fraction of the attention given to other forms of migration. In coastal Bangladesh alone...', 'Environment', 'published', 'Maria Rodriguez', 3200),
      ('The Hidden Cost of Fast Fashion Returns', 'When consumers return clothing purchased online, most assume the items will be resold. The reality is far more wasteful. An investigation reveals that up to 40% of returned fast fashion items end up in landfills...', 'Business', 'draft', 'Sarah Chen', 1500),
      ('How AI is Transforming Emergency Medicine', 'In emergency rooms across the country, artificial intelligence is quietly revolutionizing how doctors diagnose and treat patients. From predicting cardiac arrests to identifying strokes...', 'Healthcare', 'in_review', 'James Wilson', 2800),
      ('The Rise of Urban Farming in Food Deserts', 'In neighborhoods where fresh produce is scarce, a new generation of urban farmers is using innovative techniques to bring healthy food to their communities...', 'Local', 'draft', 'Maria Rodriguez', 1200),
      ('Cybersecurity Threats Facing Small Businesses', 'While major corporations invest millions in cybersecurity, small businesses remain dangerously vulnerable. A new study reveals that 60% of small businesses that suffer a cyber attack close within six months...', 'Technology', 'published', 'Sarah Chen', 1800),
      ('The Student Debt Crisis: A Generation Under Pressure', 'With total student loan debt exceeding $1.8 trillion, an entire generation is making life decisions based on their debt burden. From delayed homeownership to lower birth rates...', 'Economy', 'in_review', 'James Wilson', 2500),
      ('Breakthrough in Alzheimer''s Research Offers New Hope', 'A team of researchers at Johns Hopkins has identified a new biomarker that could allow early detection of Alzheimer''s disease up to 15 years before symptoms appear...', 'Science', 'draft', 'Maria Rodriguez', 950),
      ('The Dark Side of Social Media Influencer Culture', 'Behind the curated posts and sponsored content lies a troubling ecosystem of exploitation, mental health challenges, and deceptive marketing practices targeting vulnerable audiences...', 'Culture', 'draft', 'Sarah Chen', 2200),
      ('Infrastructure Bill: Where the Money Goes', 'As billions of dollars begin flowing to states and municipalities, questions arise about transparency, allocation priorities, and whether the spending will reach the communities that need it most...', 'Politics', 'published', 'James Wilson', 3000),
      ('The Opioid Settlement: Promise vs Reality', 'Two years after landmark opioid settlements totaling $26 billion, affected communities are beginning to see funds arrive. But the distribution has been uneven and controversial...', 'Healthcare', 'in_review', 'Maria Rodriguez', 2700),
      ('Electric Vehicle Charging: The Bottleneck Problem', 'Despite surging EV sales, the charging infrastructure is struggling to keep pace. Long waits, broken chargers, and inadequate rural coverage threaten to slow the electric revolution...', 'Transportation', 'draft', 'Sarah Chen', 1600),
      ('Food Safety in the Age of Global Supply Chains', 'Recent outbreaks have exposed vulnerabilities in our global food supply chain. From contaminated spices to mislabeled seafood, the system designed to keep food safe is showing cracks...', 'Health', 'draft', 'James Wilson', 1100),
      ('The Teachers Leaving the Profession', 'A national survey reveals that teacher resignations have reached a 20-year high, with burnout, low pay, and political pressures cited as primary factors driving educators away...', 'Education', 'in_review', 'Maria Rodriguez', 2400);
    `);

    // Seed trending topics (15 items)
    await client.query(`
      INSERT INTO trending_topics (topic, category, trend_score, volume, sentiment, region, keywords, status) VALUES
      ('AI Regulation Debate', 'Technology', 95, 2500000, 'mixed', 'Global', 'artificial intelligence, regulation, safety, governance, AI act', 'active'),
      ('Climate Summit Outcomes', 'Environment', 88, 1800000, 'positive', 'Global', 'climate change, COP30, emissions, carbon, sustainability', 'active'),
      ('Housing Affordability Crisis', 'Economy', 92, 2100000, 'negative', 'North America', 'housing, affordability, mortgage, rent, real estate', 'active'),
      ('Space Tourism Expansion', 'Science', 65, 890000, 'positive', 'Global', 'space, tourism, SpaceX, Blue Origin, commercial space', 'active'),
      ('Cryptocurrency Market Recovery', 'Finance', 78, 1500000, 'positive', 'Global', 'bitcoin, crypto, blockchain, digital currency, DeFi', 'active'),
      ('Mental Health in Schools', 'Education', 82, 1200000, 'negative', 'North America', 'mental health, students, anxiety, depression, school counseling', 'active'),
      ('Autonomous Vehicle Accidents', 'Technology', 71, 950000, 'negative', 'US', 'self-driving, autonomous, Tesla, Waymo, safety', 'active'),
      ('Global Food Price Inflation', 'Economy', 85, 1600000, 'negative', 'Global', 'food prices, inflation, agriculture, supply chain, hunger', 'active'),
      ('Renewable Energy Milestones', 'Energy', 74, 780000, 'positive', 'Europe', 'solar, wind, renewable, clean energy, grid', 'active'),
      ('Social Media Youth Safety', 'Technology', 90, 2200000, 'negative', 'Global', 'social media, children, safety, regulation, mental health', 'active'),
      ('Election Security Concerns', 'Politics', 87, 1900000, 'mixed', 'US', 'election, security, voting, disinformation, democracy', 'active'),
      ('Antibiotic Resistance Threat', 'Health', 58, 450000, 'negative', 'Global', 'antibiotics, resistance, superbugs, WHO, AMR', 'declining'),
      ('Remote Work Policy Shifts', 'Business', 69, 820000, 'mixed', 'Global', 'remote work, hybrid, office, WFH, return to office', 'declining'),
      ('Nuclear Energy Renaissance', 'Energy', 63, 560000, 'positive', 'Global', 'nuclear, SMR, fusion, clean energy, baseload', 'active'),
      ('Teacher Shortage Crisis', 'Education', 76, 680000, 'negative', 'US', 'teachers, shortage, education, schools, staffing', 'active');
    `);

    // Seed interviews (15 items)
    await client.query(`
      INSERT INTO interviews (subject_name, subject_role, topic, scheduled_date, duration_minutes, location, status, reporter, notes) VALUES
      ('Dr. Emily Watson', 'MIT Climate Researcher', 'Climate Summit Implications', '2026-03-22 10:00:00', 45, 'Zoom', 'confirmed', 'Sarah Chen', 'Leading author on latest IPCC report. Prepare questions on carbon capture technology.'),
      ('Sen. Michael Torres', 'Senate Commerce Committee Chair', 'Tech Regulation Bill', '2026-03-23 14:00:00', 30, 'Capitol Hill Office', 'scheduled', 'James Wilson', 'Key sponsor of the AI Safety Act. Focus on enforcement mechanisms.'),
      ('Lisa Park', 'CEO of NexGen Health', 'Hospital Data Breach Response', '2026-03-21 11:00:00', 60, 'Phone', 'confirmed', 'Maria Rodriguez', 'Company is under investigation. Legal counsel will be present. Record with permission.'),
      ('Chief Robert Hayes', 'City Police Chief', 'Crime Statistics Update', '2026-03-24 09:00:00', 30, 'Police HQ', 'scheduled', 'Sarah Chen', 'Quarterly briefing. Prepare questions on downtown crime trends.'),
      ('Dr. Aisha Patel', 'WHO Epidemiologist', 'New Disease Outbreak Monitoring', '2026-03-25 08:00:00', 45, 'Video Call', 'confirmed', 'James Wilson', 'Expert on emerging infectious diseases. Ask about surveillance systems.'),
      ('Mark Stevens', 'Housing Coalition Director', 'Affordable Housing Crisis', '2026-03-22 15:00:00', 40, 'Coalition Office', 'completed', 'Maria Rodriguez', 'Completed. Great quotes on policy failures. Follow up needed on data.'),
      ('Prof. Angela Morris', 'Stanford AI Ethics Lab', 'AI Bias in Hiring', '2026-03-26 13:00:00', 50, 'Zoom', 'scheduled', 'Sarah Chen', 'Published landmark study on algorithmic bias. Technical background needed.'),
      ('James Kowalski', 'Union President - Auto Workers', 'Labor Dispute at MegaMotors', '2026-03-23 16:00:00', 35, 'Union Hall', 'confirmed', 'James Wilson', 'Strike vote pending. Sensitive - off-record portions expected.'),
      ('Mayor Diana Chen', 'City Mayor', 'Infrastructure Budget Announcement', '2026-03-24 11:00:00', 25, 'City Hall Press Room', 'scheduled', 'Maria Rodriguez', 'Major announcement expected. Coordinate with photographer.'),
      ('Dr. Thomas Wright', 'FDA Commissioner', 'New Drug Approval Process', '2026-03-27 10:00:00', 30, 'FDA Headquarters', 'scheduled', 'Sarah Chen', 'Focus on expedited review for cancer therapies. Background briefing first.'),
      ('Elena Vasquez', 'Whistleblower - Energy Sector', 'Environmental Violations', '2026-03-21 18:00:00', 90, 'Undisclosed Location', 'confirmed', 'James Wilson', 'HIGHLY CONFIDENTIAL. Source protection paramount. Encrypted communication only.'),
      ('Coach Williams', 'NFL Team Head Coach', 'Revenue Sharing Dispute', '2026-03-28 12:00:00', 20, 'Stadium Press Room', 'scheduled', 'Maria Rodriguez', 'Brief availability. Focus on player perspective on revenue split.'),
      ('Sarah Kim', 'Tech Startup Founder', 'AI in Education', '2026-03-25 14:00:00', 40, 'Company Office', 'confirmed', 'Sarah Chen', 'Her startup just raised $50M. Discuss equity concerns in AI tutoring.'),
      ('Gen. Patricia Moore', 'Retired Pentagon Advisor', 'National Security and AI', '2026-03-29 09:00:00', 45, 'Think Tank DC', 'scheduled', 'James Wilson', 'Expert on military AI applications. Some topics may be restricted.'),
      ('David Okonkwo', 'Community Organizer', 'Zoning Change Impact', '2026-03-22 17:00:00', 35, 'Community Center', 'completed', 'Maria Rodriguez', 'Completed. Strong community voice. Organize neighborhood follow-up.');
    `);

    // Seed media assets (15 items)
    await client.query(`
      INSERT INTO media_assets (title, type, source, description, article_title, photographer, location, license, status) VALUES
      ('Climate Summit Group Photo', 'photo', 'AP Images', 'World leaders gathered for the official COP30 group photograph on the summit steps', 'Climate Summit Yields Breakthrough Agreement', 'Jean-Pierre Moreau', 'Geneva, Switzerland', 'licensed', 'in_use'),
      ('Hospital Exterior Aerial Shot', 'photo', 'Staff Photographer', 'Drone footage showing the main campus of the affected hospital system', 'Hospital Data Breach Exposé', 'Mike Torres', 'Metro City', 'owned', 'available'),
      ('Housing Construction Timelapse', 'video', 'Staff', 'Three-month timelapse of new housing development construction progress', 'Q1 Housing Market Report', 'Sarah Kim', 'Suburban District', 'owned', 'in_use'),
      ('FDA Press Conference Recording', 'video', 'C-SPAN', 'Full recording of FDA commissioner announcing new cancer treatment approval', 'Revolutionary Cancer Treatment Approved', 'Pool Camera', 'Washington DC', 'public_domain', 'available'),
      ('ISS Equipment Failure Diagram', 'infographic', 'NASA', 'Technical diagram showing the failed life support system components', 'ISS Crisis Coverage', 'NASA Graphics Dept', 'Space', 'public_domain', 'in_use'),
      ('Microplastics Microscope Image', 'photo', 'Nature Journal', 'High-resolution microscope image of microplastics found in human blood samples', 'The Invisible Threat in Our Water', 'Dr. Lee Research Lab', 'MIT Laboratory', 'licensed', 'available'),
      ('Union Rally Footage', 'video', 'Staff', 'Raw footage from the auto workers union rally outside MegaMotors headquarters', 'The Money Game: Athletes vs Owners', 'James Wilson', 'Detroit', 'owned', 'available'),
      ('Cybersecurity Threat Map', 'infographic', 'Design Team', 'Interactive map showing global spread of the zero-day vulnerability', 'Critical Software Vulnerability', 'Design Team', 'N/A', 'owned', 'in_use'),
      ('Senator Torres Headshot', 'photo', 'Senate Photo Office', 'Official headshot of Senator Torres for profile piece', 'Tech Regulation Bill Coverage', 'Senate Photographer', 'Capitol Hill', 'public_domain', 'available'),
      ('Water Level Comparison Photos', 'photo', 'USGS', 'Side-by-side comparison of Lake Mead water levels 2020 vs 2026', 'Southwest Water Emergency', 'USGS Survey Team', 'Lake Mead, NV', 'public_domain', 'in_use'),
      ('Electric Aircraft Concept Art', 'illustration', 'Delta Airlines PR', 'Concept rendering of the proposed electric passenger aircraft', 'Can Airlines Really Go Electric?', 'Delta Design Studio', 'N/A', 'licensed', 'available'),
      ('Downtown Crime Stats Chart', 'infographic', 'Data Team', 'Bar chart showing quarterly crime statistics for downtown area', 'Crime Wave Analysis', 'Data Visualization Team', 'N/A', 'owned', 'available'),
      ('Fusion Reactor Interior', 'photo', 'Company PR', 'Interior view of the experimental fusion reactor chamber', 'The Race to Commercial Fusion', 'Company Photographer', 'Silicon Valley', 'licensed', 'available'),
      ('Immigration Rally Audio', 'audio', 'Field Reporter', 'Ambient audio recording from immigration reform rally with crowd chants and speeches', 'Immigration Reform Coverage', 'Maria Rodriguez', 'National Mall, DC', 'owned', 'available'),
      ('School AI Tutoring Screenshot', 'document', 'School District', 'Screenshot of the AI tutoring interface being used by students', 'AI Tutoring: Promise and Peril', 'School District PR', 'Metro Schools', 'fair_use', 'in_use');
    `);

    // Seed editorial calendar (15 items)
    await client.query(`
      INSERT INTO editorial_calendar (title, section, publish_date, content_type, assigned_to, status, priority, description) VALUES
      ('Weekly Tech Regulation Roundup', 'Technology', '2026-03-21 06:00:00', 'article', 'Sarah Chen', 'in_production', 'high', 'Weekly summary of all tech regulation developments. Include EU, US, and China updates.'),
      ('Climate Summit Special Report', 'Environment', '2026-03-22 08:00:00', 'feature', 'James Wilson', 'in_production', 'critical', 'Multi-part feature on COP30 outcomes. Include interviews, data visualization, and analysis.'),
      ('Morning Briefing Newsletter', 'General', '2026-03-21 05:30:00', 'newsletter', 'Maria Rodriguez', 'ready', 'high', 'Daily morning briefing covering top 5 stories. Must be sent by 5:30 AM.'),
      ('Data Breach Investigation - Part 1', 'Investigations', '2026-03-24 09:00:00', 'investigation', 'Maria Rodriguez', 'in_production', 'critical', 'First installment of hospital data breach investigation. Legal review required before publication.'),
      ('Weekend Arts & Culture Guide', 'Culture', '2026-03-28 10:00:00', 'feature', 'Sarah Chen', 'planned', 'low', 'Weekly roundup of local arts events, exhibitions, and performances.'),
      ('Podcast: AI in the Newsroom', 'Technology', '2026-03-25 12:00:00', 'podcast', 'James Wilson', 'planned', 'medium', 'Episode 12 of the tech podcast. Guest: Stanford AI Ethics professor.'),
      ('Housing Market Monthly Report', 'Economy', '2026-03-30 07:00:00', 'article', 'Sarah Chen', 'planned', 'medium', 'Monthly housing market analysis with charts and expert commentary.'),
      ('Op-Ed: The Case for Nuclear Energy', 'Opinion', '2026-03-23 11:00:00', 'opinion', 'James Wilson', 'in_production', 'medium', 'Guest op-ed from nuclear scientist. Fact-check all claims before publication.'),
      ('Breaking News Protocol Review', 'General', '2026-03-26 14:00:00', 'article', 'Maria Rodriguez', 'planned', 'low', 'Internal review of breaking news coverage protocols after ISS incident.'),
      ('Video: Inside the Fusion Lab', 'Science', '2026-03-27 15:00:00', 'multimedia', 'Sarah Chen', 'planned', 'medium', 'Produced video tour of fusion startup facility with scientist interviews.'),
      ('Immigration Reform Explainer', 'Politics', '2026-03-24 08:00:00', 'feature', 'James Wilson', 'in_production', 'high', 'Comprehensive explainer with interactive graphics showing bill provisions.'),
      ('Education Series Finale', 'Education', '2026-03-29 09:00:00', 'feature', 'Maria Rodriguez', 'planned', 'medium', 'Final part of 5-part series on AI in education. Include parent and teacher perspectives.'),
      ('Quarterly Revenue Report Analysis', 'Business', '2026-03-31 06:00:00', 'article', 'Sarah Chen', 'planned', 'high', 'Analysis of Q1 earnings from major tech companies. Pre-write template ready.'),
      ('Water Crisis Multimedia Package', 'Environment', '2026-03-25 10:00:00', 'multimedia', 'James Wilson', 'in_production', 'high', 'Video, photos, and interactive map showing water crisis progression.'),
      ('Election Preview Special', 'Politics', '2026-04-01 08:00:00', 'feature', 'Maria Rodriguez', 'planned', 'critical', 'Comprehensive preview of upcoming primary elections. Candidate profiles and issue analysis.');
    `);

    // Seed contacts (15 items)
    await client.query(`
      INSERT INTO contacts (name, organization, role, phone, email, category, notes) VALUES
      ('Dr. Emily Watson', 'MIT', 'Climate Researcher', '617-555-0142', 'ewatson@mit.edu', 'expert', 'Leading IPCC author. Available mornings EST. Prefers email first.'),
      ('Tom Bradley', 'Reuters', 'Bureau Chief', '212-555-0198', 'tbradley@reuters.com', 'colleague', 'Good for wire story tips. Covers finance and tech.'),
      ('Sen. Michael Torres', 'US Senate', 'Commerce Committee Chair', '202-555-0167', 'press@torres.senate.gov', 'official', 'Key contact on tech regulation. Schedule through press secretary.'),
      ('Lisa Park', 'NexGen Health', 'CEO', '415-555-0133', 'lpark@nexgenhealth.com', 'source', 'Central figure in data breach story. Legal counsel present for interviews.'),
      ('Chief Robert Hayes', 'Metro Police', 'Police Chief', '555-0177', 'rhayes@metropd.gov', 'official', 'Quarterly briefings. Direct line for breaking crime news.'),
      ('Maria Santos', 'City Hall', 'Press Secretary', '555-0155', 'msantos@city.gov', 'pr', 'Responsive within 2 hours. Handles all mayor communications.'),
      ('Prof. Angela Morris', 'Stanford', 'AI Ethics Lab Director', '650-555-0199', 'amorris@stanford.edu', 'expert', 'Published landmark study on algorithmic bias. Great for tech ethics stories.'),
      ('James Kowalski', 'Auto Workers Union', 'Union President', '313-555-0144', 'jkowalski@awu.org', 'source', 'Key labor contact. Off-record conversations expected. Build trust.'),
      ('Rachel Chen', 'AP News', 'National Editor', '212-555-0188', 'rchen@ap.org', 'colleague', 'Coordinate on major breaking stories. Shares tips on national interest pieces.'),
      ('David Park', 'FDA', 'Public Affairs Officer', '301-555-0122', 'dpark@fda.gov', 'pr', 'Main contact for drug approval stories. Slow to respond, follow up after 48h.'),
      ('Elena Vasquez', 'N/A', 'Whistleblower', NULL, 'encrypted-only@protonmail.com', 'source', 'CONFIDENTIAL. Energy sector insider. Source protection paramount. Use Signal.'),
      ('Mike Torres', 'Staff', 'Photographer', '555-0166', 'mtorres@newsroom.com', 'colleague', 'Go-to for breaking news photography. Drone certified.'),
      ('Dr. Aisha Patel', 'WHO', 'Epidemiologist', '+41-22-555-0187', 'apatel@who.int', 'expert', 'Global health expert. Time zone: CET. Best reached 9-11am CET.'),
      ('Frank Morrison', 'District Attorney Office', 'District Attorney', '555-0145', 'fmorrison@da.gov', 'official', 'On-record for criminal justice stories. Tight-lipped on active cases.'),
      ('Sarah Kim', 'EdTech Startup', 'Founder & CEO', '650-555-0178', 'skim@edtechco.com', 'source', 'AI in education contact. Recently raised $50M. Open to interviews.');
    `);

    // Seed notes (15 items)
    await client.query(`
      INSERT INTO notes (title, content, category, related_story, pinned, author) VALUES
      ('Data breach timeline', 'Jan 15 - First unauthorized access detected in logs\nFeb 3 - Anomaly flagged by automated system\nFeb 10 - IT team investigates, confirms breach\nMar 1 - Public disclosure\nMar 15 - Class action filed', 'research', 'Hospital Data Breach Exposé', true, 'Maria Rodriguez'),
      ('Climate summit key quotes', 'EU Commissioner: "This is the last chance for meaningful action"\nUS Envoy: "We are committed to 50% reduction by 2030"\nChina delegate: "Developing nations need financial support"', 'interview', 'Climate Summit Coverage', true, 'James Wilson'),
      ('Housing data sources', 'Federal Reserve: fred.stlouisfed.org\nZillow Research: zillow.com/research\nNAR: nar.realtor/research\nCensus Bureau housing starts\nLocal MLS data - request from Sarah', 'research', 'Q1 Housing Market Report', false, 'Sarah Chen'),
      ('Tip: School board meeting', 'Anonymous caller says school board will vote to cut arts programs next Tuesday. Meeting at 7pm, Room 204. Board member Johnson expected to dissent.', 'tip', NULL, true, 'James Wilson'),
      ('Interview prep - FDA Commissioner', 'Key questions:\n1. Why expedited review for this therapy?\n2. Safety concerns with CAR-T?\n3. Cost to patients?\n4. Availability timeline?\nBackground: FDA approved 6 gene therapies in last 2 years', 'interview', 'Cancer Treatment Breakthrough', false, 'Sarah Chen'),
      ('Story idea: Gig economy workers', 'Follow up on new labor law. Interview 5-6 gig workers about impact. Check Uber/Lyft earnings data. Compare with pre-law conditions. Could be 3-part series.', 'idea', NULL, false, 'Maria Rodriguez'),
      ('FOIA request tracking', 'Submitted:\n- EPA water quality data (Feb 15, ref #2026-EPA-0442)\n- Police use of force stats (Feb 20, ref #2026-PD-0118)\n- School budget docs (Mar 1, ref #2026-ED-0055)\nExpected responses: 20 business days each', 'research', NULL, true, 'James Wilson'),
      ('Zoning change reaction notes', 'Spoke with 8 residents on Oak Street. 6 opposed, 2 cautiously supportive. Main concerns: parking, property values, construction noise. Homeowner assoc president very vocal. Get her on record.', 'interview', 'Neighborhoods React to Zoning Overhaul', false, 'Sarah Chen'),
      ('To-do: Verify fusion claims', '1. Check peer-reviewed publications by company scientists\n2. Contact MIT Plasma Science Center for independent assessment\n3. Review SEC filings for financial viability\n4. Compare with ITER timeline\n5. Talk to former employees on LinkedIn', 'todo', 'The Race to Commercial Fusion', false, 'James Wilson'),
      ('Source reliability concern', 'Wall Street Insider Forum post about MegaCorp merger was wrong last time (Oct claim about acquisition never materialized). Downgrade reliability. Cross-reference any future tips with SEC filings.', 'research', NULL, false, 'Maria Rodriguez'),
      ('Expense policy reminder', 'New policy effective March 1:\n- Meals: max $50/day\n- Mileage: $0.67/mile\n- Hotels: pre-approval required over $200/night\n- Equipment: needs editor sign-off over $100', 'general', NULL, true, 'Sarah Chen'),
      ('Cybersecurity expert contacts', 'For zero-day story:\n- Bruce Schneier (general commentary)\n- Katie Moussouris (vulnerability disclosure)\n- CISA press office\n- Company CISO (awaiting callback)', 'research', 'Critical Software Vulnerability', false, 'Maria Rodriguez'),
      ('Tip: Construction fraud', 'Caller ID: blocked. Claims city inspector taking bribes on new downtown project. Mentioned specific inspector name (verify). Says documentation exists in permit office. Worth investigating.', 'tip', NULL, false, 'James Wilson'),
      ('Weekend magazine pitch ideas', '1. Day in the life of an ER nurse (post-pandemic)\n2. Urban farming profiles (3 different neighborhoods)\n3. Last independent bookstore downtown\n4. High school robotics team going to nationals', 'idea', NULL, false, 'Sarah Chen'),
      ('Water crisis data points', 'Lake Mead: 1,043 ft (record low was 1,041 in 2024)\nColorado River flow: 40% below average\nAffected population: 40 million across AZ, NV, CA\nRationing tier: Level 2 (unprecedented)\nNext measurement: March 25', 'research', 'Southwest Water Emergency', true, 'Maria Rodriguez');
    `);

    // Seed expenses (15 items)
    await client.query(`
      INSERT INTO expenses (description, amount, category, expense_date, related_story, reporter, status, receipt_ref) VALUES
      ('Flight to Geneva for climate summit', 895.00, 'travel', '2026-03-18', 'Climate Summit Coverage', 'James Wilson', 'approved', 'RCP-2026-0142'),
      ('Hotel - Geneva 3 nights', 720.00, 'lodging', '2026-03-19', 'Climate Summit Coverage', 'James Wilson', 'approved', 'RCP-2026-0143'),
      ('Uber to hospital campus', 24.50, 'transportation', '2026-03-15', 'Hospital Data Breach Exposé', 'Maria Rodriguez', 'reimbursed', 'RCP-2026-0138'),
      ('Court document copies', 45.00, 'other', '2026-03-12', 'Hospital Data Breach Exposé', 'Maria Rodriguez', 'reimbursed', 'RCP-2026-0135'),
      ('Lunch with source - downtown', 38.75, 'meals', '2026-03-14', 'Tech Regulation Coverage', 'Sarah Chen', 'approved', 'RCP-2026-0137'),
      ('Monthly AP wire subscription', 299.00, 'subscription', '2026-03-01', NULL, 'Sarah Chen', 'approved', 'RCP-2026-0130'),
      ('Parking at City Hall', 15.00, 'transportation', '2026-03-10', 'Zoning Change Coverage', 'Sarah Chen', 'reimbursed', 'RCP-2026-0133'),
      ('Portable audio recorder', 189.99, 'equipment', '2026-03-08', NULL, 'James Wilson', 'approved', 'RCP-2026-0131'),
      ('Train to DC for Senate hearing', 156.00, 'travel', '2026-03-20', 'Immigration Bill Coverage', 'Sarah Chen', 'pending', 'RCP-2026-0148'),
      ('Dinner with union sources', 67.50, 'meals', '2026-03-16', 'Labor Dispute Coverage', 'James Wilson', 'pending', 'RCP-2026-0140'),
      ('Encrypted phone service - quarterly', 45.00, 'communication', '2026-03-01', NULL, 'Maria Rodriguez', 'approved', 'RCP-2026-0129'),
      ('Mileage - Lake Mead reporting trip', 124.30, 'travel', '2026-03-17', 'Southwest Water Emergency', 'Maria Rodriguez', 'pending', 'RCP-2026-0141'),
      ('Coffee meeting with whistleblower', 12.40, 'meals', '2026-03-13', 'Environmental Violations', 'James Wilson', 'reimbursed', 'RCP-2026-0136'),
      ('FOIA request fees', 35.00, 'other', '2026-03-05', NULL, 'James Wilson', 'approved', 'RCP-2026-0132'),
      ('Replacement laptop charger', 79.99, 'equipment', '2026-03-19', NULL, 'Maria Rodriguez', 'pending', 'RCP-2026-0147');
    `);

    console.log('Database seeded successfully!');
    console.log('Login credentials:');
    console.log('  Editor:   editor@newsroom.com / password123');
    console.log('  Reporter: reporter@newsroom.com / password123');
    console.log('  Admin:    admin@newsroom.com / password123');
  } catch (err) {
    console.error('Seed error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
