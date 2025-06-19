// src/components/Pagination.jsx
export default function Pagination({ page, totalPages, onChange }) {
  return (
    <div style={{ margin: '1em 0' }}>
      {Array.from({ length: totalPages }, (_, i) => i+1).map(n => (
        <button
          key={n}
          disabled={n === page}
          onClick={() => onChange(n)}
          style={{ marginRight: '0.5em' }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
