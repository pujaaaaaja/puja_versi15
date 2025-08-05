<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Kegiatan extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_kegiatan',
        'tanggal_kegiatan',
        'sktl_path',
        'sktl_penyerahan_path',
        'proposal_id',
        'tim_id',
        'status_kegiatan',
        'tahapan',
        'created_by', // PERBAIKAN: Menambahkan 'created_by' ke dalam $fillable.
    ];

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    public function tim(): BelongsTo
    {
        return $this->belongsTo(Tim::class);
    }

    public function dokumentasi(): HasMany
    {
        return $this->hasMany(DokumentasiKegiatan::class);
    }

    public function beritaAcara(): HasOne
    {
        return $this->hasOne(BeritaAcara::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function kontrak(): HasOne
    {
        return $this->hasOne(Kontrak::class, 'kegiatan_id');
        
    }
    
}
