import { Link } from '@inertiajs/react';

export default function PerjalananDinasView({ kegiatans, openModal }) {
    return (
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-100 uppercase bg-gray-700">
                <tr className="text-nowrap">
                    <th className="px-4 py-3">Nama Kegiatan</th>
                    <th className="px-4 py-3">Proposal</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {kegiatans.data.length > 0 ? (
                    kegiatans.data.map((kegiatan) => (
                        <tr key={kegiatan.id} className="bg-white border-b">
                            <td className="px-4 py-2">{kegiatan.nama_kegiatan}</td>
                            <td className="px-4 py-2"><Link href={route('proposal.show', kegiatan.proposal.id)} className="text-blue-600 hover:underline">Lihat</Link></td>
                            <td className="px-4 py-2">{kegiatan.tanggal_kegiatan}</td>
                            <td className="px-4 py-2 text-center">
                                <button onClick={() => openModal('confirm', kegiatan)} className="font-medium text-white bg-teal-500 hover:bg-teal-600 py-2 px-4 rounded-lg text-nowrap">
                                    Konfirmasi Kehadiran
                                </button>
                            </td>
                        </tr>
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
