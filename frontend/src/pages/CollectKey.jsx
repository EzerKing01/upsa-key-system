import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { UserIcon, IdentificationIcon, KeyIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function CollectKey() {
  const [keys, setKeys] = useState([]);
  const [form, setForm] = useState({ key_id: '', student_name: '', student_id: '', time_out: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/keys').then(res => setKeys(res.data.filter(k => k.status === 'active')));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/key-logs', form);
      toast.success('Key checked out');
      navigate('/key-logs');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error checking out key');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 md:mb-8"><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Collect Key</h1><p className="text-sm text-gray-500 mt-1">Select a key and record student check-out</p></div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative"><KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select className="pl-10 w-full p-3 border rounded-lg" required value={form.key_id} onChange={e => setForm({...form, key_id: e.target.value})}>
              <option value="">Select a key</option>
              {keys.map(k => <option key={k.id} value={k.id}>{k.name} ({k.code})</option>)}
            </select>
          </div>
          <div className="relative"><UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Student Name" className="pl-10 w-full p-3 border rounded-lg" required onChange={e => setForm({...form, student_name: e.target.value})} /></div>
          <div className="relative"><IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Student ID" className="pl-10 w-full p-3 border rounded-lg" required onChange={e => setForm({...form, student_id: e.target.value})} /></div>
          <div className="relative"><ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="time" className="pl-10 w-full p-3 border rounded-lg" required onChange={e => setForm({...form, time_out: e.target.value})} /></div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition">Record Check-out</button>
        </form>
      </div>
    </div>
  );
}