import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function KeyLogDetail() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [keyInfo, setKeyInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/keys/${id}/logs`).then(res => setLogs(res.data));
    api.get('/keys').then(res => {
      const found = res.data.find(k => k.id == id);
      setKeyInfo(found);
    });
  }, [id]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/keys')} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeftIcon className="h-5 w-5 text-gray-600" /></button>
        <div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Key Logs: {keyInfo?.name || ''} ({keyInfo?.code})</h1></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Out</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time In</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned By (Student)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{log.student_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.student_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.time_out}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.time_in || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.returned_by_student || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${log.status === 'RETURNED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.status}</span></td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No logs found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}