<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('key_logs', function (Blueprint $table) {
            $table->id();
            $table->string('student_name');
            $table->string('student_id');
            $table->string('room_number');
            $table->date('date');
            $table->time('time_out');
            $table->foreignId('checked_out_by')->nullable()->constrained('users')->onDelete('set null');
            $table->time('time_in')->nullable();
            $table->foreignId('returned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['OUT', 'RETURNED'])->default('OUT');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('key_logs');
    }
};