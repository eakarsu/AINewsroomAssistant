import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        &laquo; Prev
      </button>
      <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>
        Page {page} of {totalPages}
      </span>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next &raquo;
      </button>
    </div>
  );
}
