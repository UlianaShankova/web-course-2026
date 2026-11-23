/**
 * Фильтры списка. Чтобы добавить новый фильтр —
 * достаточно дописать элемент в массив buttons.
 * @param {{ filter: string, onChange: (value: string) => void }} props
 */
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

export default Filters;