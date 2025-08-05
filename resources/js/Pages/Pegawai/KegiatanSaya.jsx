import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import Pagination from "@/Components/Pagination";
import Modal from "@/Components/Modal";
import Swal from 'sweetalert2';
// Import komponen-komponen lainnya (Button, Input, dll.)
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import InputLabel from "@/Components/InputLabel";
import TextAreaInput from "@/Components/TextAreaInput";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";

// --- IMPORT KOMPONEN VIEW YANG BARU DIBUAT ---
import PerjalananDinasView from "./Partials/PerjalananDinasView";
import DokumentasiObservasiView from "./Partials/DokumentasiObservasiView";
import MenungguProsesKabidView from "./Partials/MenungguProsesKabidView";
import DokumentasiPenyerahanView from "./Partials/DokumentasiPenyerahanView";
import PenyelesaianView from "./Partials/PenyelesaianView";
import SelesaiView from "./Partials/SelesaiView";

export default function KegiatanSaya({ auth, kegiatans, queryParams = {}, success }) {
    queryParams = queryParams || {};
    const [activeTab, setActiveTab] = useState(queryParams.tahapan || 'semua');
    const [modalState, setModalState] = useState({ type: null, kegiatan: null });

    // ... (Semua logika useEffect, useForm, handleTabClick, modal, dan form submit tetap sama)
    useEffect(() => {
        if (success) {
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: success, timer: 3000, showConfirmButton: false, });
            const newParams = { ...queryParams };
            router.get(route('pegawai.kegiatan.myIndex', newParams), {}, { preserveState: true, replace: true });
        }
    }, [success]);
    const { post: postConfirm, processing: processingConfirm } = useForm();
    const { data: docsData, setData: setDocsData, post: postDocs, processing: processingDocs, errors: docsErrors, reset: resetDocs } = useForm({
        nama_dokumentasi: '', catatan_observasi: '', foto_path: null,
    });
    const { data: penyerahanData, setData: setPenyerahanData, post: postPenyerahan, processing: processingPenyerahan, errors: penyerahanErrors, reset: resetPenyerahan } = useForm({
        nama_dokumentasi: '', foto_path: null,
    });
    const { data: penyelesaianData, setData: setPenyelesaianData, post: postPenyelesaian, processing: processingPenyelesaian, errors: penyelesaianErrors, reset: resetPenyelesaian } = useForm({
        file_berita_acara: null, status_akhir: 'Selesai',
    });
    const handleTabClick = (tahapan) => {
        setActiveTab(tahapan);
        const newParams = { ...queryParams };
        if (tahapan === 'semua') {
            delete newParams.tahapan;
        } else {
            newParams.tahapan = tahapan;
        }
        router.get(route("pegawai.kegiatan.myIndex"), newParams, { preserveState: true, replace: true });
    };
    const getButtonTabClass = (tahapan) => `px-5 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 ${activeTab === tahapan ? 'text-white bg-blue-700 hover:bg-blue-800' : 'text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700'}`;
    const openModal = (type, kegiatan) => setModalState({ type, kegiatan });
    const closeModal = () => {
        setModalState({ type: null, kegiatan: null });
        resetDocs(); resetPenyerahan(); resetPenyelesaian();
    };
    const handleConfirm = (e) => {
        e.preventDefault();
        postConfirm(route('pegawai.kegiatan.confirmKehadiran', modalState.kegiatan.id), { onSuccess: closeModal });
    };
    const handleDocsSubmit = (e) => {
        e.preventDefault();
        postDocs(route('pegawai.kegiatan.storeObservasi', modalState.kegiatan.id), { onSuccess: closeModal });
    };
    const handlePenyerahanSubmit = (e) => {
        e.preventDefault();
        postPenyerahan(route('pegawai.kegiatan.storePenyerahan', modalState.kegiatan.id), { onSuccess: closeModal });
    };
    const handlePenyelesaianSubmit = (e) => {
        e.preventDefault();
        postPenyelesaian(route('pegawai.kegiatan.selesaikan', modalState.kegiatan.id), { onSuccess: closeModal });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Daftar Kegiatan Saya</h2>}>
            <Head title="Daftar Kegiatan Saya" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex flex-wrap gap-2">
                                {/* Tombol-tombol tab tidak berubah */}
                                <button onClick={() => handleTabClick('semua')} className={getButtonTabClass('semua')}>Semua Tugas Aktif</button>
                                <button onClick={() => handleTabClick('perjalanan_dinas')} className={getButtonTabClass('perjalanan_dinas')}>Perjalanan Dinas</button>
                                <button onClick={() => handleTabClick('dokumentasi_observasi')} className={getButtonTabClass('dokumentasi_observasi')}>Dokumentasi Observasi</button>
                                <button onClick={() => handleTabClick('menunggu_proses_kabid')} className={getButtonTabClass('menunggu_proses_kabid')}>Menunggu Proses Kabid</button>
                                <button onClick={() => handleTabClick('dokumentasi_penyerahan')} className={getButtonTabClass('dokumentasi_penyerahan')}>Dokumentasi Penyerahan</button>
                                <button onClick={() => handleTabClick('penyelesaian')} className={getButtonTabClass('penyelesaian')}>Penyelesaian</button>
                                <button onClick={() => handleTabClick('selesai')} className={getButtonTabClass('selesai')}>Selesai</button>
                            </div>
                            <div className="overflow-auto">
                                {/* --- PERUBAHAN UTAMA: MENAMPILKAN VIEW SECARA KONDISIONAL --- */}
                                {(activeTab === 'semua' || activeTab === 'perjalanan_dinas') &&
                                    <PerjalananDinasView kegiatans={kegiatans} openModal={openModal} />
                                }
                                {activeTab === 'dokumentasi_observasi' &&
                                    <DokumentasiObservasiView kegiatans={kegiatans} openModal={openModal} />
                                }
                                {activeTab === 'menunggu_proses_kabid' &&
                                    <MenungguProsesKabidView kegiatans={kegiatans} />
                                }
                                {activeTab === 'dokumentasi_penyerahan' &&
                                    <DokumentasiPenyerahanView kegiatans={kegiatans} openModal={openModal} />
                                }
                                {activeTab === 'penyelesaian' &&
                                    <PenyelesaianView kegiatans={kegiatans} openModal={openModal} />
                                }
                                {activeTab === 'selesai' &&
                                    <SelesaiView kegiatans={kegiatans} />
                                }
                            </div>
                            <Pagination links={kegiatans.links} className="mt-6"/>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* --- MODALS (Tidak ada perubahan di sini) --- */}
            <Modal show={modalState.type === 'confirm'} onClose={closeModal}>
                <form onSubmit={handleConfirm} className="p-6"><h2 className="text-lg font-medium text-gray-900">Konfirmasi Kehadiran</h2><p className="mt-1 text-sm text-gray-600">Apakah Anda yakin akan melaksanakan kegiatan "{modalState.kegiatan?.nama_kegiatan}"?</p><div className="mt-6 flex justify-end"><SecondaryButton onClick={closeModal}>Batal</SecondaryButton><PrimaryButton className="ms-3" disabled={processingConfirm}>Ya, Konfirmasi</PrimaryButton></div></form>
            </Modal>
            <Modal show={modalState.type === 'docs'} onClose={closeModal}>
                <form onSubmit={handleDocsSubmit} className="p-6" encType="multipart/form-data"><h2 className="text-lg font-medium text-gray-900">Dokumentasi Observasi</h2><div className="mt-6"><InputLabel htmlFor="nama_dokumentasi" value="Judul Dokumentasi" /><TextInput id="nama_dokumentasi" className="mt-1 block w-full" value={docsData.nama_dokumentasi} onChange={(e) => setDocsData('nama_dokumentasi', e.target.value)} required /><InputError message={docsErrors.nama_dokumentasi} className="mt-2" /></div><div className="mt-4"><InputLabel htmlFor="catatan_observasi" value="Catatan Observasi" /><TextAreaInput id="catatan_observasi" className="mt-1 block w-full" value={docsData.catatan_observasi} onChange={(e) => setDocsData('catatan_observasi', e.target.value)} /><InputError message={docsErrors.catatan_observasi} className="mt-2" /></div><div className="mt-4"><InputLabel htmlFor="foto_path" value="Unggah Foto Bukti" /><TextInput id="foto_path" type="file" className="mt-1 block w-full" onChange={(e) => setDocsData('foto_path', e.target.files[0])} /><InputError message={docsErrors.foto_path} className="mt-2" /></div><div className="mt-6 flex justify-end"><SecondaryButton onClick={closeModal}>Batal</SecondaryButton><PrimaryButton className="ms-3" disabled={processingDocs}>Simpan</PrimaryButton></div></form>
            </Modal>
            <Modal show={modalState.type === 'penyerahan'} onClose={closeModal}>
                <form onSubmit={handlePenyerahanSubmit} className="p-6" encType="multipart/form-data"><h2 className="text-lg font-medium text-gray-900">Dokumentasi Penyerahan</h2><div className="mt-6"><InputLabel htmlFor="nama_dokumentasi_penyerahan" value="Judul Dokumentasi" /><TextInput id="nama_dokumentasi_penyerahan" className="mt-1 block w-full" value={penyerahanData.nama_dokumentasi} onChange={(e) => setPenyerahanData('nama_dokumentasi', e.target.value)} required /><InputError message={penyerahanErrors.nama_dokumentasi} className="mt-2" /></div><div className="mt-4"><InputLabel htmlFor="foto_path_penyerahan" value="Unggah Foto Bukti" /><TextInput id="foto_path_penyerahan" type="file" className="mt-1 block w-full" onChange={(e) => setPenyerahanData('foto_path', e.target.files[0])} /><InputError message={penyerahanErrors.foto_path} className="mt-2" /></div><div className="mt-6 flex justify-end"><SecondaryButton onClick={closeModal}>Batal</SecondaryButton><PrimaryButton className="ms-3" disabled={processingPenyerahan}>Simpan</PrimaryButton></div></form>
            </Modal>
            <Modal show={modalState.type === 'penyelesaian'} onClose={closeModal}>
                <form onSubmit={handlePenyelesaianSubmit} className="p-6" encType="multipart/form-data"><h2 className="text-lg font-medium text-gray-900">Penyelesaian Kegiatan</h2><div className="mt-6"><InputLabel htmlFor="file_berita_acara" value="Unggah Berita Acara" /><TextInput id="file_berita_acara" type="file" className="mt-1 block w-full" onChange={(e) => setPenyelesaianData('file_berita_acara', e.target.files[0])} required /><InputError message={penyelesaianErrors.file_berita_acara} className="mt-2" /></div><div className="mt-4"><InputLabel htmlFor="status_akhir" value="Status Akhir" /><SelectInput id="status_akhir" className="mt-1 block w-full" value={penyelesaianData.status_akhir} onChange={(e) => setPenyelesaianData('status_akhir', e.target.value)}><option>Selesai</option><option>Ditunda</option><option>Dibatalkan</option></SelectInput><InputError message={penyelesaianErrors.status_akhir} className="mt-2" /></div><div className="mt-6 flex justify-end"><SecondaryButton onClick={closeModal}>Batal</SecondaryButton><PrimaryButton className="ms-3" disabled={processingPenyelesaian}>Selesaikan Kegiatan</PrimaryButton></div></form>
            </Modal>
        </AuthenticatedLayout>
    );
}
