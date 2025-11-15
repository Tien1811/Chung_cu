<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Post;

class SavedPostController extends Controller
{
    // GET /api/saved-posts
    public function index()
    {
        $user = Auth::user();

        $savedPosts = $user->savedPosts()->with('images', 'category')->get();

        return response()->json([
            'status' => true,
            'data' => $savedPosts
        ]);
    }

    // POST /api/saved-posts/{post_id}
    public function save($post_id)
    {
        $user = Auth::user();

        $post = Post::find($post_id);
        if (!$post) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy bài đăng.'
            ], 404);
        }

        // Nếu đã lưu rồi thì không lưu nữa
        if ($user->savedPosts()->where('post_id', $post_id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Bài viết đã được lưu trước đó.'
            ], 409); // 409 Conflict
        }

        $user->savedPosts()->attach($post_id);

        return response()->json([
            'status' => true,
            'message' => 'Lưu bài thành công.'
        ], 201);
    }

    // DELETE /api/saved-posts/{post_id}
    public function unsave($post_id)
    {
        $user = Auth::user();

        if (!$user->savedPosts()->where('post_id', $post_id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Bài viết chưa được lưu.'
            ], 404);
        }

        $user->savedPosts()->detach($post_id);

        return response()->json([
            'status' => true,
            'message' => 'Đã bỏ lưu bài viết.'
        ]);
    }
}
