<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('key_logs', function (Blueprint $table) {
            $table->foreignId('key_id')->nullable()->after('id')->constrained('keys')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('key_logs', function (Blueprint $table) {
            $table->dropForeign(['key_id']);
            $table->dropColumn('key_id');
        });
    }
};