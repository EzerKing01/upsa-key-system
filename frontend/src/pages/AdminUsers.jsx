import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { UserPlusIcon, UserIcon, EnvelopeIcon, KeyIcon as LockIcon } from '@heroicons/react/24/outline';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'porter', password: '' });
  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => { const res = await api.get('/users'); setUsers(res.data); };
  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/users', form); toast.success('User created'); fetchUsers(); setForm({ name: '', email: '', role: 'porter', password: '' }); }
    catch { toast.error('Error creating user'); }
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl md:text-3xl font-bold">Manage Users</h1><p className="text-sm text-gray-500">Add or view system users</p></div>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8"><h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserPlusIcon className="h-5 w-5 text-indigo-600" /> Add New User</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="relative"><UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Full Name" className="pl-10 w-full p-2 border rounded-lg" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="relative"><EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="email" placeholder="Email" className="pl-10 w-full p-2 border rounded-lg" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
        <div className="relative"><LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="password" placeholder="Password" className="pl-10 w-full p-2 border rounded-lg" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
        <select className="w-full p-2 border rounded-lg" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="porter">Porter</option><option value="admin">Admin</option></select>
        <button type="submit" className="md:col-span-4 bg-indigo-600 text-white font-medium py-2 rounded-lg">Create User</button></form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><table className="min-w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium">Name</th><th className="px-6 py-3 text-left text-xs font-medium">Email</th><th className="px-6 py-3 text-left text-xs font-medium">Role</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td className="px-6 py-4">{u.name}</td><td className="px-6 py-4">{u.email}</td><td className="px-6 py-4 capitalize">{u.role}</td></tr>)}</tbody></table></div>
    </div>
  );
}