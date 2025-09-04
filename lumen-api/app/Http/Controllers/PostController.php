<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Facades\Cache;

class PostController extends Controller
{
    public function index()
    {
        return Cache::remember('posts:all', 60, function () {
            return Post::all();
        });
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|min:1|max:255',
            'content' => 'required|string|min:1|max:5000',
        ]);

        $post = Post::create([
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'user_id' => auth()->id(),
        ]);
        Cache::forget('posts:all');
        return response()->json($post, 201);
    }

    public function show($id)
    {
        return Cache::remember("posts:{$id}", 60, function () use ($id) {
            return Post::findOrFail($id);
        });
    }
}
