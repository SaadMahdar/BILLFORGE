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
        return response()->json($request->user()->invoices()->with('lines')->get());
    }

    // Read One (Ensure it belongs to the user)
    public function show(Request $request, Invoice $invoice)
    {
        if ($invoice->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // load('lines') attaches the items to this specific invoice
        return response()->json($invoice->load('lines'));
    }

    // Create
    public function store(Request $request)
    {
    $validated = $request->validate([
    'client_name'           => 'required|string',
    'lines'                 => 'required|array|min:1',
    'lines.*.description'   => 'required|string', 
    'lines.*.quantity'      => 'required|integer|min:1',
    'lines.*.unit_price'    => 'required|numeric|min:0', 
]);

    // 1. Create Invoice Header
    $invoice = $request->user()->invoices()->create([
        'client_name'  => $validated['client_name'],
        'total_amount' => 0, // Temporary zero, calculated below
        'issue_date'   => now(),
        ]);

    $totalAmount = 0;

    // 2. Create Lines and Calculate Total
    foreach ($validated['lines'] as $line) {
        $invoice->lines()->create($line);
        $totalAmount += ($line['quantity'] * $line['unit_price']);
        }

    // 3. Update Final Total
    $invoice->update(['total_amount' => $totalAmount]);

    // Return the new invoice with its nested lines attached
    return response()->json($invoice->load('lines'), 201);
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