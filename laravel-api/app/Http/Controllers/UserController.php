<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Upload or update user signature
     */
    public function uploadSignature(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'signature' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        
        // Store base64 signature
        $user->signature = $request->signature;
        $user->save();

        return response()->json([
            'message' => 'Signature uploaded successfully',
            'signature' => $user->signature
        ]);
    }

    /**
     * Get current user signature
     */
    public function getSignature(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'signature' => $user->signature
        ]);
    }

    /**
     * Delete user signature
     */
    public function deleteSignature(Request $request)
    {
        $user = $request->user();
        $user->signature = null;
        $user->save();

        return response()->json([
            'message' => 'Signature deleted successfully'
        ]);
    }
}
