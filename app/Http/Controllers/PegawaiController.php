<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\DokumentasiKegiatan;
use App\Models\BeritaAcara;
use App\Enums\TahapanKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Http\Requests\StoreBeritaAcaraRequest;
use App\Http\Requests\StoreDokumentasiWithFilesRequest;
use App\Http\Resources\KegiatanResource;

class PegawaiController extends Controller
{
    /**
     * Menampilkan halaman "Kegiatan Saya" untuk pegawai.
     * Menggabungkan logika dari KegiatanController::myIndex().
     */
    public function myIndex(Request $request)
    {
        $user = Auth::user();
        $query = Kegiatan::with(['tim.users', 'proposal']) // Disederhanakan untuk debugging
            ->whereHas('tim.users', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

        $tahapan = $request->query('tahapan');
        if ($tahapan && $tahapan !== 'semua') {
            $query->where('tahapan', $tahapan);
        } else {
            $query->where('tahapan', '!=', 'selesai');
        }
        
        $kegiatans = $query->orderBy('created_at', 'desc')->paginate(10);

        // --- BARIS INI UNTUK DEBUGGING ---
        // Ini akan menghentikan eksekusi dan menampilkan isi dari $kegiatans
        // dd($kegiatans->toArray());

        return Inertia::render('Pegawai/KegiatanSaya', [
            'kegiatans' => $kegiatans,
            'queryParams' => $request->query() ?: null,
            'success' => session('success'),
        ]);
    }
    /**
     * Menangani konfirmasi kehadiran pegawai.
     * Menggabungkan logika dari DokumentasiKegiatanController::confirmKehadiran().
     */
    public function konfirmasiKehadiran(Request $request, Kegiatan $kegiatan)
    {
        $kegiatan->tahapan = TahapanKegiatan::DOKUMENTASI_OBSERVASI->value;
        $kegiatan->save();

        return to_route('pegawai.kegiatan.myIndex')->with('success', 'Kehadiran berhasil dikonfirmasi dan kegiatan dimulai.');
    }

    /**
     * Menyimpan dokumentasi observasi.
     * Menggabungkan logika dari DokumentasiKegiatanController::storeObservasi().
     */
    public function storeObservasi(StoreDokumentasiWithFilesRequest $request, Kegiatan $kegiatan)
    {
        $data = $request->validated();
        $data['tipe'] = 'observasi';
        $data['user_id'] = Auth::id();

        // Handle file uploads
        if ($request->hasFile('dokumen_path')) {
            $data['dokumen_path'] = $request->file('dokumen_path')->store('dokumentasi_observasi', 'public');
        }
        if ($request->hasFile('foto_path')) {
            $data['foto_path'] = $request->file('foto_path')->store('foto_observasi', 'public');
        }

        $kegiatan->dokumentasi()->create($data);
        $kegiatan->tahapan = TahapanKegiatan::MENUNGGU_PROSES_KABID->value;
        $kegiatan->save();

        return to_route('pegawai.kegiatan.myIndex')->with('success', 'Dokumentasi observasi berhasil diunggah.');
    }

    /**
     * Menyimpan dokumentasi penyerahan.
     * Menggabungkan logika dari DokumentasiKegiatanController::storePenyerahan().
     */
    public function storePenyerahan(StoreDokumentasiWithFilesRequest $request, Kegiatan $kegiatan)
    {
        $data = $request->validated();
        $data['tipe'] = 'penyerahan';
        $data['user_id'] = Auth::id();

        if ($request->hasFile('dokumen_path')) {
            $data['dokumen_path'] = $request->file('dokumen_path')->store('dokumentasi_penyerahan', 'public');
        }
        if ($request->hasFile('foto_path')) {
            $data['foto_path'] = $request->file('foto_path')->store('foto_penyerahan', 'public');
        }

        $kegiatan->dokumentasi()->create($data);
        $kegiatan->tahapan = TahapanKegiatan::SELESAI->value;
        $kegiatan->save();

        return to_route('pegawai.kegiatan.myIndex')->with('success', 'Dokumentasi penyerahan berhasil diunggah.');
    }

    /**
     * Menyelesaikan kegiatan dan menyimpan berita acara.
     * Menggabungkan logika dari BeritaAcaraController::store().
     */
    public function selesaikanKegiatan(StoreBeritaAcaraRequest $request, Kegiatan $kegiatan)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        if ($request->hasFile('file_berita_acara')) {
            $data['file_berita_acara'] = $request->file('file_berita_acara')->store('berita_acara', 'public');
        }

        $kegiatan->beritaAcara()->create($data);
        $kegiatan->tahapan = TahapanKegiatan::SELESAI->value;
        $kegiatan->status_akhir = $data['status_akhir'];
        $kegiatan->save();

        return to_route('pegawai.kegiatan.myIndex')->with('success', 'Kegiatan telah berhasil diselesaikan.');
    }
}
