<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture {{ $invoice->invoice_number }}</title>
    <style>
        @page { margin: 0px; } /* Removes default page margins for the top bar */
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            font-size: 13px; 
            color: #333; 
            margin: 0; 
            padding: 0;
        }
        /* Top Blue Accent Bar */
        .top-bar {
            background-color: #3b82f6; /* Modern Blue */
            height: 40px;
            width: 100%;
        }
        
        /* Main Container */
        .container {
            padding: 40px 50px;
        }

        /* Typography */
        h1 { font-size: 38px; font-weight: normal; color: #1f2937; margin: 0 0 30px 0; letter-spacing: 1px; }
        .text-gray { color: #6b7280; }
        .text-blue { color: #3b82f6; }
        .font-bold { font-weight: bold; }

        /* Layout Tables */
        .w-full { width: 100%; }
        .layout-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .layout-table td { vertical-align: top; }

        /* Meta Data (Bill To, Invoice #) */
        .meta-label { font-size: 11px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 5px; }
        .invoice-details-table { width: 100%; border-collapse: collapse; }
        .invoice-details-table td { padding: 4px 0; }
        .invoice-details-table .label { color: #9ca3af; font-size: 11px; text-transform: uppercase; text-align: right; padding-right: 15px; }
        .invoice-details-table .value { font-weight: bold; text-align: right; }

        /* Center Company Block */
        .company-block { text-align: center; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 20px 0; margin-bottom: 40px; }
        .company-name { font-size: 24px; color: #1f2937; margin: 0 0 5px 0; }

        /* Items Table */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { 
            background-color: #3b82f6; /* Blue Header */
            color: #ffffff; 
            text-transform: uppercase; 
            font-size: 11px; 
            padding: 12px; 
            text-align: left; 
        }
        .items-table td { 
            padding: 12px; 
            border-bottom: 1px solid #e5e7eb; 
            background-color: #f9fafb; /* Light gray row background */
        }
        
        .items-table th.text-right, 
        .items-table td.text-right { text-align: right; }
        .items-table th.text-center, 
        .items-table td.text-center { text-align: center; }

        /* Totals Block */
        .totals-container { width: 100%; }
        .totals-table { width: 40%; float: right; border-collapse: collapse; }
        .totals-table td { padding: 8px 0; }
        .totals-table .label { text-align: right; padding-right: 20px; font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase;}
        .totals-table .value { text-align: right; font-weight: bold; }
        .total-final { border-top: 2px solid #e5e7eb; padding-top: 15px !important; }
        .total-final .label { color: #9ca3af; font-size: 14px; }
        .total-final .value { font-size: 18px; }

        /* Signature & Footer */
        .signature-block { clear: both; float: right; margin-top: 40px; text-align: center; width: 40%; }
        .signature-placeholder { font-family: 'Brush Script MT', cursive; font-size: 32px; color: rgba(17, 24, 39, 0.5); margin-top: 50px; }
        
        .footer { clear: both; margin-top: 80px; font-size: 12px; color: #6b7280; }
        .footer-heading { font-weight: bold; font-size: 12px; color: #9ca3af; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="top-bar"></div>

    <div class="container">
        <h1>FACTURE</h1>

        <table class="layout-table">
            <tr>
                <td style="width: 33%;">
                    <div class="meta-label">FACTURER À</div>
                    <div class="font-bold">{{ $invoice->client_name }}</div>
                    </td>
                <td style="width: 33%;">
                    </td>
                <td style="width: 34%;">
                    <table class="invoice-details-table">
                        <tr>
                            <td class="label">N° DE FACTURE</td>
                            <td class="value">{{ $invoice->invoice_number }}</td>
                        </tr>
                        <tr>
                            <td class="label">DATE</td>
                            <td class="value">{{ $invoice->issue_date }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <div class="company-block">
            <h2 class="company-name">QZ-SARL</h2>
            <div class="text-gray">
                123 Boulevard Hassan II<br>
                Casablanca, 20000, Maroc
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-center" style="width: 20%;">Prix Unitaire</th>
                    <th class="text-center" style="width: 10%;">Qté</th>
                    <th class="text-right" style="width: 25%;">Montant</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->lines as $line)
                <tr>
                    <td>{{ $line->description }}</td>
                    <td class="text-center">{{ number_format($line->unit_price, 2) }}</td>
                    <td class="text-center">{{ $line->quantity }}</td>
                    <td class="text-right">{{ number_format($line->quantity * $line->unit_price, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals-container">
            <table class="totals-table">
                <tr>
                    <td class="label">Sous-Total</td>
                    <td class="value">{{ number_format($invoice->total_amount, 2) }}</td>
                </tr>
                <tr>
                    <td class="label total-final">Total Facture</td>
                    <td class="value total-final">{{ number_format($invoice->total_amount, 2) }} MAD</td>
                </tr>
            </table>
        </div>

        <div class="signature-block">
            <div class="signature-placeholder">signature</div>  
        </div>

        <div class="footer">
            <div class="footer-heading">CONDITIONS GÉNÉRALES</div>
            <p style="color: #111827;">Le paiement est dû dans les 15 jours.</p>
            <p>Veuillez libeller les chèques à l'ordre de : QZ-SARL.</p>
        </div>
    </div>
</body>
</html>