import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MagnifyingGlassIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

export default function ReturnKey() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [log, setLog] = useState(null);
  const [timeIn, setTimeIn] = useState('');
  const [acknowledgeDifferent, setAcknowledgeDifferent] = useState(false);
  const [sameStudentReturn, setSameStudentReturn] = useState(true);
  const [otherReturnerName, setOtherReturnerName] = useState('');

  const handleSearch = async () => {
    if (!search.trim()) { toast.error('Enter Student ID or Room'); return; }
    try {
      const res = await api.get(`/key-logs?search=${search}`);
      const found = res.data.data.find(l => l.status !== 'RETURNED');
      if (found) { setLog(found); setAcknowledgeDifferent(false); setSameStudentReturn(true); setOtherReturnerName(''); toast.success(`Active key found for ${found.student_name}`); }
      else { toast.error('No active key found'); setLog(null); }
    } catch { toast.error('Search error'); }
  };

  const handleReturn = async () => {
    if (!timeIn) { toast.error('Enter return time'); return; }
    if (log.checked_out_by && log.checked_out_by.id !== user?.id && !acknowledgeDifferent) { toast.error('This key was issued by another porter. Please confirm.'); return; }
    let returnerStudentName = log.student_name;
    if (!sameStudentReturn) {
      if (!otherReturnerName.trim()) { toast.error('Enter name of person returning key'); return; }
      returnerStudentName = otherReturnerName.trim();
    }
    try {
      await api.put(`/key-logs/${log.id}`, { time_in: timeIn, returned_by_student: returnerStudentName });
      toast.success(`Key returned by ${user.name}`);
      setLog(null); setSearch(''); setTimeIn(''); setAcknowledgeDifferent(false); setSameStudentReturn(true); setOtherReturnerName('');
    } catch (error) { toast.error(error.response?.data?.error || 'Error returning key'); }
  };

  const isDifferentPorter = log && log.checked_out_by && log.checked_out_by.id !== user?.id;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Return Key</h1><p className="text-sm text-gray-500 mt-1">Record a key being checked in</p></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-8">
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1"><MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Student ID or Room Number" className="pl-10 w-full p-3 border rounded-lg" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button onClick={handleSearch} className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg">Search</button>
        </div>
        {log && (
          <div className="border-t pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"><div><span className="font-medium">Student:</span> {log.student_name} ({log.student_id})</div><div><span className="font-medium">Room:</span> {log.room_number}</div><div><span className="font-medium">Time Out:</span> {log.time_out}</div><div><span className="font-medium">Issued by:</span> {log.checked_out_by?.name || 'Unknown'}</div><div><span className="font-medium">Returning Porter:</span> {user?.name}</div></div>
            <div className="bg-gray-50 rounded-lg p-4"><label className="flex items-center gap-2 mb-3"><input type="checkbox" checked={sameStudentReturn} onChange={e => setSameStudentReturn(e.target.checked)} className="rounded text-indigo-600" /><span>Returned by the same student</span></label>{!sameStudentReturn && (<div className="relative"><UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Name of friend / finder" className="pl-10 w-full p-2 border rounded-lg" value={otherReturnerName} onChange={e => setOtherReturnerName(e.target.value)} /></div>)}</div>
            {isDifferentPorter && (<div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-700 font-medium text-sm">⚠️ Different porter return</p><label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={acknowledgeDifferent} onChange={e => setAcknowledgeDifferent(e.target.checked)} className="rounded text-red-600" /><span className="text-xs text-red-700">Confirm return on behalf of another porter</span></label></div>)}
            <div className="relative"><ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="time" className="pl-10 w-full p-3 border rounded-lg" value={timeIn} onChange={e => setTimeIn(e.target.value)} required /></div>
            <button onClick={handleReturn} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg">Confirm Return</button>
          </div>
        )}
      </div>
    </div>
  );
}