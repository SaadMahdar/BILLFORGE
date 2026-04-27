<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validate the incoming data
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // 2. Find the user
        $user = User::where('email', $request->email)->first();

        // 3. Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // 4. Generate the token
        $token = $user->createToken('react-frontend')->plainTextToken;

        // 5. Return the key
        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }
    public function logout(Request $request)
    {
        // This hunts down the specific token the user just used to make this request and deletes it from the database.
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
}