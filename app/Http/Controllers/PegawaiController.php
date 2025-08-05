<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Enums\TahapanKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Requests\StoreDokumentasiWithFilesRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PegawaiController extends Controller
{
    /**
     * Menampilkan halaman "Kegiatan Saya" untuk pegawai.
     */
    public function myIndex(Request $request)
    {
        $user = Auth::user();
        $query = Kegiatan::with(['tim.users', 'proposal', 'beritaAcara', 'kontrak']) // Eager load semua relasi
            ->whereHas('tim.users', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

        $tahapan = $request->query('tahapan');
        if ($tahapan && $tahapan !== 'semua') {
            $query->where('tahapan', $tahapan);
        } else {
            // Secara default, tampilkan semua yang belum selesai
            $query->where('tahapan', '!=', TahapanKegiatan::SELESAI);
        }
        
        $kegiatans = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Pegawai/KegiatanSaya', [
            'kegiatans' => $kegiatans,
            'queryParams' => $request->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Menangani konfirmasi kehadiran pegawai untuk memulai kegiatan.
     */
    public function konfirmasiKehadiran(Request $request, Kegiatan $kegiatan)
    {
        $kegiatan->tahapan = TahapanKegiatan::DOKUMENTASI_OBSERVASI;
        $kegiatan->save();

        return to_route('pegawai.kegiatan.myIndex')->with('success', 'Kehadiran berhasil dikonfirmasi.');
    }

    /**
     * Menyimpan dokumentasi observasi.
     */
    public function storeObservasi(StoreDokumentasiWithFilesRequest $request, Kegiatan $kegiatan)
    {
        $validated = $request->validated();

        $dokumentasi = $kegiatan->dokumentasi()->create([
            'nama_dokumentasi' => $validated['nama_dokumentasi'],
            'deskripsi' => $validated['deskripsi'],
            'tipe' => 'observasi',
        ]);

        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $file) {
                $path = $file->store('dokumentasi/fotos', 'public');
                $dokumentasi->fotos()->create(['file_path' => $path]);
            }
        }
        
        $kegiatan->update(['tahapan' => TahapanKegiatan::MENUNGGU_PROSES_KABID]);

        return redirect()->route('pegawai.kegiatan.myIndex')->with('success', 'Dokumentasi observasi berhasil diunggah.');
    }

    /**
     * Menyimpan semua file untuk tahap penyerahan.
     */
    public function storePenyerahan(Request $request, Kegiatan $kegiatan)
    {
        $validated = $request->validate([
            'nama_dokumentasi' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'fotos' => 'nullable|array',
            'fotos.*' => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $dokumentasi = $kegiatan->dokumentasi()->create([
            'nama_dokumentasi' => $validated['nama_dokumentasi'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'tipe' => 'penyerahan',
        ]);

        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $file) {
                $path = $file->store('dokumentasi/fotos', 'public');
                $dokumentasi->fotos()->create(['file_path' => $path]);
            }
        }

        $kegiatan->update(['tahapan' => TahapanKegiatan::PENYELESAIAN]);

        return redirect()->route('pegawai.kegiatan.myIndex')->with('success', 'Dokumentasi penyerahan berhasil diproses.');
    }

    /**
     * PERBAIKAN: Menambahkan kembali method untuk unggah file pihak ketiga.
     * Method ini akan menangani pembuatan atau pembaruan kontrak.
     */
    public function uploadPihakKetiga(Request $request, Kegiatan $kegiatan)
    {
        $validated = $request->validate([
            'file_pihak_ketiga' => 'required|file|mimes:pdf|max:2048',
        ]);
    
        // Cek apakah sudah ada kontrak, jika ada, hapus file lama
        if ($kegiatan->kontrak) {
            Storage::disk('public')->delete($kegiatan->kontrak->file_path);
            $kegiatan->kontrak->delete();
        }
    
        // Simpan file baru dan dapatkan path-nya
        $filePath = $request->file('file_pihak_ketiga')->store('kegiatan/kontrak', 'public');
    
        // Buat record kontrak baru yang berelasi dengan kegiatan
        $kegiatan->kontrak()->create([
            'nama_kontrak' => 'Kontrak Pihak Ketiga - ' . $kegiatan->nama_kegiatan,
            'file_path' => $filePath,
        ]);
    
        return redirect()->back()->with('success', 'File pihak ketiga berhasil diunggah.');
    }

    /**
     * Menyelesaikan kegiatan dengan menyimpan Berita Acara dan Status Akhir.
     */
    public function storePenyelesaian(Request $request, Kegiatan $kegiatan)
    {
        $validated = $request->validate([
            'file_berita_acara' => 'required|file|mimes:pdf,doc,docx|max:2048',
            'status_akhir' => ['required', Rule::in(['Selesai', 'Ditunda', 'Dibatalkan'])],
        ]);

        if ($kegiatan->beritaAcara) {
            Storage::disk('public')->delete($kegiatan->beritaAcara->file_path);
            $kegiatan->beritaAcara->delete();
        }

        $filePath = $request->file('file_berita_acara')->store('berita_acara', 'public');
        $kegiatan->beritaAcara()->create([
            'nama_berita_acara' => 'Berita Acara - ' . $kegiatan->nama_kegiatan,
            'file_path' => $filePath,
        ]);

        $kegiatan->update([
            'status_akhir' => $validated['status_akhir'],
            'tahapan' => TahapanKegiatan::SELESAI,
        ]);

        return redirect()->route('pegawai.kegiatan.myIndex')->with('success', 'Kegiatan telah berhasil diselesaikan.');
    }
    public function storeBeritaAcara(Request $request, Kegiatan $kegiatan)
    {
        $request->validate([
            'file_berita_acara' => 'required|file|mimes:pdf,doc,docx|max:2048', // Contoh validasi
        ]);

        // Logika untuk menyimpan file
        if ($request->hasFile('file_berita_acara')) {
            $path = $request->file('file_berita_acara')->store('berita-acara', 'public');

            // Simpan path ke database, misalnya di model Kegiatan atau model lain
            // $kegiatan->berita_acara_path = $path;
            // $kegiatan->save();

            return redirect()->back()->with('success', 'File Berita Acara berhasil diunggah!');
        }

        return redirect()->back()->with('error', 'Gagal mengunggah file.');
    }
}
