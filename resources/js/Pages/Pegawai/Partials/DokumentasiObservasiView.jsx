import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import TextAreaInput from '@/Components/TextAreaInput';
import Dialog from '@/Components/Dialog';
import SecondaryButton from '@/Components/SecondaryButton';

const FormRow = ({ kegiatan }) => {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_dokumentasi: '',
        catatan_observasi: '',
        foto_path: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('pegawai.kegiatan.storeObservasi', kegiatan.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowModal(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil Disimpan!',
                    text: 'Dokumentasi telah diisi dan kegiatan dilanjutkan ke tahap berikutnya.',
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: 'Pastikan semua data sudah terisi dengan benar.',
                });
            }
        });
    };

    return (
        <tr className="bg-white border-b">
            {/* Kolom Nama Kegiatan & Tanggal */}
            <td className="px-4 py-3 align-top">{kegiatan.nama_kegiatan}</td>
            <td className="px-4 py-3 align-top">{kegiatan.tanggal_kegiatan}</td>

            {/* Kolom Status Dokumentasi */}
            <td className="px-4 py-3 align-top">
                <span className="px-2 py-1 font-semibold leading-tight text-orange-700 bg-orange-100 rounded-full">
                    Belum Diisi
                </span>
            </td>

            {/* Kolom "Isi Dokumentasi" yang berisi tombol */}
            <td className="px-4 py-3">
                <button 
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Isi Dokumentasi
                </button>
            </td>

            {/* Kolom Aksi */}
            <td className="px-4 py-3 align-middle text-center">
                {/* Kosongkan kolom aksi karena tombol simpan ada di modal */}
            </td>

            {/* Dialog Box */}
            <Dialog show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Isi Dokumentasi Observasi - {kegiatan.nama_kegiatan}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor={`nama_dokumentasi_${kegiatan.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Judul Dokumentasi
                            </label>
                            <TextInput
                                id={`nama_dokumentasi_${kegiatan.id}`}
                                name="nama_dokumentasi"
                                placeholder="Masukkan judul dokumentasi"
                                className="w-full"
                                value={data.nama_dokumentasi}
                                onChange={(e) => setData('nama_dokumentasi', e.target.value)}
                                required
                            />
                            <InputError message={errors.nama_dokumentasi} className="mt-1" />
                        </div>

                        <div>
                            <label htmlFor={`catatan_observasi_${kegiatan.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Catatan Observasi
                            </label>
                            <TextAreaInput
                                id={`catatan_observasi_${kegiatan.id}`}
                                name="catatan_observasi"
                                placeholder="Masukkan catatan observasi"
                                className="w-full"
                                rows="4"
                                value={data.catatan_observasi}
                                onChange={(e) => setData('catatan_observasi', e.target.value)}
                            />
                            <InputError message={errors.catatan_observasi} className="mt-1" />
                        </div>

                        <div>
                            <label htmlFor={`foto_path_${kegiatan.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Unggah Foto Bukti (Opsional)
                            </label>
                            <input
                                id={`foto_path_${kegiatan.id}`}
                                type="file"
                                name="foto_path"
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                onChange={(e) => setData('foto_path', e.target.files[0])}
                            />
                            <InputError message={errors.foto_path} className="mt-1" />
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <SecondaryButton onClick={() => setShowModal(false)}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Dialog>
        </tr>
    );
};

export default function DokumentasiObservasiView({ kegiatans }) {
    return (
        <div className="overflow-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-100 uppercase bg-gray-700">
                    <tr className="text-nowrap">
                        <th className="px-4 py-3">Nama Kegiatan</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Isi Dokumentasi</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {kegiatans.data.length > 0 ? (
                        kegiatans.data.map((kegiatan) => {
                            const dokObservasi = (kegiatan.dokumentasi ?? []).find(d => d.tipe === 'observasi');
                            
                            if (!dokObservasi) {
                                return <FormRow key={kegiatan.id} kegiatan={kegiatan} />;
                            }
                            return null;
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                Tidak ada kegiatan yang memerlukan dokumentasi observasi.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}