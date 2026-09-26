<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    /**
     * Get list of all registered users with metrics and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::withCount('orders')
            ->withSum(['orders' => function ($q) {
                $q->where('status', '!=', 'cancelled');
            }], 'total_amount');

        // Filter by role
        if ($request->filled('role') && in_array($request->role, ['admin', 'customer'])) {
            $query->where('role', $request->role);
        }

        // Search by name, email, or phone
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->get();

        // Overall stats
        $totalUsers = User::count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $todayRegistered = User::whereDate('created_at', Carbon::today())->count();

        return response()->json([
            'status' => true,
            'message' => 'Data pengguna berhasil diambil.',
            'data' => [
                'users' => $users,
                'stats' => [
                    'total_users' => $totalUsers,
                    'total_customers' => $totalCustomers,
                    'total_admins' => $totalAdmins,
                    'today_registered' => $todayRegistered,
                ],
            ],
        ]);
    }

    /**
     * Admin can reset password for a specific user.
     */
    public function resetPassword(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user = User::findOrFail($id);
        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'status' => true,
            'message' => "Password akun {$user->name} ({$user->email}) berhasil direset.",
        ]);
    }

    /**
     * Admin can toggle/update user role.
     */
    public function updateRole(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:admin,customer',
        ]);

        $currentUser = $request->user();
        if ($currentUser->id == $id && $validated['role'] !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak dapat menurunkan role akun administrator Anda sendiri.',
            ], 422);
        }

        $user = User::findOrFail($id);
        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'status' => true,
            'message' => "Role akun {$user->name} berhasil diubah menjadi {$user->role}.",
            'data' => $user,
        ]);
    }

    /**
     * Delete user account (Admin only).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if ($currentUser->id == $id) {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 422);
        }

        $user = User::findOrFail($id);
        $userName = $user->name;
        $user->delete();

        return response()->json([
            'status' => true,
            'message' => "Akun {$userName} berhasil dihapus dari sistem.",
        ]);
    }
}
