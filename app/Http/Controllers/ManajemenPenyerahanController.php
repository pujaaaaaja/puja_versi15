<?php

namespace App\Http\Controllers;

use App\Enums\TahapanKegiatan;
use App\Http\Resources\KegiatanResource;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Models\BeritaAcara;

class ManajemenPenyerahanController extends Controller
{
    /**
     * Menampilkan daftar kegiatan yang perlu diproses oleh Kabid.
     */
    public function index()
    {
        // Kebijakan 'viewAny' akan diterapkan di sini, pastikan login sebagai Kabid/Admin.
        $kegiatans = Kegiatan::query()
            ->whereIn('tahapan', [
                TahapanKegiatan::MENUNGGU_PROSES_KABID,
                TahapanKegiatan::DOKUMENTASI_PENYERAHAN,
                TahapanKegiatan::PENYELESAIAN
            ])
            ->with('tim.users', 'proposal')
            ->orderBy('tanggal_kegiatan', 'desc')
            ->paginate(10);

        return Inertia::render('Kegiatan/IndexPenyerahan', [
            'kegiatans' => KegiatanResource::collection($kegiatans),
        ]);
    }

    /**
     * Memproses persetujuan dari Kabid setelah tahap observasi selesai.
     */
    public function update(Request $request, Kegiatan $kegiatan)
    {
        // Kebijakan 'update' akan diterapkan di sini.
        $validated = $request->validate([
            'file_sktl' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        // Simpan file SKTL Observasi yang baru
        $filePath = $request->file('file_sktl')->store('kegiatan/sktl_observasi', 'public');

        // Update data pada tabel kegiatan
        $kegiatan->update([
            'sktl_path' => $filePath, // Ini adalah SKTL untuk observasi
            'tahapan' => TahapanKegiatan::DOKUMENTASI_PENYERAHAN, // Lanjutkan ke tahap penyerahan (oleh pegawai)
        ]);

        // PERBAIKAN: Menggunakan nama rute yang benar dengan titik.
        return redirect()->route('manajemen.penyerahan.index')
            ->with('success', 'SKTL Observasi berhasil diunggah. Kegiatan dilanjutkan ke tahap penyerahan.');
    }

    /**
     * Menyimpan data dari form penyerahan (diisi oleh Kabid).
     */
    public function storePenyerahan(Request $request, Kegiatan $kegiatan)
    {
        $validated = $request->validate([
            'sktl_penyerahan' => 'nullable|file|mimes:pdf|max:2048',
            'file_pihak_ketiga' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        if ($request->hasFile('sktl_penyerahan')) {
            $sktlPath = $request->file('sktl_penyerahan')->store('kegiatan/sktl_penyerahan', 'public');
            $kegiatan->sktl_penyerahan_path = $sktlPath;
        }

        if ($request->hasFile('file_pihak_ketiga')) {
            $kontrakPath = $request->file('file_pihak_ketiga')->store('kegiatan/kontrak', 'public');
            $kegiatan->kontrak()->delete(); // Hapus yang lama jika ada
            $kegiatan->kontrak()->create([
                'nama_kontrak' => 'Kontrak Pihak Ketiga untuk ' . $kegiatan->nama_kegiatan,
                'file_path' => $kontrakPath,
            ]);
        }

        $kegiatan->tahapan = TahapanKegiatan::PENYELESAIAN;
        $kegiatan->save();

        // PERBAIKAN: Menggunakan nama rute yang benar dengan titik.
        return redirect()->route('manajemen.penyerahan.index')->with('success', 'Dokumen penyerahan berhasil diproses.');
    }

    /**
     * Menyimpan data penyelesaian (Berita Acara dan Status Akhir).
     */
    public function storePenyelesaian(Request $request, Kegiatan $kegiatan)
    {
        $request->validate([
            'status_akhir' => ['required', 'string', Rule::in(['Selesai', 'Ditolak', 'Lainnya'])],
            'berita_acara' => 'required|file|mimes:pdf,doc,docx|max:2048',
            'catatan' => 'nullable|string',
        ]);

        $path = $request->file('berita_acara')->store('kegiatan/berita_acara', 'public');

        // Hapus berita acara lama jika ada, lalu buat yang baru
        $kegiatan->beritaAcara()->delete();
        BeritaAcara::create([
            'kegiatan_id' => $kegiatan->id,
            'file_path' => $path,
            'catatan' => $request->catatan,
        ]);

        $kegiatan->status_akhir = $request->status_akhir;
        $kegiatan->tahapan = TahapanKegiatan::SELESAI;
        $kegiatan->save();

        // PERBAIKAN: Menggunakan nama rute yang benar dengan titik.
        return redirect()->route('manajemen.penyerahan.index')->with('success', 'Kegiatan telah diselesaikan.');
    }
}
