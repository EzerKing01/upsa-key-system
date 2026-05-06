<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin user
        User::updateOrCreate(
            ['email' => 'admin@upsa.edu'],
            [
                'name' => 'Admin User',
                'role' => 'admin',
                'password' => Hash::make('password'),
            ]
        );

        // Sample porter
        User::updateOrCreate(
            ['email' => 'porter@upsa.edu'],
            [
                'name' => 'John Porter',
                'role' => 'porter',
                'password' => Hash::make('password'),
            ]
        );

        // Additional porters (optional)
        User::updateOrCreate(
            ['email' => 'jane@upsa.edu'],
            [
                'name' => 'Jane Smith',
                'role' => 'porter',
                'password' => Hash::make('password'),
            ]
        );
    }
}