<?php

namespace App\Http\Controllers;

use App\Models\Key;
use App\Models\KeyLog;

class KeyListController extends Controller
{
    public function index()
    {
        return response()->json(Key::all(['id', 'name', 'code', 'status']));
    }

    public function logs($id)
    {
        $logs = KeyLog::where('key_id', $id)
            ->with(['checkedOutBy', 'returnedBy'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($logs);
    }
}