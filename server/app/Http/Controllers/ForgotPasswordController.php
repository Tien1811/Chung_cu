<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Mail\ResetPasswordMail;

class ForgotPasswordController extends Controller
{
    // POST /api/forgot-password (Gửi token đặt lại mật khẩu qua email)
    public function sendResetToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Email không tồn tại.'
            ], 404);
        }

        // Token 8 ký tự
        $token = strtoupper(Str::random(8));

        // Lưu hoặc cập nhật token + thời gian tạo
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $token,
                'created_at' => now()
            ]
        );

        // Gửi email
        Mail::to($user->email)->send(new ResetPasswordMail($user, $token));

        return response()->json([
            'status' => true,
            'message' => 'Mã (token) đã được gửi qua email (hết hạn sau 15 phút).',
        ]);
    }


    // POST /api/reset-password (Đặt lại mật khẩu bằng token)
    public function resetPassword(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'email'         => 'required|email',
            'token'         => 'required|string',
            'new_password'  => 'required|string|min:6|confirmed',
        ], [
            'email.required'        => 'Email không được để trống.',
            'email.email'           => 'Email không đúng định dạng.',
            'token.required'        => 'Mã token không được để trống.',
            'new_password.required' => 'Mật khẩu mới không được để trống.',
            'new_password.min'      => 'Mật khẩu mới phải ít nhất 6 ký tự.',
            'new_password.confirmed'=> 'Xác nhận mật khẩu không khớp.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $check = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        // Kiểm tra token tồn tại và chưa hết hạn 15 phút
        if (!$check || Carbon::parse($check->created_at)->addMinutes(15)->isPast()) {
            return response()->json([
                'status' => false,
                'message' => 'Token không hợp lệ hoặc đã hết hạn.'
            ], 400);
        }

        // Cập nhật mật khẩu
        User::where('email', $request->email)->update([
            'password' => bcrypt($request->new_password)
        ]);

        // Xóa token sau khi sử dụng
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đặt lại mật khẩu thành công.'
        ]);
    }
}
