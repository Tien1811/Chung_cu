<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    // GET /api/user/profile  (hoặc /api/user nếu anh map route như vậy)
    public function profile()
    {
        $user = Auth::user()->load('avatarFile');

        $avatar = $user->avatarFile ? $user->avatarFile->url : null;

        return response()->json([
            'status' => true,
            // data rút gọn cho FE cần ít field
            'data'   => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'phone_number' => $user->phone_number,
                'role'         => $user->role,
                'avatar_url'   => $avatar,
            ],
            // user đầy đủ (có cả accessor avatar_url nếu anh có khai trong model)
            'user'   => $user,
        ]);
    }

    // PUT /api/user/profile
    public function updateProfile(Request $request)
    {
        $user = Auth::user()->load('avatarFile');

        $request->validate([
            'name'         => 'nullable|string|max:255',
            'email'        => 'nullable|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|regex:/^0[0-9]{9}$/|unique:users,phone_number,' . $user->id,
        ]);

        if ($request->filled('name')) {
            $user->name = $request->name;
        }
        if ($request->filled('email')) {
            $user->email = $request->email;
        }
        if ($request->filled('phone_number')) {
            $user->phone_number = $request->phone_number;
        }

        $user->save();
        $user->refresh()->load('avatarFile');

        $avatar = $user->avatarFile ? $user->avatarFile->url : null;

        return response()->json([
            'status'  => true,
            'message' => 'Cập nhật thông tin thành công.',
            'data'    => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'phone_number' => $user->phone_number,
                'role'         => $user->role,
                'avatar_url'   => $avatar,
            ],
            'user'    => $user,
        ]);
    }

    // POST /api/user/profile/avatar
    public function updateAvatar(Request $request)
    {
        $user = Auth::user()->load('avatarFile');

        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png|max:4096',
        ]);

        // Xóa avatar cũ nếu có
        if ($user->avatarFile) {
            $this->cloudinary->delete($user->avatarFile->public_id);
            $user->avatarFile->delete();
        }

        // Upload avatar mới lên Cloudinary
        $upload = $this->cloudinary->upload(
            $request->file('avatar')->getRealPath(),
            'user_avatars'
        );

        // Lưu bản ghi file
        $user->cloudinaryFiles()->create([
            'public_id' => $upload['public_id'],
            'url'       => $upload['secure_url'],
            'type'      => 'avatar',
        ]);

        // load lại để có avatarFile mới
        $user->refresh()->load('avatarFile');

        $avatar = $user->avatarFile ? $user->avatarFile->url : null;

        return response()->json([
            'status'      => true,
            'message'     => 'Cập nhật avatar thành công.',
            'avatar_url'  => $avatar,
            'user'        => $user,
        ]);
    }

    // PUT /api/user/change-password
    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password'          => 'required',
            'new_password'              => 'required|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status'  => false,
                'message' => 'Mật khẩu hiện tại không chính xác.',
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'Đổi mật khẩu thành công.',
        ]);
    }
}
