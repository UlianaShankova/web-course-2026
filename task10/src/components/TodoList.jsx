import TodoItem from './TodoItem';

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