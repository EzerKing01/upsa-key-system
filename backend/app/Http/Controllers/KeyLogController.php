<?php

namespace App\Http\Controllers;

use App\Models\KeyLog;
use App\Models\Key;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class KeyLogController extends Controller
{
    public function index(Request $request)
    {
        $query = KeyLog::with(['checkedOutBy', 'returnedBy', 'key']);

        if ($request->search) {
            $query->where('student_name', 'LIKE', "%{$request->search}%")
                  ->orWhere('student_id', 'LIKE', "%{$request->search}%")
                  ->orWhere('room_number', 'LIKE', "%{$request->search}%");
        }

        return response()->json($query->orderBy('date', 'desc')->orderBy('time_out', 'desc')->paginate(15));
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'key_id'        => 'required|exists:keys,id',
                'student_name'  => 'required|string|max:255',
                'student_id'    => 'required|string|max:255',
                'time_out'      => 'required|date_format:H:i',
            ]);

            $key = Key::findOrFail($validated['key_id']);

            // Check if key is active
            if ($key->status !== 'active') {
                return response()->json(['error' => 'Key is not active'], 422);
            }

            // Check for existing active checkout
            $activeLog = KeyLog::where('key_id', $validated['key_id'])
                ->whereDate('date', Carbon::today())
                ->where('status', 'OUT')
                ->first();

            if ($activeLog) {
                return response()->json([
                    'error' => 'Key already checked out',
                    'details' => [
                        'student_name' => $activeLog->student_name,
                        'student_id'   => $activeLog->student_id,
                        'room_number'  => $activeLog->room_number,
                        'time_out'     => $activeLog->time_out,
                    ]
                ], 409);
            }

            $log = KeyLog::create([
                'key_id'          => $validated['key_id'],
                'student_name'    => $validated['student_name'],
                'student_id'      => $validated['student_id'],
                'room_number'     => $key->name, // using key's name as room
                'date'            => Carbon::today(),
                'time_out'        => $validated['time_out'],
                'checked_out_by'  => auth()->id(),
                'status'          => 'OUT',
            ]);

            return response()->json($log, 201);
        } catch (\Exception $e) {
            \Log::error('Key checkout error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $log = KeyLog::findOrFail($id);

        if ($log->status === 'RETURNED') {
            return response()->json(['error' => 'Key already returned'], 409);
        }

        $request->validate([
            'time_in'              => 'required|date_format:H:i',
            'returned_by_student'  => 'nullable|string|max:255',
        ]);

        $log->update([
            'time_in'              => $request->time_in,
            'status'               => 'RETURNED',
            'returned_by'          => auth()->id(),
            'returned_by_student'  => $request->returned_by_student,
        ]);

        return response()->json($log);
    }

    public function todayStats()
    {
        $today = Carbon::today();
        $totalOut = KeyLog::whereDate('date', $today)->where('status', 'OUT')->count();
        $returnedToday = KeyLog::whereDate('date', $today)->where('status', 'RETURNED')->count();
        $recent = KeyLog::whereDate('date', $today)
            ->with('key')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'total_out'        => $totalOut,
            'returned_today'   => $returnedToday,
            'recent_activity'  => $recent,
        ]);
    }

    public function shiftHandover()
    {
        return response()->json(KeyLog::where('status', 'OUT')->with('key')->get());
    }

    public function dailyLogs()
    {
        $logs = KeyLog::with(['checkedOutBy', 'returnedBy', 'key'])
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy(fn($log) => Carbon::parse($log->date)->format('Y-m-d'));
        return response()->json($logs);
    }

    public function exportPdf($date)
    {
        $logs = KeyLog::whereDate('date', $date)->with('key')->get();
        $pdf = Pdf::loadView('pdf.daily_logs', ['logs' => $logs, 'date' => $date]);
        return $pdf->download("key_logs_{$date}.pdf");
    }
}