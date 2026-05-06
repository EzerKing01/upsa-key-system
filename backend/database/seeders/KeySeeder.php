<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Key;

class KeySeeder extends Seeder
{
    public function run()
    {
        // 50 dummy keys
        for ($i = 1; $i <= 50; $i++) {
            Key::updateOrCreate(
                ['code' => 'K' . str_pad($i, 3, '0', STR_PAD_LEFT)],
                [
                    'name' => 'Room ' . $i,
                    'status' => 'active',
                ]
            );
        }

        // Extra keys with names
        $extraKeys = [
            ['code' => 'M001', 'name' => 'Main Entrance', 'status' => 'active'],
            ['code' => 'B001', 'name' => 'Back Gate', 'status' => 'active'],
            ['code' => 'O001', 'name' => 'Office 101', 'status' => 'active'],
        ];
        foreach ($extraKeys as $key) {
            Key::updateOrCreate(['code' => $key['code']], $key);
        }
    }
}