<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notification;
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

        // THÔNG BÁO: user đã lưu bài
        Notification::create([
            'user_id' => $user->id,
            'type' => 'saved_post',
            'content' => 'Bạn đã lưu bài đăng: "' . $post->title . '"'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Lưu bài thành công.'
        ], 201);
    }

    // DELETE /api/saved-posts/{post_id}
    public function unsave($post_id)
    {
        $user = Auth::user();

        // Lấy post để dùng title
        $post = Post::find($post_id);

        if (!$user->savedPosts()->where('post_id', $post_id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Bài viết chưa được lưu.'
            ], 404);
        }

        $user->savedPosts()->detach($post_id);

        // THÔNG BÁO: user đã bỏ lưu
        Notification::create([
            'user_id' => $user->id,
            'type' => 'unsaved_post',
            'content' => 'Bạn đã bỏ lưu bài đăng: "' . $post->title . '"'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Đã bỏ lưu bài viết.'
        ]);
    }

    // GET /api/saved-posts/check/{post_id}
    public function checkSaved($post_id)
    {
        $user = Auth::user();

        $isSaved = $user->savedPosts()->where('post_id', $post_id)->exists();

        return response()->json([
            'status' => true,
            'data' => [
                'post_id' => $post_id,
                'is_saved' => $isSaved,
            ],
        ]);
    }

    // GET /api/saved-posts/ids
    // Lấy danh sách ID của các bài đã lưu
    public function getSavedIds()
    {
        $user = Auth::user();

        $savedIds = $user->savedPosts()->pluck('post_id')->toArray();

        return response()->json([
            'status' => true,
            'data' => $savedIds,
        ]);
    }

    /** 
     * ADMIN 
    **/

    // GET /api/admin/saved-posts
    public function adminIndex(Request $request)
    {
        $admin = Auth::user();
        if (!$admin || $admin->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $q = $request->query('q');

        $query = \DB::table('saved_posts')
            ->join('users', 'saved_posts.user_id', '=', 'users.id')
            ->join('posts', 'saved_posts.post_id', '=', 'posts.id')
            ->select(
                'saved_posts.id',
                'saved_posts.created_at',
                'users.id as user_id',
                'users.name',
                'users.email',
                'posts.id as post_id',
                'posts.title'
            )
            ->orderBy('saved_posts.id', 'DESC');

        if ($q) {
            $query->where('users.email', 'like', "%$q%")
                ->orWhere('users.name', 'like', "%$q%")
                ->orWhere('posts.title', 'like', "%$q%");
        }

        $data = $query->get()->map(fn($it) => [
            'id' => $it->id,
            'created_at' => $it->created_at,
            'user' => [
                'id' => $it->user_id,
                'name' => $it->name,
                'email' => $it->email,
            ],
            'post' => [
                'id' => $it->post_id,
                'title' => $it->title,
            ]
        ]);

        return response()->json([
            'status' => true,
            'data' => $data
        ]);
    }

    // DELETE /api/admin/saved-posts/{id}
    public function adminDelete($id)
    {
        $admin = Auth::user();
        if (!$admin || $admin->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $row = \DB::table('saved_posts')->where('id', $id)->first();

        if (!$row) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy'], 404);
        }

        \DB::table('saved_posts')->where('id', $id)->delete();

        return response()->json(['status' => true, 'message' => 'Xoá thành công']);
    }

}
