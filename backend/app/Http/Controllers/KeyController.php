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

    public function index()
    {
        return response()->json(Key::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:keys,code',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $key = Key::create($validated);
        return response()->json($key, 201);
    }

    public function update(Request $request, $id)
    {
        $key = Key::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', Rule::unique('keys')->ignore($key->id)],
            'status' => 'sometimes|in:active,inactive',
        ]);

        $key->update($validated);
        return response()->json($key);
    }

    public function destroy($id)
    {
        $key = Key::findOrFail($id);
        $key->delete();
        return response()->json(['message' => 'Key deleted']);
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'keys' => 'required|array',
            'keys.*.name' => 'required|string|max:255',
            'keys.*.code' => 'required|string|unique:keys,code',
        ]);

        $created = [];
        foreach ($request->keys as $keyData) {
            $created[] = Key::create([
                'name' => $keyData['name'],
                'code' => $keyData['code'],
                'status' => 'active',
            ]);
        }

        return response()->json(['message' => 'Keys imported', 'created' => $created], 201);
    }
}