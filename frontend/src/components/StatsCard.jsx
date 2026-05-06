export default function StatsCard({ title, value, icon, bg }) {
  return (
    <div className={`${bg} p-4 rounded-lg shadow flex items-center justify-between`}>
      <div><h3 className="text-lg font-semibold">{title}</h3><p className="text-3xl font-bold">{value}</p></div>
      <div>{icon}</div>
    </div>
  );
}
