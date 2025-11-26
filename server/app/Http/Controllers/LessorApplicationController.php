<?php

namespace App\Http\Controllers;

use App\Models\LessorApplication;
use App\Models\Notification;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;

class LessorApplicationController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    // POST /api/lessor/apply (user gửi yêu cầu trở thành chủ cho thuê)
    public function apply(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'user') {
            return response()->json(['message' => 'Bạn không thể gửi yêu cầu.'], 403);
        }

        $pending = LessorApplication::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($pending) {
            return response()->json([
                'message' => 'Bạn đã gửi yêu cầu và đang chờ duyệt.'
            ], 400);
        }

        $request->validate([
            'note' => 'nullable|string',
            'pdf'  => 'required|mimes:pdf|max:5120'
        ]);

        // Tạo yêu cầu mới (chưa có PDF)
        $application = LessorApplication::create([
            'user_id' => $user->id,
            'note' => $request->note,
            'status' => 'pending'
        ]);

        // Upload PDF lên Cloudinary
        $upload = $this->cloudinary->upload(
            $request->file('pdf')->getRealPath(),
            'lessor_applications'
        );

        // Lưu file vào bảng cloudinary_files
        $application->files()->create([
            'public_id' => $upload['public_id'],
            'url'       => $upload['secure_url'],
            'type'      => 'lessor_pdf'
        ]);

        // Gửi thông báo đến tất cả admin
        $admins = User::admins()->get(); // dùng scopeAdmins()

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'lessor_request',
                'content' => "Người dùng {$user->name} đã gửi yêu cầu trở thành người cho thuê."
            ]);
        }

        return response()->json([
            'message' => 'Gửi yêu cầu thành công.',
            'data' => $application
        ]);
    }


    // GET /api/lessor/my (user xem yêu cầu của mình)
    public function myRequest()
    {
        return LessorApplication::with('pdfFile')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'DESC')
            ->get();
    }

    // GET /api/admin/lessor/requests (admin xem danh sách)
    public function adminIndex()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Không có quyền'], 403);
        }

        return LessorApplication::with(['user', 'pdfFile'])
            ->orderBy('created_at', 'DESC')
            ->get();
    }

    // POST /api/admin/lessor/approve/{id} (admin phê duyệt)
    public function approve($id, Request $request)
    {
        if (auth()->user()->role !== 'admin')
            return response()->json(['message' => 'Không có quyền'], 403);

        $application = LessorApplication::findOrFail($id);

        //Không thể duyệt nếu không phải pending
        if ($application->status !== 'pending') {
            return response()->json([
                'message' => 'Yêu cầu này đã được xử lý trước đó và không thể phê duyệt lại.'
            ], 400);
        }

        $application->update([
            'status' => 'approved',
            'admin_note' => $request->admin_note
        ]);

        // Cập nhật user role
        $application->user->update(['role' => 'lessor']);

        Notification::create([
            'user_id' => $application->user_id,
            'type' => 'lessor_approved',
            'content' => 'Yêu cầu của bạn đã được phê duyệt.'
        ]);

        return response()->json(['message' => 'Đã phê duyệt']);
    }

    // POST /api/admin/lessor/reject/{id} (admin từ chối)
    public function reject($id, Request $request)
    {
        if (auth()->user()->role !== 'admin')
            return response()->json(['message' => 'Không có quyền'], 403);

        $application = LessorApplication::findOrFail($id);

        //Không thể từ chối nếu không phải pending
        if ($application->status !== 'pending') {
            return response()->json([
                'message' => 'Yêu cầu này đã được xử lý trước đó và không thể từ chối lại.'
            ], 400);
        }

        $application->update([
            'status' => 'rejected',
            'admin_note' => $request->admin_note
        ]);

        Notification::create([
            'user_id' => $application->user_id,
            'type' => 'lessor_rejected',
            'content' => "Yêu cầu bị từ chối. Lý do: " . $request->admin_note
        ]);

        return response()->json(['message' => 'Đã từ chối']);
    }

    // DELETE /api/admin/lessor/delete/{id}
    public function delete($id)
    {
        $admin = auth()->user();

        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Không có quyền'], 403);
        }

        $application = LessorApplication::with('pdfFile')->find($id);

        if (!$application) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu'], 404);
        }

        // ===== XÓA FILE PDF TRÊN CLOUDINARY =====
        if ($application->pdfFile) {
            $publicId = $application->pdfFile->public_id;

            // Xóa Cloudinary
            try {
                $this->cloudinary->delete($publicId);
            } catch (\Exception $e) {
                // Tiếp tục xóa dữ liệu ngay cả khi cloudinary lỗi
            }

            // Xóa bản ghi file
            $application->pdfFile->delete();
        }

        // ===== THÔNG BÁO CHO USER =====
        Notification::create([
            'user_id' => $application->user_id,
            'type' => 'lessor_request_deleted',
            'content' => 'Yêu cầu trở thành chủ cho thuê của bạn đã bị admin xóa.'
        ]);

        // ===== XÓA YÊU CẦU =====
        $application->delete();

        return response()->json([
            'status' => true,
            'message' => 'Xóa yêu cầu thành công.'
        ]);
    }

}
