<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Category;
use Exception;

class CategoryController extends Controller
{
    // GET /api/categories (xem tất cả)
    public function index()
    {
        try {
            $categories = Category::select('id', 'slug', 'name')->orderBy('name')->get();
            return response()->json(['status' => true, 'data' => $categories]);
        } catch (Exception $e) {
            Log::error('Lỗi lấy danh sách danh mục: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể lấy danh sách danh mục.'], 500);
        }
    }

    // GET /api/categories/{id} (xem chi tiết)
    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy danh mục.'], 404);
        }
        return response()->json(['status' => true, 'data' => $category]);
    }

    // POST /api/categories (chỉ admin thêm)
    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được thêm danh mục.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:191',
            'slug' => 'nullable|string|max:100|unique:categories,slug'
        ]);

        try {
            $category = Category::create([
                'slug' => $request->slug ?? \Str::slug($request->name, '-'),
                'name' => $request->name
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Thêm danh mục thành công.',
                'data' => $category
            ], 201);
        } catch (Exception $e) {
            Log::error('Lỗi thêm danh mục: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Không thể thêm danh mục.'], 500);
        }
    }

    // PUT /api/categories/{id} (chỉ admin sửa)
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được sửa danh mục.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:191',
            'slug' => 'nullable|string|max:100|unique:categories,slug,' . $id
        ]);

        $category = Category::find($id);
        if (!$category) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy danh mục.'], 404);
        }

        $category->update([
            'slug' => $request->slug ?? $category->slug,
            'name' => $request->name
        ]);

        return response()->json(['status' => true, 'message' => 'Cập nhật danh mục thành công.', 'data' => $category]);
    }

    // DELETE /api/categories/{id} (chỉ admin xóa)
    public function destroy($id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được xóa danh mục.'], 403);
        }

        $category = Category::find($id);
        if (!$category) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy danh mục.'], 404);
        }

        $category->delete();
        return response()->json(['status' => true, 'message' => 'Xóa danh mục thành công.']);
    }

    // GET /api/categories/{id}/posts (lấy bài viết theo danh mục)
    public function getPostsByCategory($id)
    {
        try {
            $category = Category::find($id);
            if (!$category) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy danh mục.'
                ], 404);
            }

            $posts = $category->posts()
                ->with(['user:id,name', 'images'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                ],
                'posts' => $posts
            ], 200);
        } catch (Exception $e) {
            \Log::error('Lỗi lấy bài viết theo danh mục: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Không thể lấy danh sách bài viết.'
            ], 500);
        }
    }
}