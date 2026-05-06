<!DOCTYPE html>
<html>
<head><title>Daily Key Logs - {{ $date }}</title><style>body{font-family:sans-serif;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}</style></head>
<body><h2>UPSA Hostel Key Logs - {{ $date }}</h2>
<table><thead><tr><th>Student Name</th><th>Student ID</th><th>Room</th><th>Time Out</th><th>Time In</th><th>Status</th></tr></thead>
<tbody>@foreach($logs as $log)<tr><td>{{ $log->student_name }}</td><td>{{ $log->student_id }}</td><td>{{ $log->room_number }}</td><td>{{ $log->time_out }}</td><td>{{ $log->time_in ?? '—' }}</td><td>{{ $log->status }}</td></tr>@endforeach</tbody>
</table></body></html>
