#!/bin/bash

# Exit on error
set -e

echo "========================================="
echo "UPSA - Admin Key Management (CRUD)"
echo "========================================="

# Navigate to backend
cd "$(dirname "$0")/backend" || { echo "Backend folder not found"; exit 1; }

# ---------------------------------------------
# 1. Add API routes for key management (admin only)
# ---------------------------------------------
# Add to routes/api.php inside auth:sanctum group
cat >> routes/api.php << 'EOF'

    // Admin key management
    Route::middleware('role:admin')->group(function () {
        Route::post('/keys', [App\Http\Controllers\KeyController::class, 'store']);
        Route::put('/keys/{id}', [App\Http\Controllers\KeyController::class, 'update']);
        Route::delete('/keys/{id}', [App\Http\Controllers\KeyController::class, 'destroy']);
        Route::post('/keys/bulk', [App\Http\Controllers\KeyController::class, 'bulkStore']);
    });
EOF

# ---------------------------------------------
# 2. Create KeyController (admin CRUD)
# ---------------------------------------------
php artisan make:controller KeyController
cat > app/Http/Controllers/KeyController.php << 'EOF'
<?php

namespace App\Http\Controllers;

use App\Models\Key;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KeyController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    // Store a single key
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key_number' => 'required|string|unique:keys,key_number',
            'room_number' => 'nullable|string',
            'current_status' => 'sometimes|in:present,absent',
        ]);

        $key = Key::create($validated);
        return response()->json($key, 201);
    }

    // Update a key
    public function update(Request $request, $id)
    {
        $key = Key::findOrFail($id);
        $validated = $request->validate([
            'key_number' => ['required', 'string', Rule::unique('keys')->ignore($key->id)],
            'room_number' => 'nullable|string',
            'current_status' => 'sometimes|in:present,absent',
        ]);
        $key->update($validated);
        return response()->json($key);
    }

    // Delete a key
    public function destroy($id)
    {
        $key = Key::findOrFail($id);
        // Prevent deletion if key is currently absent (checked out)?
        if ($key->current_status === 'absent') {
            return response()->json(['error' => 'Cannot delete a key that is currently checked out'], 409);
        }
        $key->delete();
        return response()->json(['message' => 'Key deleted']);
    }

    // Bulk import keys
    public function bulkStore(Request $request)
    {
        $request->validate([
            'keys' => 'required|array',
            'keys.*.key_number' => 'required|string|unique:keys,key_number',
            'keys.*.room_number' => 'nullable|string',
        ]);

        $created = [];
        foreach ($request->keys as $keyData) {
            $created[] = Key::create([
                'key_number' => $keyData['key_number'],
                'room_number' => $keyData['room_number'] ?? null,
                'current_status' => 'present',
            ]);
        }
        return response()->json(['message' => 'Keys imported', 'created' => $created], 201);
    }
}
EOF

# ---------------------------------------------
# 3. Create frontend page: ManageKeys.jsx
# ---------------------------------------------
cd ../frontend || { echo "Frontend folder not found"; exit 1; }

cat > src/pages/ManageKeys.jsx << 'EOF'
import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon, UploadIcon } from '@heroicons/react/24/outline';

