<?php

namespace App\Http\Controllers;

use App\Enums\TahapanKegiatan;
use App\Http\Resources\KegiatanResource;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ManajemenPenyerahanController extends Controller
{
    /**
     * Menampilkan daftar kegiatan yang menunggu proses penyerahan oleh Kabid.
     */
    public function index()
    {
        // Ambil semua kegiatan yang statusnya MENUNGGU_PROSES_KABID
        $kegiatans = Kegiatan::query()
            ->where('tahapan', TahapanKegiatan::MENUNGGU_PROSES_KABID)
            ->with('tim.users', 'proposal') // Eager load relasi untuk efisiensi
            ->orderBy('tanggal_kegiatan', 'desc')
            ->paginate(10);

        return inertia('Kegiatan/IndexPenyerahan', [
            'kegiatans' => KegiatanResource::collection($kegiatans),
        ]);
    }

    /**
     * Memproses penyerahan oleh Kabid dan melanjutkan tahapan kegiatan.
     */
    public function update(Request $request, Kegiatan $kegiatan)
    {
        $validated = $request->validate([
            'tanggal_penyerahan' => 'required|date',
            'file_sktl' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        // Hapus file SKTL lama jika ada untuk menghindari penumpukan file
        if ($kegiatan->file_sktl && Storage::disk('public')->exists($kegiatan->file_sktl)) {
            Storage::disk('public')->delete($kegiatan->file_sktl);
        }

        // Simpan file SKTL yang baru diunggah
        $filePath = $request->file('file_sktl')->store('sktl', 'public');

        // Update data pada tabel kegiatan
        $kegiatan->update([
            'tanggal_penyerahan' => $validated['tanggal_penyerahan'],
            'file_sktl' => $filePath,
            'tahapan' => TahapanKegiatan::DOKUMENTASI_PENYERAHAN, // Lanjutkan ke tahapan berikutnya
        ]);

        return redirect()->route('manajemen.penyerahan.index')
            ->with('success', 'Kegiatan berhasil diproses dan dilanjutkan ke tahap penyerahan.');
    }
}
