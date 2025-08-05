// resources/js/Pages/Pegawai/Partials/PenyelesaianView.jsx

import { useForm, Link, router } from '@inertiajs/react'; // <-- Tambahkan 'router'
import Swal from 'sweetalert2';

const PenyelesaianRow = ({ kegiatan }) => {
    const { data: baData, setData: setBaData, post: postBa, processing: processingBa, errors: baErrors, reset: resetBa } = useForm({
        file_berita_acara: null,
    });

    const { data: statusData, setData: setStatusData, patch: patchStatus, processing: processingStatus, errors: statusErrors } = useForm({
        status_akhir: kegiatan.status_akhir || 'Selesai',
    });

    function handleBeritaAcaraSubmit(e) {
        e.preventDefault();
        postBa(route('pegawai.kegiatan.storeBeritaAcara', kegiatan.id), {
            preserveScroll: true,
            onSuccess: () => {
                resetBa();
                Swal.fire('Berhasil!', 'File Berita Acara berhasil diunggah.', 'success');
            },
            onError: (err) => {
                 Swal.fire('Gagal!', err.file_berita_acara || 'Terjadi kesalahan saat mengunggah file.', 'error');
            }
        });
    }

    function handleStatusSubmit(e) {
        e.preventDefault();
        patchStatus(route('pegawai.kegiatan.updateStatus', kegiatan.id), {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire('Berhasil!', 'Status kegiatan berhasil diperbarui.', 'success').then(() => {
                    // --- PERMINTAAN BARU: Pindah ke tab 'selesai' ---
                    router.get(route('pegawai.kegiatan.myIndex', { tahapan: 'selesai' }));
                });
            }
        });
    }

    const hasBeritaAcara = !!kegiatan.berita_acara;

    return (
        <tr className="bg-white border-b">
            <td className="px-4 py-2 align-middle">{kegiatan.nama_kegiatan}</td>
            
            {/* Kolom Berita Acara (Baru) */}
            <td className="px-4 py-2 align-middle">
                {/* --- PERMINTAAN BARU: Logika untuk menyembunyikan form --- */}
                {hasBeritaAcara ? (
                    <a 
                        href={kegiatan.berita_acara.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        Lihat Berita Acara
                    </a>
                ) : (
                    <form onSubmit={handleBeritaAcaraSubmit} className="flex items-center gap-2">
                        <input
                            type="file"
                            onChange={(e) => setBaData('file_berita_acara', e.target.files[0])}
                            className="block w-full text-xs text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:bg-gray-200 file:border-0 file:px-2 file:py-1 file:mr-2"
                            required
                        />
                        <button type="submit" disabled={processingBa} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 disabled:bg-blue-300">
                            Unggah
                        </button>
                    </form>
                )}
                 {baErrors.file_berita_acara && <p className="text-red-500 text-xs mt-1">{baErrors.file_berita_acara}</p>}
            </td>

            <td className="px-4 py-2 align-middle">{kegiatan.tanggal_kegiatan}</td>

            {/* Kolom Aksi (Diubah) */}
            <td className="px-4 py-2 text-center align-middle">
                 <form onSubmit={handleStatusSubmit} className="flex items-center justify-center gap-2">
                    <select
                        value={statusData.status_akhir}
                        onChange={(e) => setStatusData('status_akhir', e.target.value)}
                        className="border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-100"
                        disabled={!hasBeritaAcara}
                    >
                        <option>Selesai</option>
                        <option>Ditunda</option>
                        <option>Dibatalkan</option>
                    </select>
                    <button type="submit" disabled={!hasBeritaAcara || processingStatus} className="bg-green-500 text-white px-3 py-1.5 rounded text-xs hover:bg-green-600 disabled:bg-gray-400">
                        Simpan
                    </button>
                 </form>
                 {statusErrors.status_akhir && <p className="text-red-500 text-xs mt-1">{statusErrors.status_akhir}</p>}
            </td>
        </tr>
    );
};


export default function PenyelesaianView({ kegiatans }) {
    return (
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-100 uppercase bg-gray-700">
                <tr className="text-nowrap">
                    <th className="px-4 py-3">Nama Kegiatan</th>
                    <th className="px-4 py-3">Berita Acara</th>
                    <th className="px-4 py-3">Tanggal Kegiatan</th>
                    <th className="px-4 py-3 text-center">Status Akhir</th>
                </tr>
            </thead>
            <tbody>
                {kegiatans.data.length > 0 ? (
                    kegiatans.data.map((kegiatan) => (
                        <PenyelesaianRow key={kegiatan.id} kegiatan={kegiatan} />
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                            Tidak ada kegiatan pada tahap ini.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}