export default function ManageKeys() {
  const [keys, setKeys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [form, setForm] = useState({ key_number: '', room_number: '' });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkData, setBulkData] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    const res = await api.get('/keys');
    setKeys(res.data);
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
      setForm({ key_number: '', room_number: '' });
      fetchKeys();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving key');
    }
  };

  const handleDelete = async (id, keyNumber) => {
    if (!confirm(`Delete key ${keyNumber}?`)) return;
    try {
      await api.delete(`/keys/${id}`);
      toast.success('Key deleted');
      fetchKeys();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete key (maybe checked out)');
    }
  };

  const handleBulkImport = async () => {
    const lines = bulkData.trim().split(/\r?\n/);
    const keysArray = [];
    for (const line of lines) {
      const parts = line.split(/\s*,\s*/);
      keysArray.push({
        key_number: parts[0].trim(),
        room_number: parts[1]?.trim() || null,
      });
    }
    try {
      await api.post('/keys/bulk', { keys: keysArray });
      toast.success(`${keysArray.length} keys imported`);
      setBulkMode(false);
      setBulkData('');
      fetchKeys();
    } catch (err) {
      toast.error('Bulk import failed. Check format: key_number,room_number per line');
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
          <button onClick={() => { setEditingKey(null); setForm({ key_number: '', room_number: '' }); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <PlusIcon className="h-4 w-4" /> Add Key
          </button>
          <button onClick={() => setBulkMode(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <UploadIcon className="h-4 w-4" /> Bulk Import
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {keys.map(key => (
                <tr key={key.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key.key_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{key.room_number || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${key.current_status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <span className={`w-2 h-2 rounded-full ${key.current_status === 'present' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {key.current_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => { setEditingKey(key); setForm({ key_number: key.key_number, room_number: key.room_number || '' }); setShowModal(true); }} className="text-indigo-600 hover:text-indigo-800 mr-3"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(key.id, key.key_number)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingKey ? 'Edit Key' : 'Add New Key'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Key Number (e.g., K001)" className="w-full p-2 border rounded-lg" value={form.key_number} onChange={e => setForm({...form, key_number: e.target.value})} />
              <input type="text" placeholder="Room Number (optional)" className="w-full p-2 border rounded-lg" value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">Save</button>
              <button onClick={() => { setShowModal(false); setEditingKey(null); }} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-2">Bulk Import Keys</h2>
            <p className="text-sm text-gray-500 mb-3">Enter one key per line: <strong>key_number,room_number</strong><br />Example:<br />K101,Room 101<br />K102,</p>
            <textarea rows="8" className="w-full p-2 border rounded-lg font-mono text-sm" placeholder="K001,Room 1\nK002,Room 2" value={bulkData} onChange={e => setBulkData(e.target.value)}></textarea>
            <div className="flex gap-3 mt-6">
              <button onClick={handleBulkImport} className="flex-1 bg-green-600 text-white py-2 rounded-lg">Import</button>
              <button onClick={() => { setBulkMode(false); setBulkData(''); }} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
EOF

# ---------------------------------------------
# 4. Add route for ManageKeys in App.jsx (admin only)
# ---------------------------------------------
# Insert import and route
sed -i '/import AdminUsers/ a import ManageKeys from "./pages/ManageKeys";' src/App.jsx
# Insert route inside Layout, after admin/users
sed -i '/<Route path="\/admin\/users"/a \            <Route path="/admin/keys" element={<PrivateRoute requiredRole="admin"><ManageKeys /></PrivateRoute>} />' src/App.jsx

# ---------------------------------------------
# 5. Update Layout.jsx to show "Manage Keys" in sidebar for admin
# ---------------------------------------------
# We need to add a new nav item for admin. Since the navItems array is built before checking role, we'll modify layout.jsx to conditionally add a "Manage Keys" link.
# We'll replace the entire Layout.jsx with a version that includes the admin link.
# But to avoid breaking, we'll inject via sed or provide the updated file.
# We'll write a new Layout.jsx with the extra admin link.
cd src/components
cp Layout.jsx Layout.jsx.bak
cat > Layout.jsx << 'EOF'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, KeyIcon, ArrowLeftOnRectangleIcon, 
  ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, 
  CalendarDaysIcon, UserGroupIcon, ArrowPathIcon, Bars3Icon, XMarkIcon, CogIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/keys', label: 'Keys', icon: KeyIcon },
    { path: '/key-logs', label: 'Key Logs', icon: ClipboardDocumentListIcon },
    { path: '/collect', label: 'Collect Key', icon: ArrowRightOnRectangleIcon },
    { path: '/return', label: 'Return Key', icon: ArrowLeftOnRectangleIcon },
    { path: '/shift-handover', label: 'Shift Handover', icon: KeyIcon },
    { path: '/daily-logs', label: 'Daily Logs', icon: CalendarDaysIcon },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin/users', label: 'Manage Users', icon: UserGroupIcon });
    navItems.push({ path: '/admin/keys', label: 'Manage Keys', icon: CogIcon });
  }

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-20">
      <div className="flex justify-around items-center py-2">
        {navItems.slice(0, 4).map((item) => (
          <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={`flex flex-col items-center p-2 rounded-lg transition ${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-500'}`}>
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center p-2 rounded-lg text-gray-500">
          <Bars3Icon className="h-5 w-5" />
          <span className="text-xs mt-1">More</span>
        </button>
      </div>
    </div>
  );

  const MobileDrawer = () => (
    <div className={`fixed inset-0 z-30 md:hidden transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-gray-800">Menu</h2>
          <button onClick={() => setMobileMenuOpen(false)}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
        </div>
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 p-3 rounded-lg transition ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          <hr className="my-2" />
          <div className="p-3 text-sm text-gray-500"><p>{user?.name}</p><p className="capitalize text-xs">{user?.role}</p></div>
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50">
            <ArrowPathIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  const DesktopSidebar = () => (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-gradient-to-b from-indigo-800 to-indigo-900 text-white shadow-xl fixed h-full">
      <div className="p-5 border-b border-indigo-700"><h1 className="text-xl font-bold tracking-wide">UPSA Hostel Keys</h1><p className="text-xs text-indigo-200 mt-1">Key Management System</p></div>
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-indigo-700 text-white shadow-md' : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}`}>
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-indigo-700">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-indigo-200 capitalize">{user?.role}</p></div>
          <button onClick={handleLogout} className="p-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 transition"><ArrowPathIcon className="h-5 w-5" /></button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar />
      <MobileDrawer />
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
      <BottomNav />
    </div>
  );
}
EOF

cd ../..

echo "========================================="
echo "Admin Key Management added successfully!"
echo "Run: php artisan migrate (if needed)"
echo "Then restart backend and frontend."
echo "Admin can now access 'Manage Keys' from sidebar."
echo "========================================="