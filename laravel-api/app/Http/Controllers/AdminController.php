<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Get all pending approval users
     */
    public function getPendingUsers()
    {
        $users = User::where('is_approved', false)
            ->whereIn('role', ['doctor', 'nurse', 'pharmacist'])
            ->get();

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    /**
     * Approve a user
     */
    public function approveUser($id)
    {
        $user = User::findOrFail($id);

        if (!$user->needsApproval()) {
            return response()->json([
                'success' => false,
                'message' => 'This user does not require approval'
            ], 400);
        }

        $user->is_approved = true;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User approved successfully',
            'user' => $user
        ]);
    }

    /**
     * Reject/Delete a user
     */
    public function rejectUser($id)
    {
        $user = User::findOrFail($id);

        if (!$user->needsApproval()) {
            return response()->json([
                'success' => false,
                'message' => 'This user does not require approval'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User rejected successfully'
        ]);
    }

    /**
     * Get all users
     */
    public function getAllUsers()
    {
        $users = User::where('role', '!=', 'admin')->get();

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'new_password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($id);

        if (!in_array($user->role, ['doctor', 'nurse', 'pharmacist'])) {
            return response()->json([
                'success' => false,
                'message' => 'You can only change passwords for doctors, nurses, and pharmacists'
            ], 403);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Change own password (for admin)
     */
    public function changeOwnPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 401);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}
