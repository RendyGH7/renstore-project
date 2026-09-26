<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user registration (Customer role by default).
     */
    public function register(Request $request): JsonResponse
    {
        $existing = User::where('email', strtolower(trim($request->input('email'))))->first();
        if ($existing) {
            return response()->json([
                'status' => false,
                'code' => 'EMAIL_ALREADY_EXISTS',
                'message' => 'Email ini sudah terdaftar di RENSTORE. Silakan langsung masuk ke akun Anda.',
            ], 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        $token = $user->createToken('renstore_auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Registrasi akun berhasil. Selamat datang di RENSTORE!',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Handle user login (Admin & Customer).
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower(trim($validated['email']));
        $user = User::where('email', $email)->first();

        if (! $user) {
            return response()->json([
                'status' => false,
                'code' => 'EMAIL_NOT_FOUND',
                'message' => 'Email ini belum terdaftar di RENSTORE. Silakan buat akun baru terlebih dahulu.',
            ], 404);
        }

        if (! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status' => false,
                'code' => 'INVALID_PASSWORD',
                'message' => 'Password yang Anda masukkan salah. Silakan coba lagi atau gunakan opsi Lupa Password.',
            ], 401);
        }

        $token = $user->createToken('renstore_auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Request Password Reset recovery code (Forgot Password).
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->input('email')));
        $user = User::where('email', $email)->first();

        if (! $user) {
            return response()->json([
                'status' => false,
                'code' => 'EMAIL_NOT_FOUND',
                'message' => 'Email ini tidak terdaftar di sistem kami. Pastikan alamat email benar atau daftar akun baru.',
            ], 404);
        }

        // Generate 6-digit numeric recovery code
        $recoveryCode = (string) random_int(100000, 999999);

        // Save to password_reset_tokens table
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => $recoveryCode,
                'created_at' => now(),
            ]
        );

        return response()->json([
            'status' => true,
            'message' => "Kode pemulihan 6 digit berhasil dibuat untuk akun {$user->name}.",
            'data' => [
                'email' => $email,
                'user_name' => $user->name,
                'recovery_code' => $recoveryCode,
                'expires_in_minutes' => 15,
            ],
        ]);
    }

    /**
     * Verify Password Reset Code.
     */
    public function verifyResetCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $email = strtolower(trim($request->input('email')));
        $code = trim($request->input('code'));

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (! $record || $record->token !== $code) {
            return response()->json([
                'status' => false,
                'code' => 'INVALID_CODE',
                'message' => 'Kode pemulihan salah. Silakan periksa kembali 6 digit kode Anda.',
            ], 422);
        }

        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(15)->isPast()) {
            return response()->json([
                'status' => false,
                'code' => 'EXPIRED_CODE',
                'message' => 'Kode pemulihan sudah kadaluarsa (lebih dari 15 menit). Silakan minta kode baru.',
            ], 422);
        }

        return response()->json([
            'status' => true,
            'message' => 'Kode pemulihan valid. Silakan masukkan password baru Anda.',
        ]);
    }

    /**
     * Set new password after verifying recovery code.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $email = strtolower(trim($request->input('email')));
        $code = trim($request->input('code'));

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (! $record || $record->token !== $code) {
            return response()->json([
                'status' => false,
                'code' => 'INVALID_CODE',
                'message' => 'Kode pemulihan tidak valid atau sudah kadaluarsa.',
            ], 422);
        }

        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(15)->isPast()) {
            return response()->json([
                'status' => false,
                'code' => 'EXPIRED_CODE',
                'message' => 'Kode pemulihan sudah kadaluarsa. Silakan minta kode baru.',
            ], 422);
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            return response()->json([
                'status' => false,
                'message' => 'Akun pengguna tidak ditemukan.',
            ], 404);
        }

        $user->password = Hash::make($request->input('password'));
        $user->save();

        // Delete used reset token
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Password berhasil diperbarui! Silakan login dengan password baru Anda.',
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => 'Data profil berhasil diambil.',
            'data' => $request->user(),
        ]);
    }

    /**
     * Update authenticated user profile and upload avatar if present.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'avatar' => 'nullable',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Handle Avatar File Upload
        if ($request->hasFile('avatar')) {
            $request->validate([
                'avatar' => 'image|mimes:jpeg,png,jpg,webp,gif|max:2048',
            ]);
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = url('/storage/' . $path);
        } elseif ($request->filled('avatar') && is_string($request->input('avatar'))) {
            $validated['avatar'] = $request->input('avatar');
        }

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user->fresh(),
        ]);
    }

    /**
     * Handle user logout and revoke current Sanctum token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logout berhasil. Sesi telah diakhiri.',
        ]);
    }

    /**
     * Check if email is registered in the database and return exclusive member promo voucher (1 claim per email).
     */
    public function claimVoucher(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = strtolower(trim($request->input('email')));

        // 1. Check if this email has already claimed a voucher
        $existingClaim = \Illuminate\Support\Facades\DB::table('voucher_claims')
            ->where('email', $email)
            ->first();

        if ($existingClaim) {
            return response()->json([
                'status' => false,
                'code' => 'ALREADY_CLAIMED',
                'already_claimed' => true,
                'message' => 'Email ini sudah pernah mengklaim voucher eksklusif sebelumnya. Setiap 1 email/akun hanya berhak mendapatkan 1 voucher promo.',
                'claimed_at' => $existingClaim->created_at,
                'email' => $email,
            ], 422);
        }

        // 2. Check if user is registered in the database
        $user = User::where('email', $email)->first();

        if ($user) {
            // Record the claim so they cannot claim twice with the same email
            \Illuminate\Support\Facades\DB::table('voucher_claims')->insert([
                'email' => $email,
                'user_id' => $user->id,
                'voucher_code' => 'DISKON50',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Registered Member: Exclusive 50% VIP Voucher
            return response()->json([
                'status' => true,
                'is_registered' => true,
                'message' => 'Selamat! Email Anda terverifikasi sebagai member aktif RENSTORE.',
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'voucher' => [
                    'code' => 'DISKON50',
                    'title' => 'Voucher Eksklusif Member VIP',
                    'discount_text' => 'Diskon 50% hingga Rp 1.000.000',
                    'discount_percent' => 50,
                    'max_discount' => 1000000,
                    'min_spend' => 0,
                    'description' => 'Potongan harga spesial 50% (maksimal Rp 1.000.000) tanpa minimal belanja.',
                    'badge' => 'VIP MEMBER 50%',
                ],
            ]);
        } else {
            // Non-registered email
            return response()->json([
                'status' => false,
                'code' => 'EMAIL_NOT_REGISTERED',
                'is_registered' => false,
                'message' => 'Email ini belum terdaftar sebagai akun di RENSTORE. Silakan daftarkan akun baru Anda terlebih dahulu untuk mengklaim Voucher Diskon 50%!',
                'email' => $email,
            ], 404);
        }
    }
}
