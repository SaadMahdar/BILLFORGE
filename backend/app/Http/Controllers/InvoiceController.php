<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function downloadPdf($id) 
    {
        $invoice = Invoice::with('lines')->findOrFail($id);
        
        return Pdf::loadView('invoice', compact('invoice'))->download('facture.pdf');
    }
}