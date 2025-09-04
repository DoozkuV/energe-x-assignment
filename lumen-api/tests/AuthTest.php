<?php

namespace Tests;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthTest extends TestCase
{
    /** @test */
    public function it_can_register_a_user()
    {
        $response = $this->post('/api/register', [
            'name' => 'Alice',
            'email' => 'alice@example.com',
            'password' => 'secret',
        ]);

        $response->seeStatusCode(201)
                 ->seeJsonContains(['email' => 'alice@example.com']);
    }

    /** @test */
    public function it_can_login_and_get_a_token()
    {
        $user = User::create([
            'name' => 'Bob',
            'email' => 'bob@example.com',
            'password' => Hash::make('secret'),
        ]);

        $response = $this->post('/api/login', [
            'email' => 'bob@example.com',
            'password' => 'secret',
        ]);

        $response->seeStatusCode(200)
                 ->seeJsonStructure(['token']);
    }
}
