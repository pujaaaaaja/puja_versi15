import { Link } from '@inertiajs/react';

export default function SelesaiView({ kegiatans }) {
    return (
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-100 uppercase bg-gray-700">
                <tr className="text-nowrap">
                    <th className="px-4 py-3">Nama Kegiatan</th>
                    <th className="px-4 py-3">Tanggal Selesai</th>
                    <th className="px-4 py-3">Status Akhir</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {kegiatans.data.length > 0 ? (
                    kegiatans.data.map((kegiatan) => (
                        <tr key={kegiatan.id} className="bg-white border-b">
                            <td className="px-4 py-2">{kegiatan.nama_kegiatan}</td>
                            <td className="px-4 py-2">{new Date(kegiatan.updated_at).toLocaleDateString("id-ID")}</td>
                            <td className="px-4 py-2">
                                <span className="px-2 py-1 font-semibold leading-tight text-gray-700 bg-gray-100 rounded-full">
                                    {kegiatan.status_akhir}
                                </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                                <Link href={route('arsip.show', kegiatan.id)} className="font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-lg text-nowrap">
                                    Lihat Arsip
                                </Link>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                            Tidak ada kegiatan yang telah selesai.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
