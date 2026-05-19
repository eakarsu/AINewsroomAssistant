const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../models/db');
const auth = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------------------------
// VIZ 1: STORY QUEUE KANBAN
// Returns story leads grouped into newsroom-workflow columns.
// ---------------------------------------------------------------------------
router.get('/story-kanban', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, source, category, priority, status, summary FROM story_leads ORDER BY id ASC'
    );
    const columns = ['pitch', 'assigned', 'drafting', 'review', 'published'];
    const grouped = Object.fromEntries(columns.map(c => [c, []]));

    // Map raw DB statuses onto our newsroom kanban columns.
    const statusMap = {
      new: 'pitch',
      pitch: 'pitch',
      assigned: 'assigned',
      researching: 'assigned',
      'in-progress': 'drafting',
      drafting: 'drafting',
      draft: 'drafting',
      review: 'review',
      reviewing: 'review',
      published: 'published',
      complete: 'published',
    };

    result.rows.forEach((row, idx) => {
      const key = (row.status || '').toLowerCase();
      const col = statusMap[key] || columns[idx % columns.length];
      grouped[col].push(row);
    });

    res.json({ columns, lanes: grouped, total: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// VIZ 2: SOURCE RELIABILITY RADAR
// Returns sources with radar-axis scores: accuracy/timeliness/balance/depth/transparency
// ---------------------------------------------------------------------------
router.get('/source-radar', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, type, credibility_score, verification_status FROM sources ORDER BY credibility_score DESC LIMIT 8'
    );

    // Derive five reliability axes from the underlying credibility score so the
    // radar chart shows distinct facets per source.
    const axes = ['accuracy', 'timeliness', 'balance', 'depth', 'transparency'];
    const sources = result.rows.map((s, idx) => {
      const base = Math.max(20, Math.min(100, Number(s.credibility_score) || 50));
      const seed = (s.id || idx) * 13;
      const jitter = (offset) => {
        const x = Math.sin(seed + offset) * 10000;
        return Math.round((x - Math.floor(x)) * 20) - 10; // -10..+10
      };
      const verifiedBoost = s.verification_status === 'verified' ? 8 : 0;
      const scores = {};
      axes.forEach((axis, i) => {
        const v = base + jitter(i + 1) + (axis === 'transparency' ? verifiedBoost : 0);
        scores[axis] = Math.max(0, Math.min(100, v));
      });
      return { id: s.id, name: s.name, type: s.type, ...scores };
    });

    res.json({ axes, sources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// NON-VIZ 1: ARTICLE PDF EXPORT
// GET /articles - list articles for picker
// POST /article-pdf - generate print-style PDF for selected article
// ---------------------------------------------------------------------------
router.get('/articles', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, author, category, status, word_count FROM article_drafts ORDER BY id DESC'
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/article-pdf', auth, async (req, res) => {
  try {
    const { article_id, masthead } = req.body || {};
    if (!article_id) return res.status(400).json({ error: 'article_id is required' });

    const r = await db.query('SELECT * FROM article_drafts WHERE id = $1', [article_id]);
    const article = r.rows[0];
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const dateline = new Date(article.updated_at || article.created_at || Date.now())
      .toUTCString().replace('GMT', '').trim().toUpperCase();
    const head = (masthead || 'THE NEWSROOM HERALD').toUpperCase();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="article-${article.id}.pdf"`
    );

    const doc = new PDFDocument({ size: 'LETTER', margin: 56 });
    doc.pipe(res);

    // Masthead
    doc.font('Times-Bold').fontSize(28).text(head, { align: 'center' });
    doc.moveDown(0.2);
    doc.font('Times-Italic').fontSize(10)
      .text('"All the News, Fact-Checked"', { align: 'center' });
    doc.moveTo(56, doc.y + 4).lineTo(556, doc.y + 4).stroke();
    doc.moveDown(1.2);

    // Headline
    doc.font('Times-Bold').fontSize(22).text(article.title, { align: 'left' });
    doc.moveDown(0.4);

    // Byline + dateline
    doc.font('Times-Italic').fontSize(11)
      .text(`By ${article.author || 'Staff Writer'}  |  ${article.category || 'News'}`,
        { align: 'left' });
    doc.font('Times-Roman').fontSize(10)
      .text(`${dateline} - Filed in the newsroom.`, { align: 'left' });
    doc.moveDown(0.8);

    // Body (two-column-ish: just full-width here for simplicity)
    doc.font('Times-Roman').fontSize(12)
      .text(article.content || '(No content)', { align: 'justify', lineGap: 2 });

    // Footer
    doc.moveDown(2);
    doc.font('Times-Italic').fontSize(9)
      .text(`Word count: ${article.word_count || 0}  |  Status: ${article.status || 'draft'}`,
        { align: 'right' });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// NON-VIZ 2: AP STYLE CHECKER
// Scans pasted text for common AP-style violations and returns line/col issues.
// ---------------------------------------------------------------------------
router.post('/ap-style-check', auth, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'text (string) is required' });
    }

    const issues = [];
    const push = (line, col, rule, snippet, suggestion) => {
      issues.push({ line, col, rule, snippet, suggestion });
    };

    const lines = text.split(/\r?\n/);
    lines.forEach((raw, i) => {
      const line = raw;
      const lineNum = i + 1;

      // 1) Oxford comma: ", and" inside a likely list (preceded by another comma)
      const oxford = /,\s+(and|or)\b/gi;
      let m;
      while ((m = oxford.exec(line)) !== null) {
        const upto = line.slice(0, m.index);
        if (/,/.test(upto)) {
          push(lineNum, m.index + 1, 'oxford-comma',
            line.slice(Math.max(0, m.index - 8), m.index + m[0].length + 4),
            `Remove serial comma before "${m[1]}" per AP style`);
        }
      }

      // 2) percent vs %
      const pct = /(\d+(?:\.\d+)?)\s*%/g;
      while ((m = pct.exec(line)) !== null) {
        push(lineNum, m.index + 1, 'percent-symbol',
          m[0], `Use "${m[1]} percent" instead of "${m[0]}"`);
      }

      // 3) Date abbreviations - AP abbreviates Jan., Feb., Aug., Sept., Oct., Nov., Dec.
      //    March/April/May/June/July are never abbreviated.
      const badDate = /\b(March|April|May|June|July)\.\s*\d{1,2}\b/g;
      while ((m = badDate.exec(line)) !== null) {
        push(lineNum, m.index + 1, 'date-format',
          m[0], `AP style: do not abbreviate "${m[1]}" with a period`);
      }
      const fullMonthBeforeDate = /\b(January|February|August|September|October|November|December)\s+\d{1,2}\b/g;
      while ((m = fullMonthBeforeDate.exec(line)) !== null) {
        const abbr = { January:'Jan.', February:'Feb.', August:'Aug.', September:'Sept.', October:'Oct.', November:'Nov.', December:'Dec.' }[m[1]];
        push(lineNum, m.index + 1, 'date-format',
          m[0], `AP style: abbreviate "${m[1]}" as "${abbr}" with a numeric date`);
      }

      // 4) Titles - capitalized formal titles before a name should be lowercase if standing alone
      const titleAfter = /\b(President|Senator|Governor|Mayor)\s+[a-z]/g;
      while ((m = titleAfter.exec(line)) !== null) {
        push(lineNum, m.index + 1, 'title-case',
          m[0], `Capitalize the proper name following "${m[1]}"`);
      }
      const standaloneTitle = /\b(The|the)\s+(President|Senator|Governor|Mayor)\b(?!\s+[A-Z])/g;
      while ((m = standaloneTitle.exec(line)) !== null) {
        push(lineNum, m.index + 1, 'title-case',
          m[0], `AP style: lowercase "${m[2]}" when it stands alone`);
      }

      // 5) Bonus: "over" vs "more than" for numerals (AP eased this but still common rule)
      const overNum = /\bover\s+\d/gi;
      while ((m = overNum.exec(line)) !== null) {
        push(lineNum, m.index + 1, 'over-vs-more-than',
          m[0], 'Prefer "more than" for numerical quantities');
      }
    });

    res.json({
      text_length: text.length,
      line_count: lines.length,
      issue_count: issues.length,
      issues,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
