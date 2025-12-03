<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Review;
use App\Models\Post;
use App\Models\Notification;

class ReviewController extends Controller
{
    /**
     * TRANG TỔNG: Lấy tất cả review của TẤT CẢ post
     * GET /api/reviews?stars=5&page=1&per_page=12
     */
    public function all(Request $request)
    {
        $perPage = (int) $request->query('per_page', 12);
        if ($perPage <= 0) $perPage = 12;

        $stars = $request->query('stars');

        // ----- Query danh sách review (kèm user + post) -----
        $reviews = Review::with([
                'user:id,name',
                'post:id,title'
            ])
            ->when(!empty($stars), function ($q) use ($stars) {
                $q->where('rating', (int) $stars);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // ----- Query base cho summary -----
        $baseQuery = Review::query();
        if (!empty($stars)) {
            $baseQuery->where('rating', (int) $stars);
        }

        // trung bình sao
        $avgRating = (clone $baseQuery)->avg('rating') ?? 0;

        // đếm số review từng số sao 1–5
        $ratingsCount = (clone $baseQuery)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        $ratingsCountArr = [];
        for ($i = 1; $i <= 5; $i++) {
            $ratingsCountArr[$i] = $ratingsCount[$i] ?? 0;
        }

        $totalReviews = (clone $baseQuery)->count();

        return response()->json([
            'status'         => true,
            'average_rating' => round($avgRating, 1),
            'ratings_count'  => $ratingsCountArr,
            'total_reviews'  => $totalReviews,
            'data'           => $reviews->items(),
            'meta'           => [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'per_page'     => $reviews->PerPage(),
                'total'        => $reviews->total(),
            ],
        ]);
    }

    /**
     * TRANG THEO BÀI: review của 1 post
     * GET /api/posts/{post_id}/reviews?stars=5
     */
    public function index(Request $request, $post_id)
    {
        $post = Post::find($post_id);
        if (!$post) {
            return response()->json([
                'status'  => false,
                'message' => 'Không tìm thấy bài viết.'
            ], 404);
        }

        $stars = $request->query('stars');

        $query = Review::with('user:id,name')
            ->where('post_id', $post_id);

        if (!empty($stars)) {
            $query->where('rating', (int) $stars);
        }

        $reviews = $query->orderBy('created_at', 'desc')->get();

        $avgRating = Review::where('post_id', $post_id)->avg('rating') ?? 0;

        $ratingsCount = Review::where('post_id', $post_id)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        $ratingsCountArr = [];
        for ($i = 1; $i <= 5; $i++) {
            $ratingsCountArr[$i] = $ratingsCount[$i] ?? 0;
        }

        return response()->json([
            'status'            => true,
            'post_id'           => $post_id,
            'average_rating'    => round($avgRating, 1),
            'ratings_count'     => $ratingsCountArr,
            'total_reviews'     => $reviews->count(),
            'filtered_by_stars' => $stars ? (int) $stars : null,
            'data'              => $reviews,
        ]);
    }

    // --- store / update / destroy giữ nguyên như bạn, mình không lặp lại ---
}
