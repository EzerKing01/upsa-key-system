<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KeyLog;
use App\Models\User;
use Carbon\Carbon;

class KeyLogSeeder extends Seeder
{
    public function run()
    {
        $porterIds = User::where('role', 'porter')->pluck('id')->toArray();
        if (empty($porterIds)) {
            $porterIds = [1]; // fallback
        }

        // Sample check‑outs from the last 7 days
        for ($day = 0; $day <= 7; $day++) {
            $date = Carbon::today()->subDays($day);
            // Create 3–5 random logs per day
            $numLogs = rand(3, 5);
            for ($i = 1; $i <= $numLogs; $i++) {
                $checkedOutBy = $porterIds[array_rand($porterIds)];
                $timeOut = Carbon::createFromTime(rand(8, 20), rand(0, 59), 0);
                $status = (rand(0, 1) == 0) ? 'OUT' : 'RETURNED';
                $timeIn = null;
                $returnedBy = null;
                $returnedByStudent = null;

                if ($status === 'RETURNED') {
                    $timeIn = $timeOut->copy()->addHours(rand(1, 8));
                    $returnedBy = $porterIds[array_rand($porterIds)];
                    $returnedByStudent = (rand(0, 1) == 0) ? 'Student ' . rand(100, 999) : null;
                }

                KeyLog::create([
                    'student_name' => 'Student ' . rand(100, 999),
                    'student_id' => 'STS' . rand(1000, 9999),
                    'room_number' => 'Room ' . rand(1, 50),
                    'date' => $date,
                    'time_out' => $timeOut->format('H:i:s'),
                    'checked_out_by' => $checkedOutBy,
                    'time_in' => $timeIn ? $timeIn->format('H:i:s') : null,
                    'returned_by' => $returnedBy,
                    'returned_by_student' => $returnedByStudent,
                    'status' => $status,
                ]);
            }
        }

        // Add a currently active (OUT) key for today
        KeyLog::create([
            'student_name' => 'Kwame Asare',
            'student_id' => 'SID001',
            'room_number' => 'A101',
            'date' => Carbon::today(),
            'time_out' => '09:30:00',
            'checked_out_by' => $porterIds[0],
            'time_in' => null,
            'returned_by' => null,
            'returned_by_student' => null,
            'status' => 'OUT',
        ]);
    }
}