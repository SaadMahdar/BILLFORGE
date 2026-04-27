<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $guarded = [];

    public function lines()
    {
        return $this->hasMany(InvoiceLine::class);
    }
    public function user() { return $this->belongsTo(User::class); }

    /** @use HasFactory<\Database\Factories\InvoiceFactory> */
    use HasFactory;
}
