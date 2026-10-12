import React from 'react';
import AIReport from './AIReport';

export default function AIResponse({ result, loading, error }) {
  return (
    <AIReport
      response={result}
      loading={loading}
      error={error}
      title="AI analysis"
      model={result?.model}
      tokens={result?.usage}
    />
  );
}
