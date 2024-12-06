import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate'; // Pagination library
import './PekerjaanList.css'

const PekerjaanList = () => {
    const [pekerjaanList, setPekerjaanList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10); // Items per page
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState('');

    useEffect(() => {
        axios.get('https://apii.sipooppsu.my.id/kerja')
            .then(response => {
                const sortedData = response.data.sort((a, b) => b.id - a.id);
                setPekerjaanList(sortedData);
            })
            .catch(error => console.error(error));
    }, []);

    const handleImageClick = (imageUrl) => {
        setModalImage(imageUrl);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalImage('');
    };

    const pageCount = Math.ceil(pekerjaanList.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = pekerjaanList.slice(offset, offset + itemsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <Container className="mt-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '20px', borderRadius: '12px' }}>
            <h2 className="mt-5"></h2>
            <div style={{ textAlign: "center" }}>
                <Link to="/admin">
                    <button
                        style={{ fontSize: "35px" }}
                        type="button"
                        className="btn btn-light"
                    >
                        Daftar Pekerjaan PPSU
                    </button>
                </Link>
            </div>
            <Row className="justify-content-md-center">
                <Col xs={12}>
                    <div className="d-flex justify-content-end mb-3">
                        <Link to="/add">
                            <Button variant="primary" className="add-btn mt-2">
                                <i className="fas fa-plus-circle"></i> Tambah Pekerjaan
                            </Button>
                        </Link>
                    </div>

                    <div className="table-responsive table-background">
                        <Table striped hover >
                            <thead>
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
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((pekerjaan, index) => (
                                    <tr key={pekerjaan.id}>
                                        <td style={{ textAlign: "center" }}>{index + 1 + (currentPage * itemsPerPage)}</td>
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
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>


                    <ReactPaginate
                        previousLabel={"Previous"}
                        nextLabel={"Next"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination"}
                        activeClassName={"active"}
                        style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
                    />
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Image Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <img src={modalImage} alt="Preview" className="img-fluid" />
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default PekerjaanList;
