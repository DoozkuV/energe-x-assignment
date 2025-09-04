<?php

namespace Tests;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PostTest extends TestCase
{
    protected $token;

    public function setUp(): void
    {
        parent::setUp();

        // Create a user
        $user = User::create([
            'name' => 'Charlie',
            'email' => 'charlie@example.com',
            'password' => Hash::make('secret'),
        ]);

        // Login to get JWT
        $response = $this->post('/api/login', [
            'email' => 'charlie@example.com',
            'password' => 'secret',
        ]);

        $data = json_decode($this->response->getContent(), true);
        $this->token = $data['token'];
    }

    /** @test */
    public function it_cannot_create_post_without_auth()
    {
        $this->post('/api/posts', [
            'title' => 'Unauthorized Post',
            'content' => 'This should fail',
        ]);

        $this->seeStatusCode(401);
    }

    /** @test */
    public function it_can_create_a_post_with_auth()
    {
        $this->post('/api/posts', [
            'title' => 'My First Post',
            'content' => 'Hello world!',
        ], ['Authorization' => "Bearer {$this->token}"]);

        $this->seeStatusCode(201)
             ->seeJsonContains(['title' => 'My First Post']);
    }

    /** @test */
    public function it_validates_post_fields()
    {
        $this->post('/api/posts', [
            'title' => '',
            'content' => '',
        ], ['Authorization' => "Bearer {$this->token}"]);

        $this->seeStatusCode(422)
             ->seeJsonContains(['error' => 'Validation failed']);
    }

    /** @test */
    public function it_can_fetch_posts()
    {
        $this->get('/api/posts', ['Authorization' => "Bearer {$this->token}"]);

        $this->seeStatusCode(200);
    }
}
