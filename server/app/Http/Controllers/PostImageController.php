<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\Post;
use App\Models\PostImage;
use Exception;

class PostImageController extends Controller
{
    // GET /api/posts/{postId}/images
    public function index($postId)
    {
        try {
            $images = PostImage::where('post_id', $postId)
                ->orderBy('sort_order')
                ->get()
                ->map(function ($img) {
                    $img->full_url = asset('storage/' . $img->url);
                    return $img;
                });

            return response()->json(['status' => true, 'data' => $images]);
        } catch (Exception $e) {
            Log::error('Lỗi lấy danh sách ảnh: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể lấy danh sách ảnh.'], 500);
        }
    }

    // POST /api/posts/{postId}/images (chỉ lessor hoặc admin)
    public function store(Request $request, $postId)
    {
        try {
            $user = Auth::user();
            $post = Post::find($postId);

            if (!$post) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy bài viết.'], 404);
            }

            // *Chỉ admin hoặc lessor là người tạo bài mới được thêm ảnh
            if (!in_array($user->role, ['admin', 'lessor']) || $post->user_id !== $user->id && $user->role !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Chỉ admin hoặc chủ bài viết mới được thêm ảnh.'
                ], 403);
            }

            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
                'sort_order' => 'nullable|integer|min:0'
            ]);

            $path = $request->file('image')->store('posts', 'public');

            $image = PostImage::create([
                'post_id' => $postId,
                'url' => $path,
                'sort_order' => $request->sort_order ?? 0
            ]);

            $image->full_url = asset('storage/' . $image->url);

            return response()->json([
                'status' => true,
                'message' => 'Thêm ảnh thành công.',
                'data' => $image
            ], 201);
        } catch (Exception $e) {
            Log::error('Lỗi thêm ảnh: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể thêm ảnh.'], 500);
        }
    }

    // PUT /api/posts/images/{id} (chỉ lessor hoặc admin)
    public function update(Request $request, $id)
    {
        try {
            $image = PostImage::find($id);
            if (!$image) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy ảnh.'], 404);
            }

            $user = Auth::user();
            $post = Post::find($image->post_id);

            // *Chỉ admin hoặc lessor là người tạo bài đó được sửa ảnh
            if (!in_array($user->role, ['admin', 'lessor']) || $post->user_id !== $user->id && $user->role !== 'admin') {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền sửa ảnh này.'], 403);
            }

            $request->validate([
                'sort_order' => 'nullable|integer|min:0'
            ]);

            $image->update([
                'sort_order' => $request->sort_order ?? $image->sort_order
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật ảnh thành công.',
                'data' => $image
            ]);
        } catch (Exception $e) {
            Log::error('Lỗi cập nhật ảnh: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể cập nhật ảnh.'], 500);
        }
    }

    // DELETE /api/posts/images/{id} (chỉ lessor hoặc admin)
    public function destroy($id)
    {
        try {
            $image = PostImage::find($id);
            if (!$image) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy ảnh.'], 404);
            }

            $user = Auth::user();
            $post = Post::find($image->post_id);

            // *Chỉ admin hoặc lessor là người tạo bài đó được xóa ảnh
            if (!in_array($user->role, ['admin', 'lessor']) || $post->user_id !== $user->id && $user->role !== 'admin') {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền xóa ảnh này.'], 403);
            }

            Storage::disk('public')->delete($image->url);
            $image->delete();

            return response()->json(['status' => true, 'message' => 'Xóa ảnh thành công.']);
        } catch (Exception $e) {
            Log::error('Lỗi xóa ảnh: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể xóa ảnh.'], 500);
        }
    }
}
