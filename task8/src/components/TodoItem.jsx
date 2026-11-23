/**
 * Одна задача. Локального состояния не требует.
 * @param {{
 *   item: {id: string, text: string, done: boolean},
 *   onToggle: (id: string) => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
function TodoItem({ item, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${item.done ? 'done' : ''}`}>
      <label>
        <input
          type="checkbox"
          checked={item.done}
          onChange={() => onToggle(item.id)}
        />
        <span>{item.text}</span>
      </label>
      <button
        className="delete-btn"
        onClick={() => onDelete(item.id)}
        aria-label="Удалить"
      >
        ✕
      </button>
    </li>
  );
}

export default TodoItem;