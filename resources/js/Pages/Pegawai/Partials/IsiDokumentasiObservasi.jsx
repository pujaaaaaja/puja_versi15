// File: resources/js/Pages/Pegawai/Partials/IsiDokumentasiObservasi.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextAreaInput from '@/Components/TextAreaInput';

/**
 * Komponen ini adalah form yang akan ditampilkan di dalam modal
 * untuk mengisi dokumentasi observasi.
 * @param {object} kegiatan - Objek kegiatan yang sedang diproses.
 * @param {function} closeModal - Fungsi untuk menutup modal.
 */
export default function IsiDokumentasiObservasi({ kegiatan, closeModal }) {
    // Menggunakan hook useForm dari Inertia untuk mengelola state form.
    // Nama field disesuaikan dengan yang ada di PegawaiController.
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_dokumentasi: '',
        catatan_observasi: '',
        foto_path: [], // Siap menampung banyak file
    });

    // Fungsi yang dijalankan saat form di-submit
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Kirim data ke rute yang sudah ada untuk menyimpan observasi.
        // Inertia otomatis akan menangani form dengan file (multipart/form-data).
        post(route('pegawai.kegiatan.storeObservasi', kegiatan.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal(); // Tutup modal jika berhasil
                reset();      // Kosongkan form setelah submit
                // Tampilkan notifikasi SweetAlert
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Dokumentasi observasi berhasil disimpan dan kegiatan dilanjutkan ke tahap berikutnya.',
                });
            },
            onError: (err) => {
                console.error("Gagal menyimpan dokumentasi:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menyimpan!',
                    text: 'Pastikan semua data yang wajib diisi sudah lengkap dan format file benar.',
                });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-lg font-medium text-gray-900">
                Formulir Dokumentasi Observasi
            </h2>
            <p className="mt-1 text-sm text-gray-600">
                Lengkapi detail observasi untuk kegiatan "{kegiatan.nama_kegiatan}".
            </p>

            <div className="mt-6">
                <InputLabel htmlFor="nama_dokumentasi" value="Judul Dokumentasi" />
                <TextInput
                    id="nama_dokumentasi"
                    name="nama_dokumentasi"
                    value={data.nama_dokumentasi}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('nama_dokumentasi', e.target.value)}
                    required
                />
                <InputError message={errors.nama_dokumentasi} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="catatan_observasi" value="Catatan Observasi" />
                <TextAreaInput
                    id="catatan_observasi"
                    name="catatan_observasi"
                    value={data.catatan_observasi}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('catatan_observasi', e.target.value)}
                    required
                    rows="4"
                />
                <InputError message={errors.catatan_observasi} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="foto_path" value="Unggah Foto Bukti (Bisa lebih dari satu)" />
                <input
                    id="foto_path"
                    type="file"
                    name="foto_path[]" // Tambahkan [] untuk menangani multiple files di backend
                    multiple
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setData('foto_path', e.target.files)}
                />
                <InputError message={errors.foto_path} className="mt-2" />
            </div>

            <div className="mt-6 flex justify-end">
                <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                <PrimaryButton className="ms-3" disabled={processing}>
                    Simpan
                </PrimaryButton>
            </div>
        </form>
    );
}
