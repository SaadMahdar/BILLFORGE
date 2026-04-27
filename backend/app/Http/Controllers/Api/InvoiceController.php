<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    // Read All (Only user's invoices)
    public function index(Request $request)
    {
        return response()->json($request->user()->invoices);
    }

    // Read One (Ensure it belongs to the user)
    public function show(Request $request, Invoice $invoice)
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($invoice);
    }

    // Create
    public function store(Request $request)
{
    $validated = $request->validate([
        'client_name' => 'required|string',
        'total_amount' => 'required|numeric',
    ]);

    $invoice = $request->user()->invoices()->create([
        'client_name'  => $validated['client_name'],
        'total_amount' => $validated['total_amount'],
        'issue_date'   => now(), 
    ]);

    return response()->json($invoice, 201);
}

    // Patch Status Only
    public function updateStatus(Request $request, Invoice $invoice)
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:Paid,Unpaid' // Example strict validation
        ]);

        $invoice->update(['status' => $validated['status']]);

        return response()->json($invoice);
    }

    // Delete
    public function destroy(Request $request, Invoice $invoice)
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully']);
    }
}