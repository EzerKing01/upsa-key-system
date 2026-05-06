import { useEffect, useState } from 'react';
import api from '../api/axios';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export default function DailyLogs() {
  const [logsByDate, setLogsByDate] = useState({});
  useEffect(() => { api.get('/key-logs/daily-logs').then(res => setLogsByDate(res.data)); }, []);
  const exportPDF = (date) => window.open(`http://localhost:8000/api/key-logs/export-pdf/${date}`);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Daily Logs</h1>
      {Object.entries(logsByDate).map(([date, logs]) => (
        <div key={date} className="mb-8 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center"><h2 className="text-lg font-semibold">{date}</h2><button onClick={() => exportPDF(date)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg"><DocumentArrowDownIcon className="h-4 w-4" /> PDF</button></div>
          <table className="min-w-full"><thead className="bg-white"><tr><th className="px-6 py-3 text-left text-xs font-medium">Student</th><th className="px-6 py-3 text-left text-xs font-medium">ID</th><th className="px-6 py-3 text-left text-xs font-medium">Key</th><th className="px-6 py-3 text-left text-xs font-medium">Time Out</th><th className="px-6 py-3 text-left text-xs font-medium">Time In</th><th className="px-6 py-3 text-left text-xs font-medium">Status</th></tr></thead><tbody>{logs.map(log => (<tr key={log.id}><td className="px-6 py-4">{log.student_name}</td><td className="px-6 py-4">{log.student_id}</td><td className="px-6 py-4">{log.key?.name}</td><td className="px-6 py-4">{log.time_out}</td><td className="px-6 py-4">{log.time_in || '—'}</td><td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${log.status === 'RETURNED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.status}</span></td></tr>))}</tbody></table>
        </div>
      ))}
    </div>
  );
}