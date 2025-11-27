<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Notification;
use App\Models\User;
use App\Models\CloudinaryFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\CloudinaryService;
use Illuminate\Validation\ValidationException;
use Exception;

class PostController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    // GET api/posts
    public function index()
    {
        try {
            $posts = Post::with(['user:id,name,role', 'category:id,name', 'images', 'thumbnail'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['status' => true, 'data' => $posts]);
        } catch (Exception $e) {
            Log::error('Lỗi lấy danh sách bài viết: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể tải danh sách.'], 500);
        }
    }

    // GET api/posts/{id}
    public function show($id)
    {
        try {
            $post = Post::with(['user:id,name,role', 'category:id,name', 'images', 'thumbnail'])->find($id);

            if (!$post) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy bài viết.'], 404);
            }

            return response()->json(['status' => true, 'data' => $post]);
        } catch (Exception $e) {
            Log::error('Lỗi xem bài viết: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể xem bài viết.'], 500);
        }
    }

    // POST api/posts
    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            if (!in_array($user->role, ['lessor', 'admin'])) {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền đăng bài.'], 403);
            }

            $request->validate([
                'category_id' => 'required|exists:categories,id',
                'title' => 'required|string|max:255',
                'price' => 'required|integer|min:0',
                'area' => 'required|integer|min:1',
                'address' => 'required|string|max:255',
                'content' => 'nullable|string',
                'contact_phone' => 'nullable|string|max:20',
                'max_people' => 'nullable|integer|min:1',
                'province_id' => 'nullable|exists:provinces,id',
                'district_id' => 'nullable|exists:districts,id',
                'ward_id' => 'nullable|exists:wards,id',
            ]);

            $post = Post::create([
                'user_id' => $user->id,
                'category_id' => $request->category_id,
                'title' => $request->title,
                'price' => $request->price,
                'area' => $request->area,
                'address' => $request->address,
                // 'content' => $request->content,
                'contact_phone' => $request->contact_phone,
                'max_people' => $request->max_people,
                'province_id' => $request->province_id,
                'district_id' => $request->district_id,
                'ward_id' => $request->ward_id,
                'status' => 'published',
                'published_at' => now(),
            ]);

            // gửi thông báo admin
            if ($user->role === 'lessor') {
                foreach (User::admins()->get() as $admin) {
                    Notification::create([
                        'user_id' => $admin->id,
                        'type' => 'post_created',
                        'content' => "{$user->name} vừa đăng bài: {$post->title}",
                    ]);
                }
            }

            return response()->json(['status' => true, 'message' => 'Thêm bài thành công.', 'data' => $post], 201);

        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            Log::error('Lỗi thêm bài viết: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể thêm bài viết.'], 500);
        }
    }

    // POST api/posts/{id}/thumbnail (upload thumbnail)
    public function uploadThumbnail(Request $request, $id)
    {
        try {
            $post = Post::find($id);

            if (!$post) return response()->json(['status' => false, 'message' => 'Không tìm thấy bài viết.'], 404);

            $user = Auth::user();

            if ($user->role !== 'admin' && $post->user_id !== $user->id) {
                return response()->json(['status' => false, 'message' => 'Không có quyền đổi thumbnail.'], 403);
            }

            $request->validate([
                'thumbnail' => 'required|image|mimes:jpeg,png,jpg|max:4096'
            ]);

            // Xóa thumbnail cũ
            if ($post->thumbnail) {
                $this->cloudinary->delete($post->thumbnail->public_id);
                $post->thumbnail->delete();
            }

            // Upload Cloudinary
            $upload = $this->cloudinary->upload(
                $request->file('thumbnail')->getRealPath(),
                'post_thumbnails'
            );

            // Lưu vào cloudinary_files
            CloudinaryFile::create([
                'model_type' => Post::class,
                'model_id'   => $post->id,
                'public_id'  => $upload['public_id'],
                'url'        => $upload['secure_url'],
                'type'       => 'thumbnail',
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật thumbnail thành công.',
                'thumbnail_url' => $upload['secure_url']
            ]);

        } catch (Exception $e) {
            Log::error("Lỗi cập nhật thumbnail: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể cập nhật thumbnail.'], 500);
        }
    }

    // PUT api/posts/{id}
    public function update(Request $request, $id)
    {
        try {
            $post = Post::find($id);
            if (!$post) return response()->json(['status' => false, 'message' => 'Không tìm thấy bài viết.'], 404);

            $user = Auth::user();

            if ($user->role !== 'admin' && $post->user_id !== $user->id) {
                return response()->json(['status' => false, 'message' => 'Không có quyền sửa bài.'], 403);
            }

            $post->update($request->only([
                'category_id', 'title', 'price', 'area', 'address',
                'content', 'contact_phone', 'status',
                'max_people', 'province_id', 'district_id', 'ward_id'
            ]));

            return response()->json(['status' => true, 'message' => 'Cập nhật bài thành công.', 'data' => $post]);

        } catch (Exception $e) {
            Log::error('Lỗi cập nhật bài viết: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể cập nhật bài viết.'], 500);
        }
    }

    // DELETE api/posts/{id}
    public function destroy($id)
    {
        try {
            $post = Post::with('thumbnail')->find($id);
            if (!$post) return response()->json(['status' => false, 'message' => 'Không tìm thấy bài viết.'], 404);

            $user = Auth::user();

            if ($user->role !== 'admin' && $post->user_id !== $user->id) {
                return response()->json(['status' => false, 'message' => 'Không có quyền xóa bài.'], 403);
            }

            // Xóa thumbnail Cloudinary
            if ($post->thumbnail) {
                $this->cloudinary->delete($post->thumbnail->public_id);
                $post->thumbnail->delete();
            }

            $post->delete();

            return response()->json(['status' => true, 'message' => 'Xóa bài viết thành công.']);

        } catch (Exception $e) {
            Log::error('Lỗi xóa bài viết: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể xóa bài viết.'], 500);
        }
    }
}
