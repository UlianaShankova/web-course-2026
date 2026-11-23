import { useState } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import Filters from './components/Filters';
import Stats from './components/Stats';
import './App.css';

/**
 * Корневой компонент приложения.
 * Хранит список задач, текущий фильтр и предоставляет дочерним
 * компонентам функции onAdd / onToggle / onDelete через props.
 */
function App() {
  /** @type {[Array<{id: string, text: string, done: boolean, createdAt: number}>, Function]} */
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  /**
   * Добавить задачу.
   * @param {string} text
   */
  const addTodo = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newItem = {
      id: Date.now().toString(),
      text: trimmed,
      done: false,
      createdAt: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);
  };

  /**
   * Переключить состояние "выполнено".
   * @param {string} id
   */
  const toggleTodo = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  /**
   * Удалить задачу.
   * @param {string} id
   */
  const deleteTodo = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'active') return !item.done;
    if (filter === 'completed') return item.done;
    return true;
  });

  const stats = {
    total: items.length,
    active: items.filter((i) => !i.done).length,
    completed: items.filter((i) => i.done).length,
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <header className="app-header">
          <div>
            <p className="header-date">
              {new Date().toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <h1>Мои задачи</h1>
          </div>
        </header>

        <TodoForm onAdd={addTodo} />

        <div className="controls">
          <Filters filter={filter} onChange={setFilter} />
        </div>

        <TodoList
          items={filteredItems}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />

        <Stats stats={stats} />
      </div>
    </div>
  );
}

export default App;