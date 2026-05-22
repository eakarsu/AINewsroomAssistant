import React, { useEffect, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7', '#14b8a6', '#eab308'];

export default function SourceRadar() {
  const [axes, setAxes] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/source-radar', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.error) throw new Error(j.error);
        setAxes(j.axes || []);
        setSources(j.sources || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#94a3b8' }}>Loading source reliability...</p>;
  if (error) return <p style={{ color: '#ef4444' }}>Error: {error}</p>;

  // recharts wants rows pivoted: one row per axis with one column per source.
  const data = axes.map((axis) => {
    const row = { axis: axis.charAt(0).toUpperCase() + axis.slice(1) };
    sources.forEach((s) => {
      row[s.name] = s[axis];
    });
    return row;
  });

  return (
    <div>
      <h3 style={{ margin: '0 0 12px 0', color: '#e2e8f0' }}>
        Source Reliability Radar{' '}
        <span style={{ color: '#94a3b8', fontSize: 14 }}>
          ({sources.length} sources, 5 axes)
        </span>
      </h3>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
        <ResponsiveContainer width="100%" height={420}>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: '#e2e8f0', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            {sources.map((s, i) => (
              <Radar
                key={s.id}
                name={s.name}
                dataKey={s.name}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.12}
              />
            ))}
            <Legend wrapperStyle={{ color: '#e2e8f0', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
