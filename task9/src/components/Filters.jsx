import { memo } from 'react';

function Filters({ filter, onChange }) {
  const buttons = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активные' },
    { value: 'completed', label: 'Готово' },
  ];

  return (
    <div className="filters">
      {buttons.map((btn) => (
        <button
          key={btn.value}
          className={filter === btn.value ? 'active' : ''}
          onClick={() => onChange(btn.value)}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

export default memo(Filters);