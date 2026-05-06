import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Keys() {
  const [keys, setKeys] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/keys').then(res => setKeys(res.data));
  }, []);

  return (
    <div>
      <div className="mb-6 md:mb-8"><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Building Keys</h1><p className="text-sm text-gray-500 mt-1">View all keys and their current status</p></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody>
              {keys.map(key => (
                <tr key={key.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{key.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}><span className={`w-2 h-2 rounded-full ${key.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>{key.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => navigate(`/keys/${key.id}/logs`)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm"><DocumentTextIcon className="h-4 w-4" /> Log</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}