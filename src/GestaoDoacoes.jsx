import React, { useState, useEffect } from 'react';

export default function GestaoDoacoes() {
  const [doacoes, setDoacoes] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [doadores, setDoadores] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [valor, setValor] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('PIX');
  const [anonima, setAnonima] = useState(false);
  const [doadorSelecionado, setDoadorSelecionado] = useState('');
  const [campanhaSelecionada, setCampanhaSelecionada] = useState('');

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resDoacoes, resCampanhas, resDoadores] = await Promise.all([
        fetch('http://localhost:8080/api/doacoes', { headers }),
        fetch('http://localhost:8080/api/campanhas', { headers }),
        fetch('http://localhost:8080/api/doadores', { headers })
      ]);

      if (resDoacoes.ok) setDoacoes(await resDoacoes.json());
      
      if (resCampanhas.ok) {
        const dadosCampanhas = await resCampanhas.json();
        
        // A MÁGICA ACONTECE AQUI: 
        // Filtra para exibir apenas campanhas cuja dataFim seja maior ou igual a hoje
        const hoje = new Date();
        const campanhasAtivas = dadosCampanhas.filter(camp => new Date(camp.dataFim) >= hoje);
        
        setCampanhas(campanhasAtivas);
        
        // Seleciona a primeira campanha ativa por padrão (se houver alguma)
        if (campanhasAtivas.length > 0) setCampanhaSelecionada(campanhasAtivas[0].id);
      }

      if (resDoadores.ok) {
        const dadosDoadores = await resDoadores.json();
        setDoadores(dadosDoadores);
        if (dadosDoadores.length > 0) setDoadorSelecionado(dadosDoadores[0].id);
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

  const handleCriarDoacao = async (e) => {
    e.preventDefault();
    if (!doadorSelecionado) {
      alert("Atenção: É necessário ter pelo menos um Doador registado."); return;
    }
    if (!campanhaSelecionada) {
      alert("Atenção: Não há campanhas ativas disponíveis para doação no momento."); return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/doacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          valor: parseFloat(valor), 
          metodoPagamento: metodoPagamento, 
          anonima: anonima,
          doadorId: doadorSelecionado,
          campanhaId: campanhaSelecionada 
        })
      });

      if (response.ok) {
        alert('Doação registada com sucesso!');
        setValor('');
        setMetodoPagamento('PIX');
        setAnonima(false);
        setMostrarModal(false);
        carregarDados(); 
      } else {
        alert('Erro ao registar a doação. Verifique se o valor é válido.');
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert('Erro de comunicação com o servidor.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#6b21a8' }}>Histórico de Doações</h2>
        <button onClick={() => setMostrarModal(true)} style={{ padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Registar Doação
        </button>
      </div>

      {erro && <p style={{ color: 'red', marginBottom: '15px' }}>{erro}</p>}
      
      {carregando ? (
        <p style={{ color: '#6b7280' }}>A carregar dados do servidor...</p>
      ) : doacoes.length === 0 ? (
        <div style={{ padding: '30px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', textAlign: 'center', borderRadius: '8px' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Nenhuma doação registada até ao momento.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>ID Doação</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Valor</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Método</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {doacoes.map((doacao) => (
                <tr key={doacao.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px', color: '#64748b', fontSize: '0.9rem' }}>{doacao.id.substring(0, 8)}...</td>
                  <td style={{ padding: '15px', color: '#10b981', fontWeight: 'bold' }}>R$ {doacao.valor ? doacao.valor.toFixed(2) : '0.00'}</td>
                  <td style={{ padding: '15px', color: '#475569' }}>{doacao.metodoPagamento}</td>
                  <td style={{ padding: '15px', color: '#475569' }}>{doacao.anonima ? 'Anónima 🕵️' : 'Pública 👤'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '20px', color: '#1a103c' }}>Registar Nova Doação</h3>
            
            <form onSubmit={handleCriarDoacao} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Doador</label>
                <select value={doadorSelecionado} onChange={(e) => setDoadorSelecionado(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                  <option value="" disabled>Selecione um Doador</option>
                  {doadores.map(doador => (<option key={doador.id} value={doador.id}>{doador.nome || doador.email}</option>))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Campanha de Destino</label>
                <select value={campanhaSelecionada} onChange={(e) => setCampanhaSelecionada(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                  {campanhas.length === 0 ? (
                    <option value="" disabled>Nenhuma campanha ativa no momento</option>
                  ) : (
                    <option value="" disabled>Selecione a Campanha</option>
                  )}
                  {campanhas.map(camp => (<option key={camp.id} value={camp.id}>{camp.titulo}</option>))}
                </select>
              </div>

              <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Valor da Doação (R$)</label><input type="number" step="0.01" min="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} /></div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Método de Pagamento</label>
                <select value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="BOLETO">Boleto Bancário</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                <input type="checkbox" id="anonima" checked={anonima} onChange={(e) => setAnonima(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="anonima" style={{ fontWeight: '500', color: '#334155', cursor: 'pointer' }}>Doação Anónima</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#6b21a8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}