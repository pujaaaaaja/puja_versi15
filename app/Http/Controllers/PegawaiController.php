<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Enums\TahapanKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Requests\StoreBeritaAcaraRequest;
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
        $query = Kegiatan::with(['tim.users', 'proposal', 'beritaAcara']) // <-- PERBAIKAN
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
    public function storePenyerahan(Request $request, Kegiatan $kegiatan)
{
    // Pastikan validasinya sesuai dengan form baru
    $validated = $request->validate([
        'judul' => 'required|string|max:255',
        'fotos' => 'required|array', // Validasi bahwa 'fotos' adalah array
        'fotos.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048' // Validasi setiap item di dalam array
    ]);

    // Buat dokumentasi kegiatan
    $dokumentasi = $kegiatan->dokumentasi()->create([
        'nama_dokumentasi' => $validated['judul'],
        'tipe' => 'penyerahan', // Tandai sebagai dokumentasi penyerahan
    ]);

    // Simpan setiap foto yang diunggah
    if ($request->hasFile('fotos')) {
        foreach ($request->file('fotos') as $file) {
            $path = $file->store('dokumentasi_foto', 'public');
            // Sesuaikan nama kolom dengan yang ada di tabel 'fotos'
            $dokumentasi->fotos()->create(['file_path' => $path]); // BENAR
        }
    }

    // Setelah dokumentasi disimpan, lanjutkan tahapan kegiatan
    $kegiatan->update([
        'tahapan' => TahapanKegiatan::PENYELESAIAN, // atau tahapan selanjutnya
    ]);

    return redirect()->back()->with('success', 'Dokumentasi penyerahan berhasil disimpan.');
}

    /**
     * Menyelesaikan kegiatan dan menyimpan berita acara.
     */
    public function storeBeritaAcara(Request $request, Kegiatan $kegiatan)
    {
        $validated = $request->validate([
            'file_berita_acara' => 'required|file|mimes:pdf,doc,docx|max:2048',
        ]);

        // Hapus berita acara lama jika ada
        if ($kegiatan->beritaAcara) {
            Storage::disk('public')->delete($kegiatan->beritaAcara->file_path);
            $kegiatan->beritaAcara->delete();
        }

        $filePath = $request->file('file_berita_acara')->store('berita_acara', 'public');

        $kegiatan->beritaAcara()->create([
            'nama_berita_acara' => 'Berita Acara - ' . $kegiatan->nama_kegiatan,
            'file_path' => $filePath,
        ]);

        return redirect()->back()->with('success', 'Berita Acara berhasil diunggah.');
    }
    public function updateStatusAkhir(Request $request, Kegiatan $kegiatan)
    {
        // Pastikan Berita Acara sudah ada sebelum mengubah status
        if (!$kegiatan->beritaAcara) {
            return redirect()->back()->withErrors(['status_akhir' => 'Harap unggah Berita Acara terlebih dahulu.']);
        }

        $validated = $request->validate([
            'status_akhir' => ['required', Rule::in(['Selesai', 'Ditunda', 'Dibatalkan'])],
        ]);

        $kegiatan->update([
            'status_akhir' => $validated['status_akhir'],
            'tahapan' => TahapanKegiatan::SELESAI,
        ]);

        return redirect()->back()->with('success', 'Status kegiatan telah diselesaikan.');
    }
    public function uploadPihakKetiga(Request $request, Kegiatan $kegiatan)
    {
    $validated = $request->validate([
        'file_pihak_ketiga' => 'required|file|mimes:pdf',
    ]);

        // Hapus file lama jika ada
        if ($kegiatan->file_pihak_ketiga_path && Storage::disk('public')->exists($kegiatan->file_pihak_ketiga_path)) {
            Storage::disk('public')->delete($kegiatan->file_pihak_ketiga_path);
        }

        // Simpan file baru dan dapatkan path-nya
        $filePath = $request->file('file_pihak_ketiga')->store('dokumen_pihak_ketiga', 'public');

        // Update path di database
        $kegiatan->update([
            'file_pihak_ketiga_path' => $filePath,
        ]);

        return redirect()->back()->with('success', 'File pihak ketiga berhasil diunggah.');
    }
}
