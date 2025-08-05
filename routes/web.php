<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TimController;
use App\Http\Controllers\ProposalController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ArsipController;
use App\Http\Controllers\VerifikasiProposalController;
use App\Http\Controllers\ManajemenPenyerahanController;
use App\Http\Controllers\PegawaiController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- Rute untuk Semua Peran yang Terotentikasi ---
    Route::get('/arsip', [ArsipController::class, 'index'])->name('arsip.index');
    Route::get('/arsip/{kegiatan}', [ArsipController::class, 'show'])->name('arsip.show');

    // --- Rute untuk Role: Pengusul ---
    Route::middleware(['role:pengusul|admin'])->group(function () {
        Route::get('/proposal-saya', [ProposalController::class, 'myProposals'])->name('proposal.myIndex');
        Route::get('/proposal/create', [ProposalController::class, 'create'])->name('proposal.create');
        Route::post('/proposal', [ProposalController::class, 'store'])->name('proposal.store');
    });

    // --- Rute Bersama untuk Kadis, Kabid & Admin ---
    // Proposal yang disetujui kini dapat diakses oleh Kadis dan Kabid melalui rute yang sama.
    Route::middleware(['role:kadis|kabid|admin'])->group(function() {
        Route::get('/proposal-disetujui', [ProposalController::class, 'approvedIndex'])->name('kabid.proposal.index');
    });

    // --- Rute untuk Role: Kadis ---
    Route::middleware(['role:kadis|admin'])->group(function () {
        Route::get('/verifikasi-proposal', [VerifikasiProposalController::class, 'index'])->name('verifikasi.proposal.index');
        Route::patch('/verifikasi-proposal/{proposal}', [VerifikasiProposalController::class, 'update'])->name('verifikasi.proposal.update');
        // Rute proposal-disetujui telah dipindahkan ke grup bersama di atas
    });

    // --- Rute untuk Role: Kabid & Admin ---
    Route::middleware(['role:kabid|admin'])->group(function () {
        Route::resource('tim', TimController::class);
        Route::resource('kegiatan', KegiatanController::class);
        // Rute proposal-disetujui telah dipindahkan ke grup bersama di atas
        Route::get('/manajemen-penyerahan', [ManajemenPenyerahanController::class, 'index'])->name('manajemen.penyerahan.index');
        Route::patch('/manajemen-penyerahan/{kegiatan}', [ManajemenPenyerahanController::class, 'update'])->name('manajemen.penyerahan.update');
    });
    
    // --- Rute KHUSUS untuk Role: Pegawai ---
    Route::middleware(['role:pegawai|admin'])->prefix('kegiatan-saya')->name('pegawai.kegiatan.')->group(function () {
        Route::get('/', [PegawaiController::class, 'myIndex'])->name('myIndex');
        Route::post('/{kegiatan}/konfirmasi-kehadiran', [PegawaiController::class, 'konfirmasiKehadiran'])->name('confirmKehadiran');
        Route::post('/{kegiatan}/observasi', [PegawaiController::class, 'storeObservasi'])->name('storeObservasi');
        Route::post('/{kegiatan}/penyerahan', [PegawaiController::class, 'storePenyerahan'])->name('storePenyerahan');
        //Route::post('/{kegiatan}/selesaikan', [PegawaiController::class, 'selesaikanKegiatan'])->name('selesaikan');
        Route::post('/{kegiatan}/berita-acara', [PegawaiController::class, 'storeBeritaAcara'])->name('storeBeritaAcara');
        Route::patch('/{kegiatan}/status-akhir', [PegawaiController::class, 'updateStatusAkhir'])->name('updateStatus');
        Route::post('/{kegiatan}/upload-pihak-ketiga', [PegawaiController::class, 'uploadPihakKetiga'])->name('uploadPihakKetiga');
    });

    // --- Rute KHUSUS Admin ---
    Route::middleware(['role:admin'])->group(function() {
        Route::resource('user', UserController::class);
        Route::resource('proposal', ProposalController::class)->except(['create', 'store']);
    });
});

require __DIR__.'/auth.php';