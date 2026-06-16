import React from 'react';
import './LandingPage.css';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-container">
      
      {/* 1. Cabeçalho */}
      <header className="navbar" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: '#1a103c', color: 'white' }}>
        <div className="logo" style={{ fontWeight: 'bold' }}>HELP SYNC</div>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <a href="#campanhas" style={{ color: 'white', textDecoration: 'none' }}>Campanhas</a>
          <a href="#criar" style={{ color: 'white', textDecoration: 'none' }}>Crie sua campanha</a>
          <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Entrar</Link>
        </nav>
      </header>

      {/* 2. Hero Section (Banner principal) */}
      <section className="hero" style={{ height: '300px', backgroundColor: '#1a103c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        {/* Aqui você vai inserir a imagem/vetor dos hexágonos depois */}
        <h1 style={{ fontSize: '3rem' }}>HELP SYNC</h1>
      </section>

      {/* 3. Seção de Destaques */}
      <section className="destaques" style={{ padding: '40px 20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Movimentos em destaques</h2>
        <div className="cards-container" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          {/* Cards que depois serão preenchidos pela API */}
          <div className="card" style={{ width: '300px', height: '400px', backgroundColor: '#000' }}></div>
          <div className="card" style={{ width: '300px', height: '400px', backgroundColor: '#000' }}></div>
          <div className="card" style={{ width: '300px', height: '400px', backgroundColor: '#000' }}></div>
        </div>
      </section>

      {/* 4. Rodapé */}
      <footer style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', marginTop: '40px' }}>
        <div className="logo-footer" style={{ color: '#6b21a8', fontWeight: 'bold' }}>HELP SYNC</div>
        <div className="links-uteis">
          {/* Links de navegação do rodapé */}
        </div>
        <div className="contato">
          <p>Contato@HelpSync.com</p>
        </div>
      </footer>

    </div>
  );
}