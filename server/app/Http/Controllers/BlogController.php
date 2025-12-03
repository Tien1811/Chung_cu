<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\CloudinaryFile;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    protected $cloud;

    public function __construct(CloudinaryService $cloud)
    {
        $this->cloud = $cloud;
    }

    private function adminOnly()
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }

    private function uniqueSlug($title)
    {
        $slug = Str::slug($title);
        $base = $slug;
        $i = 1;

        while (DB::table('blog_posts')->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    // GET api/blogs (xem danh sách blog)
    public function index()
    {
        return BlogPost::with(['tags', 'images'])
            ->orderBy('published_at', 'DESC')
            ->paginate(10);
    }

    // GET api/blogs/{slug} (xem chi tiết blog)
    public function show($slug)
    {
        return BlogPost::with(['tags', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    // POST api/blogs (tạo blog mới)
    public function store(Request $request)
    {
        if ($r = $this->adminOnly()) return $r;

        $request->validate([
            'title' => 'required',
            'content' => 'required',
            'excerpt' => 'nullable',
            'tags' => 'array',
            'cover' => 'nullable|image|max:4096'
        ]);

        $slug = $this->uniqueSlug($request->title);

        $post = BlogPost::create([
            'title' => $request->title,
            'slug' => $slug,
            'excerpt' => $request->excerpt,
            'content' => $request->input('content'),
            'published_at' => now()
        ]);

        if ($request->hasFile('cover')) {
            $this->uploadImage($request->file('cover'), $post);
        }

        if ($request->tags) {
            $post->tags()->sync($request->tags);
        }

        return $post->load(['tags', 'images']);
    }

    // POST api/blogs/{id}/update (cập nhật blog)
    public function update(Request $request, $id)
    {
        if ($r = $this->adminOnly()) return $r;

        $post = BlogPost::findOrFail($id);

        // Cho phép update từng field
        $request->validate([
            'title'   => 'sometimes|string',
            'excerpt' => 'sometimes|nullable|string',
            'content' => 'sometimes|string',
            'tags'    => 'sometimes|array',
            'cover'   => 'sometimes|image|max:4096'
        ]);

        // Nếu có title → update slug nếu đổi
        if ($request->filled('title') && $post->title !== $request->title) {
            $post->slug = $this->uniqueSlug($request->title);

        }

        // Update từng field (chỉ field được gửi)
        $post->fill($request->only(['title', 'excerpt', 'content']));
        $post->save();

        // Nếu có ảnh mới
        if ($request->hasFile('cover')) {
            $this->deleteOldImages($post);
            $this->uploadImage($request->file('cover'), $post);
        }

        // Nếu người dùng gửi tags[] thì mới update tags
        if ($request->has('tags')) {
            if ($request->tags) {
                $post->tags()->sync($request->tags);
            } else {
                $post->tags()->detach();
            }
        }

        return $post->load(['tags', 'images']);
    }

    // DELETE api/blogs/{id} (xóa blog)
    public function destroy($id)
    {
        if ($r = $this->adminOnly()) return $r;

        $post = BlogPost::findOrFail($id);

        $this->deleteOldImages($post);
        $post->tags()->detach();
        $post->delete();

        return ['message' => 'xóa Blog thành công'];
    }


    // Giúp hỗ trợ up ảnh lên Cloudinary và lưu vào DB
    private function uploadImage($file, BlogPost $post)
    {
        $upload = $this->cloud->upload($file->getRealPath(), 'blog_images');

        return CloudinaryFile::create([
            'public_id'  => $upload['public_id'],
            'url'        => $upload['secure_url'],
            'type'       => 'blog_image',
            'model_type' => BlogPost::class,
            'model_id'   => $post->id
        ]);
    }

    private function deleteOldImages(BlogPost $post)
    {
        foreach ($post->images as $img) {
            $this->cloud->delete($img->public_id);
            $img->delete();
        }
    }
}
