import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Pekerjaan.css';

const initialState = {
    nama_petugas: '',
    nama_team: '',
    tanggal: '',
    sumber_informasi: '',
    kondisi_lapangan_image: '',
    keterangan_kondisi_lapangan: '',
    lokasi_pekerjaan: '',
    progres_pekerjaan_image: '',
    keterangan_pekerjaan: '',
};

const PekerjaanForm = () => {
    const [pekerjaan, setPekerjaan] = useState(initialState);
    const [loading, setLoading] = useState(false);  // Loading state
    const [isLainnyaSelected, setIsLainnyaSelected] = useState(false); // New state for "Lainnya" option
    const { id } = useParams();
    const navigate = useNavigate();

    // Options for "Nama Petugas"
    const namaOptions = [
        'ABIZAR', 'AHMAD SYAHRUL RAMADHAN', 'AKHMAD ZAINUDIN', 'ALWIN SYAHRIAL',
        'ANAS', 'ANDI SUHANDI', 'ARIFIN ALI', 'ASEP SAEPULLOH', 'ASHARI MUSTAKIM',
        'BUDI SANTOSO', 'CATUR BAYU PRASETYO', 'DENUR ARIPIN', 'DICKAL KIRANDI',
        'FENGKI SUMARNO', 'HADIRIANTO', 'HAFIDIN', 'HARIYANTO', 'HELMI NUR IMAM',
        'HENDY SAPUTRA', 'HIKMA NURFAN CARINI', 'INDIRA', 'IMAM SUTANTO', 'JOHAN SUSANTO',
        'KANAPI', 'M. JUNAEDI', 'M. RIDWAN AS', 'M. YUSUF', 'MADSANI', 'MALIKAL FEBRY PRATAMA',
        'MARIA REGINA H', 'MOHAMAD FIRLI', 'MUHAMAD INDRAWAN', 'MUHAMMAD AFANDI', 'MUHAMMAD INDRA',
        'MUHAMMAD ISA', 'MUHAMMAD RIZKY', 'NURHADY', 'ONI MAERONI', 'ORLANDA AISYAH VIOLLETA',
        'PAISAL FAHMIL', 'QORRI ALVIA', 'RENDI RAMANSYAH', 'RIDWAN SOFANDI', 'ROBIUL ANWAR MAULIDIN',
        'ROSIHAN BAHRI', 'SAHROMI.W', 'SALMAN ALFARISY', 'SAMSUL MUALIM', 'SAROJAYA',
        'SELAMET SUPRIYANTO', 'SEPTIAN', 'SUBKI', 'SUHENDRA', 'SUPRIYANTO', 'SUTRISNO',
        'SUWADI', 'SYARIF BAHTIAR', 'THOMAS IMANUEL SIMBOLON', 'TINTON AKBAR', 'USEP HIDAYAT',
        'WENDI RIYANTO', 'YUNEKO'
    ];

    useEffect(() => {
        if (id) {
            axios.get(`https://apii.sipooppsu.my.id/kerja${id}`)
                .then(response => setPekerjaan(response.data))
                .catch(error => console.error(error));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPekerjaan({ ...pekerjaan, [name]: value });

        // Handle change for "Keterangan Pekerjaan"
        if (name === 'keterangan_pekerjaan') {
            if (value === 'Lainnya') {
                setIsLainnyaSelected(true); // Show text input when "Lainnya" is selected
            } else {
                setIsLainnyaSelected(false); // Hide text input otherwise
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);  // Start loading

        const formData = new FormData();
        formData.append('nama_petugas', pekerjaan.nama_petugas);
        formData.append('nama_team', pekerjaan.nama_team);
        formData.append('tanggal', pekerjaan.tanggal);
        formData.append('sumber_informasi', pekerjaan.sumber_informasi);
        formData.append('keterangan_kondisi_lapangan', pekerjaan.keterangan_kondisi_lapangan);
        formData.append('lokasi_pekerjaan', pekerjaan.lokasi_pekerjaan);

        // Append manual input for "Lainnya" option
        if (isLainnyaSelected) {
            formData.append('keterangan_pekerjaan', pekerjaan.keterangan_pekerjaan_lainnya);
        } else {
            formData.append('keterangan_pekerjaan', pekerjaan.keterangan_pekerjaan);
        }

        if (pekerjaan.kondisi_lapangan_image) {
            formData.append('kondisi_lapangan_image', pekerjaan.kondisi_lapangan_image);
        }
        if (pekerjaan.progres_pekerjaan_image) {
            formData.append('progres_pekerjaan_image', pekerjaan.progres_pekerjaan_image);
        }

        const axiosRequest = id
            ? axios.put(`https://apii.sipooppsu.my.id/kerja${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            : axios.post('https://apii.sipooppsu.my.id/kerja', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

        axiosRequest
            .then(() => {
                navigate('/');
            })
            .catch(error => console.error(error))
            .finally(() => {
                setLoading(false);  // Stop loading
            });
    };
    // const isLainnyaSelected = formData.keterangan_pekerjaan === 'Lainnya';

    return (
        <Container className="container-form">
            <Form onSubmit={handleSubmit}>
                <h2>Laporan Pekerjaan</h2>

                <Form.Group className="form-group">
                    <Form.Label>Nama Petugas</Form.Label>
                    <Form.Select
                        name="nama_petugas"
                        value={pekerjaan.nama_petugas}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Pilih Nama Petugas</option>
                        {namaOptions.map((nama, index) => (
                            <option key={index} value={nama}>
                                {nama}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="form-group">
                    <Form.Label>Nama Team</Form.Label>
                    <Form.Control
                        type="text"
                        name="nama_team"
                        value={pekerjaan.nama_team}
                        onChange={handleChange}
                        placeholder="Masukkan nama team"
                        required
                    />
                </Form.Group>

                <Form.Group className="form-group">
                    <Form.Label>Tanggal</Form.Label>
                    <Form.Control
                        type="date"
                        name="tanggal"
                        value={pekerjaan.tanggal}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="form-group">
                    <Form.Label>Sumber Informasi</Form.Label>
                    <Form.Select
                        name="sumber_informasi"
                        value={pekerjaan.sumber_informasi}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Pilih Sumber Informasi</option>
                        <option value="Hasil survey lapangan oleh kelurahan">Hasil survey lapangan oleh kelurahan</option>
                        <option value="Laporan secara tertulis dan / atau lisan dari masyarakat setempat">Laporan dari masyarakat</option>
                        <option value="Laporan dari hasil aplikasi Qlue">Laporan dari aplikasi Qlue</option>
                        <option value="Hasil koordinasi dengan Perangkat Daerah Setempat">Hasil koordinasi</option>
                        <option value="Disposisi dari pimpinan">Disposisi dari pimpinan</option>
                        <option value="Pekerjaan yang telah menjadi beban kerja masing-masing bidangnya">Pekerjaan yang telah menjadi beban kerja masing-masing bidangnya</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="form-group">
                    <Form.Label>Kondisi Lapangan (Image)</Form.Label>
                    <Form.Control
                        type="file"
                        name="kondisi_lapangan_image"
                        onChange={(e) => setPekerjaan({ ...pekerjaan, kondisi_lapangan_image: e.target.files[0] })}
                    />
                </Form.Group>

                <Form.Group className="form-group">
                    <Form.Label>Keterangan Kondisi Lapangan</Form.Label>
                    <Form.Control
                        type="text"
                        name="keterangan_kondisi_lapangan"
                        value={pekerjaan.keterangan_kondisi_lapangan}
                        onChange={handleChange}
                        placeholder="Masukkan keterangan kondisi lapangan"
                        required
                    />
                </Form.Group>

                <Form.Group className="form-group">
                    <Form.Label>Lokasi Pekerjaan</Form.Label>
                    <Form.Control
                        type="text"
                        name="lokasi_pekerjaan"
                        value={pekerjaan.lokasi_pekerjaan}
                        onChange={handleChange}
                        placeholder="Masukkan lokasi pekerjaan"
                        required
                    />
                </Form.Group>

                <Form.Group className="form-group">
                    <Form.Label>Progres Pekerjaan (Image)</Form.Label>
                    <Form.Control
                        type="file"
                        name="progres_pekerjaan_image"
                        onChange={(e) => setPekerjaan({ ...pekerjaan, progres_pekerjaan_image: e.target.files[0] })}
                    />
                </Form.Group>


                <Form.Group className="form-group">
                    <Form.Label>Keterangan Progres Pekerjaan</Form.Label>
                    <Form.Control
                        as="select"
                        name="keterangan_pekerjaan"
                        value={pekerjaan.keterangan_pekerjaan}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Pilih Keterangan</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Belum Selesai">Belum Selesai</option>
                        <option value="Lainnya">Lainnya</option>
                    </Form.Control>

                    {/* Input manual muncul hanya jika "Lainnya" dipilih */}
                    {pekerjaan.keterangan_pekerjaan === "Lainnya" && (
                        <Form.Control
                            type="text"
                            name="keterangan_pekerjaan_lainnya"
                            value={pekerjaan.keterangan_pekerjaan_lainnya}
                            onChange={handleChange}
                            placeholder="Masukkan keterangan lainnya"
                            className="mt-2"
                            required
                        />
                    )}
                </Form.Group>


                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Loading...' : id ? 'Update' : 'Submit'}
                </Button>
            </Form>
        </Container>
    );
};

export default PekerjaanForm;
