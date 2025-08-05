import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import Dialog from '@/Components/Dialog';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import Swal from 'sweetalert2';
import TextInput from '@/Components/TextInput';

export default function DokumentasiPenyerahanView({ kegiatans }) {
    // State untuk mengelola dialog box
    const [modalState, setModalState] = useState({
        isPenyerahanOpen: false,
        isPihakKetigaOpen: false,
    });
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);

    // Form untuk DOKUMENTASI PENYERAHAN
    const penyerahanForm = useForm({
        judul: '',
        fotos: [], // Izinkan multiple files
    });

    // Form untuk FILE PIHAK KETIGA
    const pihakKetigaForm = useForm({
        file_pihak_ketiga: null,
    });

    // --- Fungsi untuk membuka dan menutup dialog ---
    const openModal = (type, kegiatan) => {
        setSelectedKegiatan(kegiatan);
        if (type === 'penyerahan') {
            setModalState({ ...modalState, isPenyerahanOpen: true });
        } else if (type === 'pihakKetiga') {
            setModalState({ ...modalState, isPihakKetigaOpen: true });
        }
    };

    const closeModal = () => {
        setModalState({ isPenyerahanOpen: false, isPihakKetigaOpen: false });
        setSelectedKegiatan(null);
        penyerahanForm.reset();
        pihakKetigaForm.reset();
    };

    // --- Handler untuk Submit Form ---

    // Handler untuk form DOKUMENTASI PENYERAHAN
    const handlePenyerahanSubmit = (e) => {
        e.preventDefault();
        if (!selectedKegiatan) return;

        penyerahanForm.post(route('pegawai.kegiatan.storePenyerahan', selectedKegiatan.id), {
            onSuccess: () => {
                closeModal();
                Swal.fire('Berhasil!', 'Dokumentasi penyerahan berhasil disimpan.', 'success');
            },
            onError: (err) => {
                const errorMessages = Object.values(err).join('<br/>');
                Swal.fire('Gagal!', `Terjadi kesalahan:<br/><br/>${errorMessages}`, 'error');
            },
            preserveScroll: true,
        });
    };
    
    // Handler untuk form FILE PIHAK KETIGA
    const handlePihakKetigaSubmit = (e) => {
        e.preventDefault();
        if (!selectedKegiatan) return;

        pihakKetigaForm.post(route('pegawai.kegiatan.uploadPihakKetiga', selectedKegiatan.id), {
            onSuccess: () => {
                closeModal();
                Swal.fire('Berhasil!', 'File dari pihak ketiga berhasil diunggah.', 'success');
            },
            onError: (err) => {
                const errorMessages = Object.values(err).join('<br/>');
                Swal.fire('Gagal!', `Terjadi kesalahan:<br/><br/>${errorMessages}`, 'error');
            },
            preserveScroll: true,
        });
    };


    return (
        <>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-100 uppercase bg-gray-700">
                    <tr className="text-nowrap">
                        <th className="px-4 py-3">Nama Kegiatan</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Status Penyerahan</th>
                        <th className="px-4 py-3">Dokumen Pihak Ke-3</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {kegiatans.data.length > 0 ? (
                        kegiatans.data.map((kegiatan) => {
                            const dokPenyerahan = (kegiatan.dokumentasi ?? []).find(d => d.tipe === 'penyerahan');
                            return (
                                <tr key={kegiatan.id} className="bg-white border-b">
                                    <td className="px-4 py-2">{kegiatan.nama_kegiatan}</td>
                                    <td className="px-4 py-2">{kegiatan.tanggal_kegiatan}</td>
                                    <td className="px-4 py-2">
                                        {dokPenyerahan ? (
                                            <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">Sudah Diisi</span>
                                        ) : (
                                            <span className="px-2 py-1 font-semibold leading-tight text-orange-700 bg-orange-100 rounded-full">Belum Diisi</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {kegiatan.file_pihak_ketiga_path ? (
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">Sudah Diunggah</span>
                                                <a href={`/storage/${kegiatan.file_pihak_ketiga_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">(Lihat)</a>
                                            </div>
                                        ) : (
                                            <button onClick={() => openModal('pihakKetiga', kegiatan)} className="font-medium text-white bg-teal-500 hover:bg-teal-600 py-1 px-3 rounded-lg text-xs text-nowrap">
                                                Unggah File
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {/* --- PERBAIKAN LOGIKA DI SINI --- */}
                                        {dokPenyerahan ? (
                                            // Jika sudah diisi, arahkan ke halaman penyelesaian, BUKAN arsip
                                            <Link 
                                                href={route('pegawai.kegiatan.myIndex', { tahapan: 'penyelesaian' })} 
                                                className="font-medium text-white bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg text-nowrap"
                                            >
                                                Lanjutkan Penyelesaian
                                            </Link>
                                        ) : (
                                            // Jika belum, buka modal untuk mengisi
                                            <button onClick={() => openModal('penyerahan', kegiatan)} className="font-medium text-white bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-lg text-nowrap">
                                                Lakukan Penyerahan
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                Tidak ada kegiatan pada tahap ini.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Dialog Box untuk DOKUMENTASI PENYERAHAN */}
            <Dialog show={modalState.isPenyerahanOpen} onClose={closeModal}>
                <form onSubmit={handlePenyerahanSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Dokumentasi Penyerahan
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Lengkapi dokumentasi untuk kegiatan: <span className="font-semibold">{selectedKegiatan?.nama_kegiatan}</span>
                    </p>

                    <div className="mt-6">
                        <label htmlFor="judul" className="block text-sm font-medium text-gray-700">
                            Judul Dokumentasi
                        </label>
                        <TextInput
                            id="judul"
                            name="judul"
                            value={penyerahanForm.data.judul}
                            className="mt-1 block w-full"
                            onChange={(e) => penyerahanForm.setData('judul', e.target.value)}
                            required
                        />
                        <InputError message={penyerahanForm.errors.judul} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="fotos" className="block text-sm font-medium text-gray-700">
                            Unggah Foto Bukti (Bisa lebih dari satu)
                        </label>
                        <input
                            id="fotos"
                            type="file"
                            name="fotos"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            onChange={(e) => penyerahanForm.setData('fotos', e.target.files)}
                            multiple
                            accept="image/*"
                            required
                        />
                        <InputError message={penyerahanForm.errors.fotos} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={penyerahanForm.processing}>
                            {penyerahanForm.processing ? 'Menyimpan...' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Dialog>

            {/* Dialog Box untuk UPLOAD FILE PIHAK KETIGA (sudah ada sebelumnya) */}
            <Dialog show={modalState.isPihakKetigaOpen} onClose={closeModal}>
                 <form onSubmit={handlePihakKetigaSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Unggah Dokumen Pihak Ketiga
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Untuk kegiatan: <span className="font-semibold">{selectedKegiatan?.nama_kegiatan}</span>
                    </p>

                    <div className="mt-6">
                        <label htmlFor="file_pihak_ketiga" className="block text-sm font-medium text-gray-700">
                            Pilih File (PDF)
                        </label>
                        <input
                            id="file_pihak_ketiga"
                            type="file"
                            name="file_pihak_ketiga"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={(e) => pihakKetigaForm.setData('file_pihak_ketiga', e.target.files[0])}
                            accept=".pdf"
                            required
                        />
                        <InputError message={pihakKetigaForm.errors.file_pihak_ketiga} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={pihakKetigaForm.processing}>
                            {pihakKetigaForm.processing ? 'Mengunggah...' : 'Unggah'}
                        </PrimaryButton>
                    </div>
                </form>
            </Dialog>
        </>
    );
}
