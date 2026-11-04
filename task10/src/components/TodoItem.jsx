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