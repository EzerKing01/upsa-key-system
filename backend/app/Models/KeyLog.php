<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KeyLog extends Model
{
    use HasFactory;

    protected $table = 'key_logs';

    protected $fillable = [
        'key_id',
        'student_name',
        'student_id',
        'room_number',
        'date',
        'time_out',
        'checked_out_by',
        'time_in',
        'returned_by',
        'returned_by_student',
        'status'
    ];

    protected $casts = [
        'date' => 'date',
        'time_out' => 'string',
        'time_in' => 'string',
    ];

    public function checkedOutBy()
    {
        return $this->belongsTo(User::class, 'checked_out_by');
    }

    public function returnedBy()
    {
        return $this->belongsTo(User::class, 'returned_by');
    }

    public function key()
    {
        return $this->belongsTo(Key::class);
    }
}