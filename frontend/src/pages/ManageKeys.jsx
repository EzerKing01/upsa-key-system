import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function ManageKeys() {
  const [keys, setKeys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchKeys(); }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await api.get('/keys-admin');
      setKeys(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingKey) {
        await api.put(`/keys/${editingKey.id}`, form);
        toast.success('Key updated');
      } else {
        await api.post('/keys', form);
        toast.success('Key added');
      }
      setShowModal(false);
      setEditingKey(null);
      setForm({ name: '', code: '' });
      fetchKeys();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving key');
    }
  };

  const handleDelete = async (id, keyName) => {
    if (!confirm(`Delete key "${keyName}"?`)) return;
    try {
      await api.delete(`/keys/${id}`);
      toast.success('Key deleted');
      fetchKeys();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete key');
    }
  };

  const handleBulkImport = async () => {
    const lines = bulkData.trim().split(/\r?\n/);
    const keysArray = [];
    for (const line of lines) {
      const parts = line.split(/\s*,\s*/);
      if (parts.length !== 2) {
        toast.error('Each line must have name,code');
        return;
      }
      keysArray.push({ name: parts[0].trim(), code: parts[1].trim() });
    }
    try {
      await api.post('/keys/bulk', { keys: keysArray });
      toast.success(`${keysArray.length} keys imported`);
      setBulkMode(false);
      setBulkData('');
      fetchKeys();
    } catch {
      toast.error('Bulk import failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Keys</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove keys in the building</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setEditingKey(null); setForm({ name: '', code: '' }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><PlusIcon className="h-4 w-4" /> Add Key</button>
          <button onClick={() => setBulkMode(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"><ArrowUpTrayIcon className="h-4 w-4" /> Bulk Import</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
              <tbody>
                {keys.map(key => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{key.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}><span className={`w-2 h-2 rounded-full ${key.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>{key.status}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button onClick={() => { setEditingKey(key); setForm({ name: key.name, code: key.code }); setShowModal(true); }} className="text-indigo-600 hover:text-indigo-800 mr-3"><PencilIcon className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(key.id, key.name)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No keys found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingKey ? 'Edit Key' : 'Add New Key'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Key name (e.g., Main Entrance)" className="w-full p-2 border rounded-lg" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input type="text" placeholder="Key code (e.g., K001)" className="w-full p-2 border rounded-lg" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">Save</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {bulkMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-2">Bulk Import Keys</h2>
            <p className="text-sm text-gray-500 mb-3">One key per line: <strong>name,code</strong><br />Example:<br />Main Entrance, M001</p>
            <textarea rows="8" className="w-full p-2 border rounded-lg font-mono text-sm" placeholder="Main Entrance, M001" value={bulkData} onChange={e => setBulkData(e.target.value)}></textarea>
            <div className="flex gap-3 mt-6">
              <button onClick={handleBulkImport} className="flex-1 bg-green-600 text-white py-2 rounded-lg">Import</button>
              <button onClick={() => setBulkMode(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}