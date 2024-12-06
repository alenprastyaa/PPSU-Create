import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Modal, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './PekerjaanList.css';

const Admin = () => {
    const [pekerjaanList, setPekerjaanList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(true); // State untuk loading saat memuat data
    const [isDownloading, setIsDownloading] = useState(false); // State untuk loading saat download PDF


    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            axios.delete(`https://apii.sipooppsu.my.id/kerja/${id}`)
                .then(() => {
                    alert('Data berhasil dihapus!');
                    fetchData();
                })
                .catch(error => console.error(error));
        }
    };

    const fetchData = () => {
        setIsLoading(true); // Tampilkan loading
        axios
            .get('https://apii.sipooppsu.my.id/kerja')
            .then((response) => {
                const sortedData = response.data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                setPekerjaanList(sortedData);
                setIsLoading(false); // Matikan loading setelah selesai
            })
            .catch((error) => {
                console.error(error);
                setIsLoading(false); // Matikan loading jika terjadi kesalahan
            });
    };

    const handleImageClick = (imageUrl) => {
        setModalImage(imageUrl);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalImage('');
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true); // Tampilkan loading
        try {
            const filteredData = pekerjaanList.filter((item) => {
                const itemDate = new Date(item.tanggal);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                return (!start || itemDate >= start) && (!end || itemDate <= end);
            });

            if (filteredData.length === 0) {
                alert('Tidak ada data untuk rentang waktu yang dipilih.');
                return;
            }

            const doc = new jsPDF('portrait'); // Orientasi portrait
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);

            // Tambahkan Judul
            const title = "LAPORAN HARIAN PELAKSANAAN PENANGANAN PRASARA DAN SARANA UMUM TINGKAT KELURAHAN";
            const title2 = "Kelurahan Kampung Bali"
            // Fungsi untuk memformat tanggal ke format "28 November 2024"
            const formatDate = (dateString) => {
                if (!dateString) return 'Semua Tanggal';
                const date = new Date(dateString);
                return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            };

            const dateRange = `Rentang Waktu: ${formatDate(startDate)} - ${formatDate(endDate)}`;

            // Fungsi Helper untuk Menambahkan Judul pada Setiap Halaman
            const addTitleToPage = (startY) => {
                const pageWidth = doc.internal.pageSize.getWidth();

                // Tambahkan margin antar judul
                doc.setFontSize(10);
                doc.text(title, pageWidth / 2, startY, { align: 'center' }); // Judul utama
                doc.text(title2, pageWidth / 2, startY + 6, { align: 'center' }); // Judul kedua, berjarak 6pt
                doc.setFontSize(8);
                doc.text(dateRange, pageWidth / 2, startY + 12, { align: 'center' }); // Rentang waktu, berjarak 12pt
            };

            const header = [
                '#',
                'Nama Petugas',
                'Nama Team',
                'Tanggal',
                'Sumber Informasi',
                'Kondisi Lapangan\n(Gambar)',
                'Keterangan Kondisi',
                'Lokasi Pekerjaan',
                'Progres Pekerjaan\n(Gambar)',
                'Keterangan Pekerjaan',
            ];

            // Fungsi Helper untuk Membuat Halaman Baru
            const addTableToPage = (data, startY, isFirstPage) => {
                if (isFirstPage) {
                    addTitleToPage(startY); // Tambahkan judul di atas tabel pada halaman pertama
                }
                doc.autoTable({
                    head: [header],
                    body: data,
                    startY: startY + 15, // Tambahkan ruang setelah judul
                    theme: 'grid',
                    margin: { left: 2, top: 2, right: 2 },
                    headStyles: { fillColor: [0, 123, 255], textColor: 255, fontSize: 8, halign: 'center' },
                    bodyStyles: { valign: 'middle', halign: 'center', fontSize: 10 },
                    columnStyles: {
                        3: { cellWidth: 18 },
                        4: { cellWidth: 25 },
                        5: { cellWidth: 30 },
                        8: { cellWidth: 30 },
                    },
                    didDrawCell: (data) => {
                        if (data.cell.raw?.image) {
                            doc.addImage(data.cell.raw.image, 'JPEG', data.cell.x + 2, data.cell.y + 2, 27, 18);
                        }
                    },
                });
            };

            let body = [];
            let isFirstPage = true; // Flag untuk menentukan halaman pertama

            for (let i = 0; i < filteredData.length; i++) {
                const item = filteredData[i];
                const row = [
                    i + 1,
                    item.nama_petugas,
                    item.nama_team,
                    new Date(item.tanggal)
                        .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }),
                    item.sumber_informasi,
                    '',
                    item.keterangan_kondisi_lapangan,
                    item.lokasi_pekerjaan,
                    '',
                    item.keterangan_pekerjaan,
                ];

                // Tambahkan gambar (jika ada)
                if (item.kondisi_lapangan_image) {
                    const base64Kondisi = await getBase64Image(`https://apii.sipooppsu.my.id/uploads/${item.kondisi_lapangan_image}`);
                    row[5] = { content: '', image: base64Kondisi };
                }

                if (item.progres_pekerjaan_image) {
                    const base64Progres = await getBase64Image(`https://apii.sipooppsu.my.id/uploads/${item.progres_pekerjaan_image}`);
                    row[8] = { content: '', image: base64Progres };
                }

                body.push(row);

                // Jika sudah 8 baris atau data terakhir, tambahkan halaman baru
                if (body.length === 9 || i === filteredData.length - 1) {
                    addTableToPage(body, i === 0 ? 20 : 15, isFirstPage); // Tentukan apakah ini halaman pertama
                    body = [];
                    if (i !== filteredData.length - 1) {
                        doc.addPage(); // Tambahkan halaman baru kecuali di halaman terakhir
                        isFirstPage = false; // Setelah halaman pertama, ubah flag menjadi false
                    }
                }
            }

            // Simpan file PDF
            doc.save('Laporan_Pekerjaan_PPSU.pdf');
        } catch (error) {
            console.error(error);
        } finally {
            setIsDownloading(false); // Matikan loading setelah selesai
        }
    };


    // Helper function untuk konversi URL gambar ke Base64
    const getBase64Image = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg');
                resolve(dataURL);
            };
            img.onerror = (error) => reject(error);
            img.src = url;
        });
    };
    const pageCount = Math.ceil(pekerjaanList.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = pekerjaanList.slice(offset, offset + itemsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <Container className="mt-5" style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
            <h2 className="mt-5">Daftar Pekerjaan PPSU</h2>
            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p>Sedang memuat data...</p>
                </div>
            ) : (
                <>
                    <Row className="justify-content-md-center">
                        <Col xs={12}>
                            <div className="d-flex justify-content-between mb-3">
                                <Link to="/add">
                                    <Button variant="primary" className="add-btn mt-2">
                                        <i className="fas fa-plus-circle"></i> Tambah Pekerjaan
                                    </Button>
                                </Link>
                                <div>
                                    <Form.Control
                                        type="date"
                                        className="d-inline mx-2"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <Form.Control
                                        type="date"
                                        className="d-inline mx-2 mt-3"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                    <Button className='mt-3' style={{ marginLeft: "10px" }} variant="success" onClick={handleDownloadPDF} disabled={isDownloading}>
                                        {isDownloading ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            'Download PDF'
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <Table striped hover variant="light">
                                    <thead style={{ backgroundColor: '#f1f1f1' }}>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama Petugas</th>
                                            <th>Nama Team</th>
                                            <th>Tanggal</th>
                                            <th>Sumber Informasi</th>
                                            <th>Kondisi Lapangan (Gambar)</th>
                                            <th>Keterangan Kondisi Lapangan</th>
                                            <th>Lokasi Pekerjaan</th>
                                            <th>Progres Pekerjaan (Gambar)</th>
                                            <th>Keterangan Pekerjaan</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((pekerjaan, index) => (
                                            <tr key={pekerjaan.id}>
                                                <td style={{ textAlign: 'center' }}>
                                                    {index + 1 + (currentPage * itemsPerPage)}
                                                </td>
                                                <td>{pekerjaan.nama_petugas}</td>
                                                <td>{pekerjaan.nama_team}</td>
                                                <td>{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(pekerjaan.tanggal))}</td>
                                                <td>{pekerjaan.sumber_informasi}</td>
                                                <td>
                                                    <img
                                                        src={`https://apii.sipooppsu.my.id/uploads/${pekerjaan.kondisi_lapangan_image}`}
                                                        alt="Kondisi Lapangan"
                                                        className="img-fluid clickable"
                                                        style={{ maxWidth: '100px', cursor: 'pointer', borderRadius: '4px' }}
                                                        onClick={() => handleImageClick(`https://apii.sipooppsu.my.id/uploads/${pekerjaan.kondisi_lapangan_image}`)}
                                                    />
                                                </td>
                                                <td>{pekerjaan.keterangan_kondisi_lapangan}</td>
                                                <td>{pekerjaan.lokasi_pekerjaan}</td>
                                                <td>
                                                    <img
                                                        src={`https://apii.sipooppsu.my.id/uploads/${pekerjaan.progres_pekerjaan_image}`}
                                                        alt="Progres Pekerjaan"
                                                        className="img-fluid clickable"
                                                        style={{ maxWidth: '100px', cursor: 'pointer', borderRadius: '4px' }}
                                                        onClick={() => handleImageClick(`https://apii.sipooppsu.my.id/uploads/${pekerjaan.progres_pekerjaan_image}`)}
                                                    />
                                                </td>
                                                <td>{pekerjaan.keterangan_pekerjaan}</td>
                                                <td>
                                                    <Button variant="danger" onClick={() => handleDelete(pekerjaan.id)}>
                                                        Hapus
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <ReactPaginate
                                previousLabel={'<'}
                                nextLabel={'>'}
                                breakLabel={'...'}
                                pageCount={pageCount}
                                onPageChange={handlePageClick}
                                containerClassName={'pagination'}
                                activeClassName={'active'}
                            />
                        </Col>
                    </Row>

                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Body>
                            <img src={modalImage} alt="Modal Preview" className="img-fluid" />
                        </Modal.Body>
                    </Modal>
                </>
            )}
        </Container>
    );
};

export default Admin;
