<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\Province;
use App\Models\District;
use App\Models\Ward;
use Exception;

class LocationController extends Controller
{
    // *PROVINCES

    // GET /api/provinces
    public function getProvinces()
    {
        try {
            $provinces = Province::select('id', 'code', 'name')
                ->orderBy('name')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $provinces
            ], 200);
        } catch (Exception $e) {
            Log::error('Lỗi lấy danh sách tỉnh: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách tỉnh.'
            ], 500);
        }
    }

    // POST /api/provinces (admin)
    public function createProvince(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Chỉ admin mới được thêm tỉnh.'
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50'
        ]);

        try {
            $province = Province::create([
                'code' => $request->code
                    ?? strtoupper(Str::ascii(str_replace(' ', '', mb_substr($request->name, 0, 30, 'UTF-8')))),
                'name' => $request->name
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Thêm tỉnh thành công.',
                'data' => $province
            ], 201);
        } catch (Exception $e) {
            Log::error('Lỗi thêm tỉnh: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Không thể thêm tỉnh.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // PUT /api/provinces/{id} (admin)
    public function updateProvince(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được sửa tỉnh.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50'
        ]);

        $province = Province::find($id);
        if (!$province) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy tỉnh.'], 404);
        }

        $province->update([
            'name' => $request->name,
            'code' => $request->code
                ?? strtoupper(Str::ascii(str_replace(' ', '', mb_substr($request->name, 0, 30, 'UTF-8'))))
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật tỉnh thành công.',
            'data' => $province
        ]);
    }

    // DELETE /api/provinces/{id} (admin)
    public function deleteProvince($id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được xóa tỉnh.'], 403);
        }

        $province = Province::find($id);
        if (!$province) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy tỉnh.'], 404);
        }

        $province->delete();
        return response()->json(['status' => true, 'message' => 'Xóa tỉnh thành công.']);
    }

    // *DISTRICTS

    // GET /api/districts?province_id=1
    public function getDistricts(Request $request)
    {
        $provinceId = $request->query('province_id');
        $query = District::query();
        if ($provinceId) $query->where('province_id', $provinceId);
        $districts = $query->select('id', 'code', 'name', 'province_id')->orderBy('name')->get();

        return response()->json(['status' => true, 'data' => $districts]);
    }

    // POST /api/districts (admin)
    public function createDistrict(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được thêm quận/huyện.'], 403);
        }

        $request->validate([
            'province_id' => 'required|exists:provinces,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50'
        ]);

        $district = District::create([
            'province_id' => $request->province_id,
            'name' => $request->name,
            'code' => $request->code
                ?? strtoupper(Str::ascii(str_replace(' ', '', mb_substr($request->name, 0, 30, 'UTF-8'))))
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Thêm quận/huyện thành công.',
            'data' => $district
        ], 201);
    }

    // PUT /api/districts/{id} (admin)
    public function updateDistrict(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được sửa quận/huyện.'], 403);
        }

        $request->validate([
            'province_id' => 'required|exists:provinces,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50'
        ]);

        $district = District::find($id);
        if (!$district) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy quận/huyện.'], 404);
        }

        $district->update([
            'province_id' => $request->province_id,
            'name' => $request->name,
            'code' => $request->code
                ?? strtoupper(Str::ascii(str_replace(' ', '', mb_substr($request->name, 0, 30, 'UTF-8'))))
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật quận/huyện thành công.',
            'data' => $district
        ]);
    }

    // DELETE /api/districts/{id} (admin)
    public function deleteDistrict($id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được xóa quận/huyện.'], 403);
        }

        $district = District::find($id);
        if (!$district) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy quận/huyện.'], 404);
        }

        $district->delete();
        return response()->json(['status' => true, 'message' => 'Xóa quận/huyện thành công.']);
    }

    // *WARDS

    // GET /api/wards?district_id=1
    public function getWards(Request $request)
    {
        $districtId = $request->query('district_id');
        $query = Ward::query();
        if ($districtId) $query->where('district_id', $districtId);
        $wards = $query->select('id', 'code', 'name', 'district_id')->orderBy('name')->get();

        return response()->json(['status' => true, 'data' => $wards]);
    }

    // POST /api/wards (admin)
    public function createWard(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được thêm phường/xã.'], 403);
        }

        $request->validate([
            'district_id' => 'required|exists:districts,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50'
        ]);

        $ward = Ward::create([
            'district_id' => $request->district_id,
            'name' => $request->name,
            'code' => $request->code
                ?? strtoupper(Str::ascii(str_replace(' ', '', mb_substr($request->name, 0, 30, 'UTF-8'))))
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Thêm phường/xã thành công.',
            'data' => $ward
        ], 201);
    }

    // PUT /api/wards/{id} (admin)
    public function updateWard(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được sửa phường/xã.'], 403);
        }

        $request->validate([
            'district_id' => 'required|exists:districts,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50'
        ]);

        $ward = Ward::find($id);
        if (!$ward) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy phường/xã.'], 404);
        }

        $ward->update([
            'district_id' => $request->district_id,
            'name' => $request->name,
            'code' => $request->code
                ?? strtoupper(Str::ascii(str_replace(' ', '', mb_substr($request->name, 0, 30, 'UTF-8'))))
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật phường/xã thành công.',
            'data' => $ward
        ]);
    }

    // DELETE /api/wards/{id} (admin)
    public function deleteWard($id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Chỉ admin mới được xóa phường/xã.'], 403);
        }

        $ward = Ward::find($id);
        if (!$ward) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy phường/xã.'], 404);
        }

        $ward->delete();
        return response()->json(['status' => true, 'message' => 'Xóa phường/xã thành công.']);
    }
}
