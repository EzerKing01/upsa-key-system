import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function KeyLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(`/key-logs?search=${search}`).then(res => setLogs(res.data.data));
  }, [search]);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4"><div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Key Logs</h1><p className="text-sm text-gray-500">View all key transactions</p></div><div className="relative"><MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Search by student, ID, or room..." className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-80" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Out</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued By</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time In</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned By (Porter)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned By (Student)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(log.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{log.key?.name} ({log.key?.code})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.student_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.time_out}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.checked_out_by?.name || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.time_in || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.returned_by?.name || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.returned_by_student || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${log.status === 'RETURNED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.status}</span></td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan="10" className="px-6 py-8 text-center text-gray-400">No logs found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}