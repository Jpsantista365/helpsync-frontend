import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GestaoInstituicoes from './GestaoInstituicoes';

export default function Dashboard() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('inicio');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Função que decide o que mostrar no ecrã dependendo do menu clicado
  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'inicio':
        return (
          <div>
            <h2 style={{ color: '#6b21a8', marginBottom: '15px' }}>Resumo Geral</h2>
            <p style={{ color: '#4b5563' }}>Bem-vindo ao painel de controlo do Help Sync.</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
              <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #6b21a8' }}>
                <h3>Doações Recebidas</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a103c' }}>R$ 0,00</p>
              </div>
              <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #6b21a8' }}>
                <h3>Campanhas Ativas</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a103c' }}>0</p>
              </div>
            </div>
          </div>
        );
      case 'instituicoes':
        return <GestaoInstituicoes />;
      case 'campanhas':
        return (
          <div>
            <h2 style={{ color: '#6b21a8', marginBottom: '15px' }}>Gestão de Campanhas</h2>
            <p>Aqui vamos gerir as campanhas de arrecadação.</p>
          </div>
        );
      default:
        return <p>Página não encontrada.</p>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>
      
      {/* MENU LATERAL (SIDEBAR) */}
      <aside style={{ width: '250px', backgroundColor: '#1a103c', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          HELP SYNC
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button 
            onClick={() => setAbaAtiva('inicio')}
            style={{ padding: '15px 20px', backgroundColor: abaAtiva === 'inicio' ? '#6b21a8' : 'transparent', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}
          >
            📊 Início
          </button>
          <button 
            onClick={() => setAbaAtiva('instituicoes')}
            style={{ padding: '15px 20px', backgroundColor: abaAtiva === 'instituicoes' ? '#6b21a8' : 'transparent', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}
          >
            🏢 Instituições
          </button>
          <button 
            onClick={() => setAbaAtiva('campanhas')}
            style={{ padding: '15px 20px', backgroundColor: abaAtiva === 'campanhas' ? '#6b21a8' : 'transparent', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}
          >
            📢 Campanhas
          </button>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '10px', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '40px' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minHeight: '80vh' }}>
          {renderizarConteudo()}
        </div>
      </main>

    </div>
  );
}