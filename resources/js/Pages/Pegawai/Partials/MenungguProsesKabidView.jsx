import { Link } from '@inertiajs/react';

export default function MenungguProsesKabidView({ kegiatans }) {
    return (
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-100 uppercase bg-gray-700">
                <tr className="text-nowrap">
                    {/* Kolom 1: Nama Kegiatan */}
                    <th className="px-4 py-3">Nama Kegiatan</th>
                    {/* Kolom 2: Status Proses */}
                    <th className="px-4 py-3">Status Proses</th>
                    {/* Kolom 3: Aksi (hanya untuk melihat detail) */}
                    <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {kegiatans.data.length > 0 ? (
                    kegiatans.data.map((kegiatan) => (
                        <tr key={kegiatan.id} className="bg-white border-b">
                            <td className="px-4 py-2 font-medium text-gray-900">
                                {kegiatan.nama_kegiatan}
                            </td>
                            <td className="px-4 py-2">
                                <span className="px-2 py-1 font-semibold leading-tight text-blue-700 bg-blue-100 rounded-full">
                                    Sedang Diproses oleh Kabid
                                </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                                {/* Tombol ini hanya untuk melihat detail, tidak ada aksi perubahan */}
                                <Link 
                                    href={route('arsip.show', kegiatan.id)} 
                                    className="font-medium text-indigo-600 hover:underline"
                                >
                                    Lihat Detail
                                </Link>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" className="px-4 py-6 text-center text-gray-500">
                            Tidak ada kegiatan yang sedang menunggu proses.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
