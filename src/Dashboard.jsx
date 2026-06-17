import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GestaoInstituicoes from './GestaoInstituicoes';
import GestaoCampanhas from './GestaoCampanhas';
import GestaoDoadores from './GestaoDoadores';
import GestaoDoacoes from './GestaoDoacoes';
import './Dashboard.css'; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('inicio');
  const [menuMobileAberto, setMenuMobileAberto] = useState(false); // Novo estado para o telemóvel
  
  const [totalCampanhasAtivas, setTotalCampanhasAtivas] = useState(0);
  const [totalArrecadado, setTotalArrecadado] = useState(0);
  const [doacoesPorCampanha, setDoacoesPorCampanha] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const carregarEstatisticas = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [resCampanhas, resDoacoes] = await Promise.all([
          fetch('http://localhost:8080/api/campanhas', { headers }),
          fetch('http://localhost:8080/api/doacoes', { headers })
        ]);

        if (resCampanhas.ok && resDoacoes.ok) {
          const campanhasData = await resCampanhas.json();
          const doacoesData = await resDoacoes.json();

          const hoje = new Date();
          const campanhasAtivas = campanhasData.filter(camp => new Date(camp.dataFim) >= hoje);
          setTotalCampanhasAtivas(campanhasAtivas.length);

          const somaTotal = doacoesData.reduce((acc, d) => acc + d.valor, 0);
          setTotalArrecadado(somaTotal);

          const resumoAgrupado = campanhasData.map(camp => {
            const doacoesDesta = doacoesData.filter(d => d.campanhaId === camp.id || (d.campanha && d.campanha.id === camp.id));
            const somaDestaCampanha = doacoesDesta.reduce((acc, curr) => acc + curr.valor, 0);
            return { titulo: camp.titulo, valor: somaDestaCampanha };
          }).filter(item => item.valor > 0); 

          setDoacoesPorCampanha(resumoAgrupado);
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      }
    };

    if (abaAtiva === 'inicio') carregarEstatisticas();
  }, [navigate, abaAtiva]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Função para mudar a aba e já fechar o menu no telemóvel
  const alterarAba = (aba) => {
    setAbaAtiva(aba);
    setMenuMobileAberto(false); 
  };

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'inicio':
        return (
          <div>
            <h2 style={{ color: '#6b21a8', marginBottom: '15px' }}>Resumo Geral</h2>
            <p style={{ color: '#4b5563' }}>Bem-vindo ao painel de controlo do Help Sync.</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '2 1 300px', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#475569', fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>Arrecadação por Campanha</h3>
                {doacoesPorCampanha.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', marginBottom: '20px' }}>Nenhuma doação recebida até o momento.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                    {doacoesPorCampanha.map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        <span style={{ color: '#334155', fontWeight: '500' }}>{item.titulo}</span>
                        <span style={{ color: '#0f172a', fontWeight: 'bold' }}>R$ {item.valor.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #cbd5e1', paddingTop: '15px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Recebido</span>
                  <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>R$ {totalArrecadado.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ flex: '1 1 200px', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #6b21a8', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#475569', fontSize: '1.1rem', fontWeight: '600' }}>Campanhas Ativas</h3>
                <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1a103c', marginTop: '10px' }}>{totalCampanhasAtivas}</p>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px' }}>A receber doações neste momento.</p>
              </div>
            </div>
          </div>
        );
      case 'instituicoes': return <GestaoInstituicoes />;
      case 'campanhas': return <GestaoCampanhas />;
      case 'doacoes': return <GestaoDoacoes />;
      case 'doadores': return <GestaoDoadores />;
      default: return <p>Página não encontrada.</p>;
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* CABEÇALHO MOBILE (Só aparece em ecrãs pequenos) */}
      <div className="mobile-header">
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>HELP SYNC</h2>
        <button onClick={() => setMenuMobileAberto(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
          ☰
        </button>
      </div>

      {/* OVERLAY ESCURO (Clica fora do menu para fechar no mobile) */}
      {menuMobileAberto && <div className="overlay" onClick={() => setMenuMobileAberto(false)}></div>}

      {/* MENU LATERAL */}
      <aside className={`sidebar ${menuMobileAberto ? 'aberta' : ''}`}>
        <div style={{ padding: '20px', fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          HELP SYNC
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button onClick={() => alterarAba('inicio')} style={{ padding: '15px 20px', backgroundColor: abaAtiva === 'inicio' ? '#6b21a8' : 'transparent', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>📊 Início</button>
          <button onClick={() => alterarAba('instituicoes')} style={{ padding: '15px 20px', backgroundColor: abaAtiva === 'instituicoes' ? '#6b21a8' : 'transparent', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>🏢 Instituições</button>
          <button onClick={() => alterarAba('campanhas')} style={{ padding: '15px 20px', backgroundColor: abaAtiva === 'campanhas' ? '#6b21a8' : 'transparent', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>📢 Campanhas</button>
          <button onClick={() => alterarAba('doacoes')} style={{ padding: '15px 20px', backgroundColor: abaAtiva === 'doacoes' ? '#6b21a8' : 'transparent', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>❤️ Doações</button>
          <button onClick={() => alterarAba('doadores')} style={{ padding: '15px 20px', backgroundColor: abaAtiva === 'doadores' ? '#6b21a8' : 'transparent', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>🫂 Doadores</button>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sair do Sistema</button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        <div className="content-card">
          {renderizarConteudo()}
        </div>
      </main>

    </div>
  );
}