<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('key_logs', function (Blueprint $table) {
            $table->string('returned_by_student')->nullable()->after('returned_by');
        });
    }

    public function down()
    {
        Schema::table('key_logs', function (Blueprint $table) {
            $table->dropColumn('returned_by_student');
        });
    }
};