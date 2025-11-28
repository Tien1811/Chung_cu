<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\BlogPost;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    // GET /api/posts/search (tìm kiếm bài viết với bộ lọc)
    public function search(Request $request)
    {
        $query = Post::query()
            ->with(['thumbnail', 'images', 'amenities', 'environmentFeatures']);

        // Tìm theo tên bài viết
        if ($request->title) {
            $query->where('title', 'LIKE', '%' . $request->title . '%');
        }

        // Category
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Địa chỉ
        if ($request->province_id) {
            $query->where('province_id', $request->province_id);
        }
        if ($request->district_id) {
            $query->where('district_id', $request->district_id);
        }
        if ($request->ward_id) {
            $query->where('ward_id', $request->ward_id);
        }

        // Giá
        if ($request->price_min) $query->where('price', '>=', $request->price_min);
        if ($request->price_max) $query->where('price', '<=', $request->price_max);

        // Diện tích
        if ($request->area_min) $query->where('area', '>=', $request->area_min);
        if ($request->area_max) $query->where('area', '<=', $request->area_max);


        // AMENITIES (TIỆN ÍCH)
        if ($request->amenities && is_array($request->amenities)) {
            $query->whereHas('amenities', function ($q) use ($request) {
                $q->whereIn('amenities.id', $request->amenities);
            });
        }

        // ENVIRONMENT FEATURES (MÔI TRƯỜNG SỐNG)
        if ($request->environment_features && is_array($request->environment_features)) {
            $query->whereHas('environmentFeatures', function ($q) use ($request) {
                $q->whereIn('environment_features.id', $request->environment_features);
            });
        }

        // Sorting (tăng dần, giảm dần)
        if ($request->sort) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc'); break;
                case 'price_desc':
                    $query->orderBy('price', 'desc'); break;
                case 'area_asc':
                    $query->orderBy('area', 'asc'); break;
                case 'area_desc':
                    $query->orderBy('area', 'desc'); break;
                case 'newest':
                    $query->orderBy('created_at', 'desc'); break;
                case 'oldest':
                    $query->orderBy('created_at', 'asc'); break;
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $posts = $query->paginate(10);

        if ($posts->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy bài viết phù hợp.'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $posts
        ]);
    }

    // GET /api/posts/{id}/similar  (tương tự bài viết)
    public function similarPosts($id)
    {
        $post = Post::with(['amenities', 'environmentFeatures'])->find($id);
        if (!$post) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy bài viết.'
            ], 404);
        }

        $amenityIds = $post->amenities->pluck('id')->toArray();
        $envIds = $post->environmentFeatures->pluck('id')->toArray();

        $similar = Post::with(['thumbnail', 'images', 'amenities', 'environmentFeatures'])
            ->where('id', '!=', $post->id)
            ->get()
            ->map(function ($p) use ($post, $amenityIds, $envIds) {

                $score = 0;

                // --- Category ---
                if ($p->category_id == $post->category_id) {
                    $score += 40;
                }

                // --- Amenities ---
                $commonAmenities = $p->amenities->pluck('id')->intersect($amenityIds)->count();
                $score += $commonAmenities * 5;

                // --- Environment ---
                $commonEnv = $p->environmentFeatures->pluck('id')->intersect($envIds)->count();
                $score += $commonEnv * 5;

                // --- Location ---
                if ($p->province_id == $post->province_id) $score += 10;
                if ($p->district_id == $post->district_id) $score += 10;

                $p->similarity_score = $score;
                return $p;
            })
            ->sortByDesc('similarity_score')
            ->take(10)
            ->values();

        return response()->json([
            'status' => true,
            'data' => $similar
        ]);
    }

    // GET /api/blogs/search (tìm kiếm blog)
    public function blogSearch(Request $request)
    {
        $keyword = trim($request->keyword);

        if (!$keyword) {
            return response()->json([
                'message' => 'không tìm thấy blog này'
            ], 422);
        }

        $blogs = BlogPost::with(['tags', 'images']) // bỏ 'user'
            ->where(function ($query) use ($keyword) {
                $query->where('title', 'LIKE', "%{$keyword}%")
                    ->orWhere('content', 'LIKE', "%{$keyword}%")
                    ->orWhere('excerpt', 'LIKE', "%{$keyword}%")
                    ->orWhere('slug', 'LIKE', "%{$keyword}%")
                    // Search by Tags
                    ->orWhereHas('tags', function ($q) use ($keyword) {
                        $q->where('name', 'LIKE', "%{$keyword}%")
                            ->orWhere('slug', 'LIKE', "%{$keyword}%");
                    });
            })
            ->latest()
            ->paginate(10);

        return response()->json($blogs);
    }


}
