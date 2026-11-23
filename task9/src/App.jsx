import { useState, useEffect, useMemo, useCallback } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import Filters from './components/Filters';
import SortControls from './components/SortControls';
import Stats from './components/Stats';
import './App.css';

const STORAGE_KEY = 'todo-react-items';

function App() {
  // 1. Инициализация из localStorage (ленивая инициализация стейта)
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  // 2. useEffect для сохранения в localStorage при каждом изменении списка
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // 3. useCallback для функций (чтобы memo-компоненты не рендерились зря)
  const addTodo = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newItem = {
      id: Date.now().toString(),
      text: trimmed,
      done: false,
      createdAt: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);
  }, []);

  const toggleTodo = useCallback((id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 4. useMemo для фильтрации (пересчитывается только при изменении items или filter)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter === 'active') return !item.done;
      if (filter === 'completed') return item.done;
      return true;
    });
  }, [items, filter]);

  // 5. useMemo для сортировки (создаем копию через [...], чтобы не мутировать исходный массив)
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sort === 'alpha') {
        return a.text.localeCompare(b.text, 'ru', { sensitivity: 'base' });
      }
      if (sort === 'oldest') {
        return a.createdAt - b.createdAt;
      }
      return b.createdAt - a.createdAt; // newest
    });
  }, [filteredItems, sort]);

  // 6. useMemo для статистики
  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((i) => !i.done).length,
      completed: items.filter((i) => i.done).length,
    }),
    [items]
  );

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
          <SortControls sort={sort} onChange={setSort} />
        </div>

        <TodoList
          items={sortedItems}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />

        <Stats stats={stats} />
      </div>
    </div>
  );
}

export default App;