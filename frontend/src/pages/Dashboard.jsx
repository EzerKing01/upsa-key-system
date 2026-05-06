import { useEffect, useState } from 'react';
import api from '../api/axios';
import { KeyIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_out: 0, returned_today: 0, recent_activity: [] });

  useEffect(() => {
    api.get('/key-logs/today').then(res => setStats(res.data));
  }, []);

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-800">Dashboard</h1><p className="text-gray-500 mt-1">Overview of key activity today</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between"><div><p className="text-sm text-gray-500">Keys out</p><p className="text-3xl font-bold">{stats.total_out}</p></div><div className="p-3 bg-yellow-100 rounded-full"><KeyIcon className="h-8 w-8 text-yellow-600" /></div></div>
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between"><div><p className="text-sm text-gray-500">Returned today</p><p className="text-3xl font-bold">{stats.returned_today}</p></div><div className="p-3 bg-green-100 rounded-full"><ArrowPathIcon className="h-8 w-8 text-green-600" /></div></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><div className="px-6 py-4 border-b flex items-center justify-between"><h2 className="text-lg font-semibold">Recent Activity</h2><ClockIcon className="h-5 w-5 text-gray-400" /></div><table className="min-w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Key</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Time Out</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th></tr></thead><tbody>{stats.recent_activity.map(log => (<tr key={log.id}><td className="px-6 py-4 text-sm">{log.student_name}</td><td className="px-6 py-4 text-sm">{log.key?.name}</td><td className="px-6 py-4 text-sm">{log.time_out}</td><td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${log.status === 'RETURNED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.status}</span></td></tr>))}</tbody></table></div>
    </div>
  );
}