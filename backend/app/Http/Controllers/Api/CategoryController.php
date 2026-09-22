<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories (Public).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::query();

        // If 'active_only' is not explicitly set to false, default to active categories
        if ($request->boolean('all') !== true) {
            $query->where('is_active', true);
        }

        $categories = $query->withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])->orderBy('name', 'asc')->get();

        return response()->json([
            'status' => true,
            'message' => 'Daftar kategori berhasil diambil.',
            'data' => $categories,
        ]);
    }

    /**
     * Display the specified category by slug or ID (Public).
     */
    public function show(string $slugOrId): JsonResponse
    {
        $category = Category::where('slug', $slugOrId)
            ->orWhere('id', is_numeric($slugOrId) ? (int) $slugOrId : 0)
            ->with(['products' => function ($q) {
                $q->where('is_active', true)->orderBy('created_at', 'desc');
            }])
            ->first();

        if (! $category) {
            return response()->json([
                'status' => false,
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Detail kategori berhasil diambil.',
            'data' => $category,
        ]);
    }

    /**
     * Store a newly created category (Admin only).
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = Category::create($validated);

        return response()->json([
            'status' => true,
            'message' => 'Kategori berhasil ditambahkan.',
            'data' => $category,
        ], 201);
    }

    /**
     * Update the specified category (Admin only).
     */
    public function update(UpdateCategoryRequest $request, string|int $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json([
                'status' => false,
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validated();

        if (isset($validated['name']) && empty($validated['slug']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Kategori berhasil diperbarui.',
            'data' => $category,
        ]);
    }

    /**
     * Remove the specified category (Admin only).
     */
    public function destroy(string|int $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json([
                'status' => false,
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        $category->delete();

        return response()->json([
            'status' => true,
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}
