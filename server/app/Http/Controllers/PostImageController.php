<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Post;
use App\Models\PostImage;
use App\Models\CloudinaryFile;
use App\Services\CloudinaryService;
use Exception;

class PostImageController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    // GET /api/posts/{postId}/images
    public function index($postId)
    {
        try {
            $images = PostImage::with('file')
                ->where('post_id', $postId)
                ->orderBy('sort_order')
                ->get()
                ->map(function ($img) {
                    $img->full_url = $img->file ? $img->file->url : null;
                    return $img;
                });

            return response()->json(['status' => true, 'data' => $images]);
        } catch (Exception $e) {
            Log::error('Lỗi lấy danh sách ảnh: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể lấy danh sách ảnh.'], 500);
        }
    }

    // POST /api/posts/{postId}/images
    public function store(Request $request, $postId)
    {
        try {
            $user = Auth::user();
            $post = Post::find($postId);

            if (!$post) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy bài viết.'], 404);
            }

            if (!in_array($user->role, ['admin', 'lessor']) || ($post->user_id !== $user->id && $user->role !== 'admin')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Chỉ admin hoặc chủ bài viết mới được thêm ảnh.'
                ], 403);
            }

            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg|max:4096',
                'sort_order' => 'nullable|integer|min:0'
            ]);

            // Upload ảnh lên Cloudinary
            $upload = $this->cloudinary->upload(
                $request->file('image')->getRealPath(),
                'post_images'
            );

            // Tạo PostImage
            $image = PostImage::create([
                'post_id' => $postId,
                'sort_order' => $request->sort_order ?? 0
            ]);

            // Lưu vào cloudinary_files
            CloudinaryFile::create([
                'model_type' => PostImage::class,
                'model_id'   => $image->id,
                'public_id'  => $upload['public_id'],
                'url'        => $upload['secure_url'],
                'type'       => 'post_image',
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Thêm ảnh thành công.',
                'data' => [
                    'id' => $image->id,
                    'post_id' => $image->post_id,
                    'sort_order' => $image->sort_order,
                    'url' => $upload['secure_url']
                ]
            ], 201);

        } catch (Exception $e) {
            Log::error("Lỗi thêm ảnh: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể thêm ảnh.'], 500);
        }
    }

    // PUT /api/posts/images/{id}
    public function update(Request $request, $id)
    {
        try {
            $image = PostImage::find($id);
            if (!$image) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy ảnh.'], 404);
            }

            $user = Auth::user();
            $post = Post::find($image->post_id);

            if (!in_array($user->role, ['admin', 'lessor']) || ($post->user_id !== $user->id && $user->role !== 'admin')) {
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

    // DELETE /api/posts/images/{id}
    public function destroy($id)
    {
        try {
            $image = PostImage::with('file')->find($id);
            if (!$image) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy ảnh.'], 404);
            }

            $user = Auth::user();
            $post = Post::find($image->post_id);

            if (!in_array($user->role, ['admin', 'lessor']) || ($post->user_id !== $user->id && $user->role !== 'admin')) {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền xóa ảnh này.'], 403);
            }

            // Xóa trên Cloudinary + DB
            if ($image->file) {
                $this->cloudinary->delete($image->file->public_id);
                $image->file->delete();
            }

            $image->delete();

            return response()->json([
                'status' => true,
                'message' => 'Xóa ảnh thành công.'
            ]);

        } catch (Exception $e) {
            Log::error('Lỗi xóa ảnh: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể xóa ảnh.'], 500);
        }
    }
}
