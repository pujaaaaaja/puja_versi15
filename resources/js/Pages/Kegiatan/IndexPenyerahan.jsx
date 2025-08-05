import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import Dialog from '@/Components/Dialog';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

// Komponen terpisah untuk setiap baris agar state tidak tercampur
const KegiatanRow = ({ kegiatan }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- PERUBAHAN 1: Gunakan `post` dan tambahkan `_method: 'patch'` ---
    // Kita akan mengirim sebagai POST, tapi memberitahu Laravel ini adalah PATCH.
    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal_penyerahan: '',
        file_sktl: null,
        _method: 'patch', // Memberitahu Laravel untuk memperlakukan ini sebagai request PATCH
    });

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    // --- PERUBAHAN 2: Panggil `post` saat submit ---
    const handleSubmit = (e) => {
        e.preventDefault();
        // Mengirim sebagai POST. Inertia akan otomatis membuat FormData karena ada file.
        // Field `_method: 'patch'` yang kita set di atas akan disertakan.
        post(route('manajemen.penyerahan.update', kegiatan.id), {
            onSuccess: () => {
                closeModal();
                Swal.fire('Berhasil!', 'Kegiatan telah dilanjutkan ke tahap penyerahan.', 'success');
            },
            onError: (err) => {
                const errorMessages = Object.values(err).join('\n');
                Swal.fire('Gagal!', `Terjadi kesalahan. \n\n${errorMessages}`, 'error');
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <tr className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{kegiatan.nama_kegiatan}</td>
                <td className="px-6 py-4">{kegiatan.tim?.nama_tim || 'Belum ada tim'}</td>
                <td className="px-6 py-4">{kegiatan.tanggal_kegiatan}</td>
                <td className="px-6 py-4 text-right">
                    <button
                        onClick={openModal}
                        className="font-medium text-blue-600 hover:underline"
                    >
                        Proses Penyerahan
                    </button>
                </td>
            </tr>

            <Dialog show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Proses Penyerahan untuk "{kegiatan.nama_kegiatan}"
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Unggah SKTL Penyerahan untuk melanjutkan kegiatan.
                    </p>

                    <div className="mt-6">
                        <label htmlFor="tanggal_penyerahan" className="block text-sm font-medium text-gray-700">
                            Tanggal Penyerahan
                        </label>
                        <TextInput
                            id="tanggal_penyerahan"
                            type="date"
                            name="tanggal_penyerahan"
                            value={data.tanggal_penyerahan}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('tanggal_penyerahan', e.target.value)}
                            required
                        />
                        <InputError message={errors.tanggal_penyerahan} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="file_sktl" className="block text-sm font-medium text-gray-700">
                            File SKTL Penyerahan (PDF, JPG, PNG)
                        </label>
                        <input
                            id="file_sktl"
                            type="file"
                            name="file_sktl"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={(e) => setData('file_sktl', e.target.files[0])}
                            required
                        />
                        <InputError message={errors.file_sktl} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModal}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>
                            {processing ? 'Memproses...' : 'Lanjutkan Tahap'}
                        </PrimaryButton>
                    </div>
                </form>
            </Dialog>
        </>
    );
};


export default function IndexPenyerahan({ auth, kegiatans, success }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Penyerahan Kegiatan</h2>}
        >
            <Head title="Manajemen Penyerahan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <p className="mb-4 text-gray-600">
                                Daftar kegiatan yang telah menyelesaikan tahap observasi dan siap untuk dilanjutkan ke tahap penyerahan.
                            </p>
                            
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Nama Kegiatan</th>
                                            <th scope="col" className="px-6 py-3">Tim Pelaksana</th>
                                            <th scope="col" className="px-6 py-3">Tanggal Kegiatan</th>
                                            <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kegiatans.data.length > 0 ? (
                                            kegiatans.data.map(kegiatan => (
                                                <KegiatanRow key={kegiatan.id} kegiatan={kegiatan} />
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center">
                                                    Tidak ada kegiatan yang perlu diproses saat ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination className="mt-6" links={kegiatans.meta.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
