import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import PekerjaanForm from './components/PekerjaanForm';
import PekerjaanList from './components/PekerjaanList';
import './App.css';
import Admin from './components/Admin';

const App = () => {
  return (
    <Router>
      <Container fluid className="app-container">
        <Container fluid className="logo-container mb-4">
          <Link to="/">
            <img
              src={`${process.env.PUBLIC_URL}/logojakartas.png`}
              alt="Logo Jakarta"
              className="logo-left"

            />
          </Link>

          <Link to="/">
            <img
              src={`${process.env.PUBLIC_URL}/logosippo.png`}
              alt="Logo Jakarta"
              className="logo-right"
            />
          </Link>
        </Container>

        <Container fluid>
          <Routes>
            <Route path="/" element={<PekerjaanList />} />
            <Route path="/add" element={<PekerjaanForm />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/edit/:id" element={<PekerjaanForm />} />
          </Routes>
        </Container>
      </Container>
    </Router>
  );
};

export default App;
