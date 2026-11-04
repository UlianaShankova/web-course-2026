function SortControls({ sort, onChange }) {
  return (
    <select
      className="sort-select"
      value={sort}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="newest">Сначала новые</option>
      <option value="oldest">Сначала старые</option>
      <option value="alpha">По алфавиту (А→Я)</option>
    </select>
  );
}

export default SortControls;