import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ShiftHandover() {
  const [keys, setKeys] = useState([]);
  useEffect(() => { api.get('/key-logs/shift-handover').then(res => setKeys(res.data)); }, []);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Shift Handover – Keys Not Returned</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><table className="min-w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium">Student</th><th className="px-6 py-3 text-left text-xs font-medium">Key</th><th className="px-6 py-3 text-left text-xs font-medium">Room</th><th className="px-6 py-3 text-left text-xs font-medium">Time Out</th><th className="px-6 py-3 text-left text-xs font-medium">Status</th></tr></thead><tbody>{keys.map(k => (<tr key={k.id}><td className="px-6 py-4">{k.student_name}</td><td className="px-6 py-4">{k.key?.name} ({k.key?.code})</td><td className="px-6 py-4">{k.room_number}</td><td className="px-6 py-4">{k.time_out}</td><td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">{k.status}</span></td></tr>))}</tbody></table></div>
    </div>
  );
}