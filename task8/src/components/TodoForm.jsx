import { useState } from 'react';

/**
 * Форма добавления задачи.
 * @param {{ onAdd: (text: string) => void }} props
 */
function TodoForm({ onAdd }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(text);
    setText('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Что нужно сделать?"
      />
      <button type="submit">Добавить</button>
    </form>
  );
}

export default TodoForm;