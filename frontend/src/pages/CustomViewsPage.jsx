import React from 'react';
import StoryKanban from '../components/StoryKanban';
import SourceRadar from '../components/SourceRadar';
import ArticlePDF from '../components/ArticlePDF';
import APStyleChecker from '../components/APStyleChecker';

export default function CustomViewsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h2>Newsroom Views</h2>
        <p className="subtitle">
          Workflow kanban, source reliability radar, article PDF export and AP style checker.
        </p>
      </div>

      <section style={{ marginBottom: 24 }}>
        <StoryKanban />
      </section>

      <section style={{ marginBottom: 24 }}>
        <SourceRadar />
      </section>

      <section style={{ marginBottom: 24 }}>
        <ArticlePDF />
      </section>

      <section style={{ marginBottom: 24 }}>
        <APStyleChecker />
      </section>
    </div>
  );
}
