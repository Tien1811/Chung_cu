<?php

namespace App\Http\Controllers;

use App\Models\BlogTag;
use Illuminate\Http\Request;

class BlogTagController extends Controller
{
    private function adminOnly()
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }

    // GET api/blog-tags (xem danh sách tag)
    public function index()
    {
        return BlogTag::orderBy('name')->get();
    }

    // GET api/blog-tags/{slug} (xem chi tiết tag)
    public function show($slug)
    {
        return BlogTag::with('posts')->where('slug', $slug)->firstOrFail();
    }

    // POST api/blog-tags (tạo tag mới)
    public function store(Request $request)
    {
        if ($r = $this->adminOnly()) return $r;

        $request->validate(['name' => 'required']);

        return BlogTag::create(['name' => $request->name]);
    }

    // POST api/blog-tags/{tag}/update (cập nhật tag)
    public function update(Request $request, BlogTag $tag)
    {
        if ($r = $this->adminOnly()) return $r;

        $request->validate(['name' => 'required']);

        $tag->update(['name' => $request->name]);

        return $tag;
    }

    // DELETE api/blog-tags/{tag} (xóa tag)
    public function destroy(BlogTag $tag)
    {
        if ($r = $this->adminOnly()) return $r;

        $tag->posts()->detach();
        $tag->delete();

        return ['message' => 'xóa Tag thành công'];
    }
}