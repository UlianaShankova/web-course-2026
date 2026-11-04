function Stats({ stats }) {
  return (
    <div className="stats">
      <span>Всего: {stats.total}</span>
      <span>Активных: {stats.active}</span>
      <span>Завершённых: {stats.completed}</span>
    </div>
  );
}

export default Stats;