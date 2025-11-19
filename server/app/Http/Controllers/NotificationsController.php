<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    /**
     * Lấy danh sách thông báo của người dùng
     * GET /api/notifications
     */
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'DESC')
            ->get();

        return response()->json($notifications);
    }


    /**
     * Đánh dấu 1 thông báo là đã đọc
     * POST /api/notifications/read/{id}
     */
    public function markAsRead($id)
    {
        $noti = Notification::where('user_id', auth()->id())->findOrFail($id);

        $noti->update(['is_read' => true]);

        return response()->json(['message' => 'Đã đánh dấu là đã đọc']);
    }


    /**
     * Đánh dấu tất cả thông báo là đã đọc
     * POST /api/notifications/read-all
     */
    public function markAll()
    {
        Notification::where('user_id', auth()->id())
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Đã đọc tất cả thông báo']);
    }


    /**
     * Đếm số thông báo chưa đọc
     * GET /api/notifications/unread-count
     */
    public function unreadCount()
    {
        $count = Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->count();

        return response()->json(['unread' => $count]);
    }
}
