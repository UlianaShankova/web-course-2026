import TodoItem from './TodoItem';

/**
 * @param {{
 *   items: Array<{id: string, text: string, done: boolean}>,
 *   onToggle: (id: string) => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
function TodoList({ items, onToggle, onDelete }) {
  if (items.length === 0) {
    return <p className="empty">Задач нет</p>;
  }

  return (
    <ul className="todo-list">
      {items.map((item) => (
        <TodoItem
          key={item.id}
          item={item}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default TodoList;