<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\CloudinaryFile;
use App\Services\CloudinaryService;
use App\Http\Resources\BlogResource;
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

    // GET api/blogs
    public function index()
    {
        $blogs = BlogPost::with(['tags', 'images'])
            ->orderBy('published_at', 'DESC')
            ->paginate(10);

        return BlogResource::collection($blogs);
    }

    // GET api/blogs/{slug}
   public function show($slug)
{
    // Tạo query ban đầu
    $query = BlogPost::with(['tags', 'images']);

    // Kiểm tra thông minh: Nếu là số thì tìm theo ID, nếu là chữ thì tìm Slug
    if (is_numeric($slug)) {
        $query->where('id', $slug);
    } else {
        $query->where('slug', $slug);
    }

    // Thực hiện tìm kiếm
    $blog = $query->firstOrFail();

    return new BlogResource($blog);
}

    // POST api/blogs
    public function store(Request $request)
    {
        if ($r = $this->adminOnly()) return $r;

        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'tags' => 'array',
            'cover' => 'nullable|image|max:4096'
        ]);

        $post = BlogPost::create([
            'title' => $request->title,
            'slug' => $this->uniqueSlug($request->title),
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

        return new BlogResource($post->load(['tags', 'images']));
    }

    // PUT api/blogs/{id}
    public function update(Request $request, $id)
    {
        if ($r = $this->adminOnly()) return $r;

        $post = BlogPost::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string',
            'excerpt' => 'sometimes|nullable|string',
            'content' => 'sometimes|string',
            'tags' => 'sometimes|array',
            'cover' => 'sometimes|image|max:4096'
        ]);

        if ($request->filled('title') && $post->title !== $request->title) {
            $post->slug = $this->uniqueSlug($request->title);
        }

        $post->fill($request->only(['title', 'excerpt', 'content']));
        $post->save();

        if ($request->hasFile('cover')) {
            $this->deleteOldImages($post);
            $this->uploadImage($request->file('cover'), $post);
        }

        if ($request->has('tags')) {
            $request->tags
                ? $post->tags()->sync($request->tags)
                : $post->tags()->detach();
        }

        return new BlogResource($post->load(['tags', 'images']));
    }

    // DELETE api/blogs/{id}
    public function destroy($id)
    {
        if ($r = $this->adminOnly()) return $r;

        $post = BlogPost::findOrFail($id);

        $this->deleteOldImages($post);
        $post->tags()->detach();
        $post->delete();

        return ['message' => 'Xóa blog thành công'];
    }

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
