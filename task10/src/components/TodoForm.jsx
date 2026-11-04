import { useState } from 'react';

function TodoForm({ onAdd }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // чтобы страница не перезагружалась
    onAdd(text);
    setText(''); // очищаем поле
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