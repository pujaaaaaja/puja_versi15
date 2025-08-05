<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Enums\TahapanKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Requests\StoreBeritaAcaraRequest;
use App\Http\Requests\StoreDokumentasiWithFilesRequest;

class PegawaiController extends Controller
{
    /**
     * Menampilkan halaman "Kegiatan Saya" untuk pegawai.
     */
    public function myIndex(Request $request)
    {
        $user = Auth::user();
        $query = Kegiatan::with(['tim.users', 'proposal'])
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

        return Inertia::render('Pegawai/KegiatanSaya', [
            'kegiatans' => $kegiatans,
            'queryParams' => $request->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Menangani konfirmasi kehadiran pegawai.
     */
    public function konfirmasiKehadiran(Request $request, Kegiatan $kegiatan)
    {
        $kegiatan->tahapan = TahapanKegiatan::DOKUMENTASI_OBSERVASI;
        $kegiatan->save();

        return to_route('pegawai.kegiatan.myIndex')->with('success', 'Kehadiran berhasil dikonfirmasi dan kegiatan dimulai.');
    }

    /**
     * Menyimpan dokumentasi observasi.
     * Dikembalikan ke logika asli Anda untuk menyimpan file dan diperbaiki.
     */
    public function storeObservasi(StoreDokumentasiWithFilesRequest $request, Kegiatan $kegiatan)
    {
        $validated = $request->validated();

        $dokumentasiData = [
            'nama_dokumentasi' => $validated['nama_dokumentasi'],
            'deskripsi' => $validated['deskripsi'],
            'tipe' => 'observasi',
        ];

        $dokumentasi = $kegiatan->dokumentasi()->create($dokumentasiData);

        // Simpan foto jika ada
        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $file) {
                $path = $file->store('dokumentasi/fotos', 'public');
                // PERBAIKAN: Menggunakan nama kolom yang benar 'file_path'
                $dokumentasi->fotos()->create(['file_path' => $path]);
            }
        }

        // Setelah dokumentasi observasi disimpan, ubah tahapan ke 'menunggu proses kabid'
        $kegiatan->update([
            'tahapan' => TahapanKegiatan::MENUNGGU_PROSES_KABID,
        ]);

        return redirect()->route('pegawai.kegiatan.myIndex')->with('success', 'Dokumentasi observasi berhasil diunggah.');
    }

    /**
     * Menyimpan dokumentasi penyerahan.
     */
    public function storePenyerahan(StoreDokumentasiWithFilesRequest $request, Kegiatan $kegiatan)
    {
        $validated = $request->validated();

        $dokumentasiData = [
            'nama_dokumentasi' => $validated['nama_dokumentasi'],
            'deskripsi' => $validated['deskripsi'],
            'tipe' => 'penyerahan',
        ];

        $dokumentasi = $kegiatan->dokumentasi()->create($dokumentasiData);

        if ($request->hasFile('fotos')) {
             foreach ($request->file('fotos') as $file) {
                $path = $file->store('dokumentasi/fotos', 'public');
                // PERBAIKAN: Menggunakan nama kolom yang benar 'file_path'
                $dokumentasi->fotos()->create(['file_path' => $path]);
            }
        }

        $kegiatan->update([
            'tahapan' => TahapanKegiatan::PENYELESAIAN,
        ]);

        return to_route('pegawai.kegiatan.myIndex')->with('success', 'Dokumentasi penyerahan berhasil diunggah.');
    }

    /**
     * Menyelesaikan kegiatan dan menyimpan berita acara.
     */
    public function selesaikanKegiatan(StoreBeritaAcaraRequest $request, Kegiatan $kegiatan)
    {
        $data = $request->validated();
        
        if ($request->hasFile('file_berita_acara')) {
            $data['file_berita_acara'] = $request->file('file_berita_acara')->store('berita_acara', 'public');
        }

        $kegiatan->beritaAcara()->create($data);
        
        $kegiatan->update([
            'tahapan' => TahapanKegiatan::SELESAI,
            'status_akhir' => $data['status_akhir'],
        ]);

        return to_route('pegawai.kegiatan.myIndex')->with('success', 'Kegiatan telah berhasil diselesaikan.');
    }
}
