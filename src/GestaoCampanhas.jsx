import React, { useState, useEffect } from 'react';

export default function GestaoCampanhas() {
  const [campanhas, setCampanhas] = useState([]);
  const [instituicoes, setInstituicoes] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Estados do Formulário e Edição
  const [mostrarModal, setMostrarModal] = useState(false);
  const [campanhaEditando, setCampanhaEditando] = useState(null); // Guarda o ID se for edição
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [metaFinanceira, setMetaFinanceira] = useState(''); 
  const [dataInicio, setDataInicio] = useState(''); 
  const [dataFim, setDataFim] = useState(''); 
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState('');

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const resCampanhas = await fetch('http://localhost:8080/api/campanhas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resCampanhas.ok) setCampanhas(await resCampanhas.json());

      const resInst = await fetch('http://localhost:8080/api/instituicoes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resInst.ok) {
        const dadosInst = await resInst.json();
        setInstituicoes(dadosInst);
        if (dadosInst.length > 0) setInstituicaoSelecionada(dadosInst[0].id);
      }
    } catch (err) {
      console.error("Erro na API:", err);
      setErro('Erro de ligação ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // FUNÇÃO 1: Abrir modal limpo
  const abrirModalNova = () => {
    setCampanhaEditando(null);
    setTitulo('');
    setDescricao('');
    setMetaFinanceira('');
    setDataInicio('');
    setDataFim('');
    if (instituicoes.length > 0) setInstituicaoSelecionada(instituicoes[0].id);
    setMostrarModal(true);
  };

  // FUNÇÃO 2: Abrir modal preenchido para edição
  const abrirModalEdicao = (campanha) => {
    setCampanhaEditando(campanha.id);
    setTitulo(campanha.titulo);
    setDescricao(campanha.descricao);
    setMetaFinanceira(campanha.metaFinanceira);
    
    // O input datetime-local precisa do formato YYYY-MM-DDTHH:mm
    // Cortamos os segundos e milissegundos que possam vir da API (os primeiros 16 caracteres)
    setDataInicio(campanha.dataInicio ? campanha.dataInicio.substring(0, 16) : '');
    setDataFim(campanha.dataFim ? campanha.dataFim.substring(0, 16) : '');
    
    setInstituicaoSelecionada(campanha.instituicaoId || (campanha.instituicao && campanha.instituicao.id));
    setMostrarModal(true);
  };

  // FUNÇÃO 3: Salvar (POST ou PUT)
  const handleSalvarCampanha = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Garante o formato correto para o back-end
      const dataInicioFormatada = dataInicio.length === 16 ? `${dataInicio}:00` : dataInicio;
      const dataFimFormatada = dataFim.length === 16 ? `${dataFim}:00` : dataFim;

      const url = campanhaEditando 
        ? `http://localhost:8080/api/campanhas/${campanhaEditando}` 
        : 'http://localhost:8080/api/campanhas';
        
      const metodo = campanhaEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          titulo: titulo, 
          descricao: descricao, 
          metaFinanceira: parseFloat(metaFinanceira), 
          dataInicio: dataInicioFormatada, 
          dataFim: dataFimFormatada,
          instituicaoId: instituicaoSelecionada 
        })
      });

      if (response.ok) {
        alert(campanhaEditando ? 'Campanha atualizada com sucesso!' : 'Campanha criada com sucesso!');
        setMostrarModal(false);
        carregarDados(); 
      } else {
        alert('Erro ao guardar a campanha. Verifique os dados.');
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert('Erro de comunicação com o servidor.');
    }
  };

  // FUNÇÃO 4: Excluir Campanha
  const handleExcluir = async (id) => {
  const confirmacao = window.confirm("Tem a certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.");
  if (!confirmacao) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8080/api/campanhas/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      alert('Campanha excluída com sucesso!');
      carregarDados();
    } else {
      // Lê a mensagem de texto exata vinda do erro 400 do Spring Boot
      const mensagemErro = await response.text();
      alert(mensagemErro || 'Não foi possível excluir. Verifique as dependências.');
    }
  } catch (err) {
    console.error("Erro ao excluir:", err);
    alert('Erro de comunicação com o servidor.');
  }
};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#6b21a8' }}>Gestão de Campanhas</h2>
        <button 
          onClick={abrirModalNova}
          style={{ padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Nova Campanha
        </button>
      </div>

      {erro && <p style={{ color: 'red', marginBottom: '15px' }}>{erro}</p>}
      
      {carregando ? (
        <p style={{ color: '#6b7280' }}>A carregar dados do servidor...</p>
      ) : campanhas.length === 0 ? (
        <div style={{ padding: '30px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', textAlign: 'center', borderRadius: '8px' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Nenhuma campanha registada até ao momento.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Título da Campanha</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Meta (R$)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Período</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Status</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {campanhas.map((campanha) => {
                const hoje = new Date();
                const dataFim = new Date(campanha.dataFim);
                const isAtiva = dataFim >= hoje;

                return (
                  <tr key={campanha.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '15px', color: '#0f172a', fontWeight: '500' }}>{campanha.titulo}</td>
                    <td style={{ padding: '15px', color: '#10b981', fontWeight: 'bold' }}>
                      R$ {campanha.metaFinanceira ? campanha.metaFinanceira.toFixed(2) : '0.00'}
                    </td>
                    <td style={{ padding: '15px', color: '#475569', fontSize: '0.9rem' }}>
                      {new Date(campanha.dataInicio).toLocaleDateString('pt-BR')} <br/> 
                      <span style={{ color: '#94a3b8' }}>até</span> <br/> 
                      {dataFim.toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ backgroundColor: isAtiva ? '#d1fae5' : '#fee2e2', color: isAtiva ? '#065f46' : '#991b1b', padding: '6px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {isAtiva ? 'Ativa' : 'Encerrada'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => abrirModalEdicao(campanha)}
                        style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => handleExcluir(campanha.id)}
                        style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL INTELIGENTE (CRIAR / EDITAR) */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '20px', color: '#1a103c' }}>
              {campanhaEditando ? 'Editar Campanha' : 'Criar Nova Campanha'}
            </h3>
            <form onSubmit={handleSalvarCampanha} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Instituição Beneficiada</label>
                <select value={instituicaoSelecionada} onChange={(e) => setInstituicaoSelecionada(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                  <option value="" disabled>Selecione uma Instituição</option>
                  {instituicoes.map(inst => (<option key={inst.id} value={inst.id}>{inst.nome}</option>))}
                </select>
              </div>
              <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Título da Campanha</label><input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Descrição</label><textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} required rows="3" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'none' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Meta Financeira (R$)</label><input type="number" step="0.01" value={metaFinanceira} onChange={(e) => setMetaFinanceira(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Data de Início</label><input type="datetime-local" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} /></div>
              <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Data de Fim</label><input type="datetime-local" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#6b21a8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {campanhaEditando ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}