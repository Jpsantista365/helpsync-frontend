import React, { useState, useEffect } from 'react';

export default function GestaoInstituicoes() {
  const [instituicoes, setInstituicoes] = useState([]);
  const [fundos, setFundos] = useState([]); // Novo estado para guardar os fundos
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Estados do Formulário
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [fundoSelecionado, setFundoSelecionado] = useState(''); // ID do Fundo

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. Busca as Instituições
      const resInst = await fetch('http://localhost:8080/api/instituicoes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resInst.ok) setInstituicoes(await resInst.json());

      // 2. Busca os Fundos Municipais
      const resFundos = await fetch('http://localhost:8080/api/fundos-municipais', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resFundos.ok) {
        const dadosFundos = await resFundos.json();
        setFundos(dadosFundos);
        // Já deixa o primeiro fundo selecionado por padrão no formulário
        if (dadosFundos.length > 0) setFundoSelecionado(dadosFundos[0].id);
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

  const handleCriarInstituicao = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/instituicoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // AGORA SIM: Enviamos o fundoMunicipalId que a API exige!
        body: JSON.stringify({ 
          nome: nome, 
          cnpj: cnpj, 
          endereco: endereco,
          fundoMunicipalId: fundoSelecionado 
        })
      });

      if (response.ok) {
        alert('Instituição cadastrada com sucesso!');
        setNome('');
        setCnpj('');
        setEndereco('');
        setMostrarModal(false);
        carregarDados(); // Atualiza a tabela
      } else {
        alert('Erro ao cadastrar a instituição. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert('Erro de comunicação com o servidor.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#6b21a8' }}>Gestão de Instituições</h2>
        <button 
          onClick={() => setMostrarModal(true)}
          style={{ padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Nova Instituição
        </button>
      </div>

      {erro && <p style={{ color: 'red', marginBottom: '15px' }}>{erro}</p>}
      
      {carregando ? (
        <p style={{ color: '#6b7280' }}>A carregar dados do servidor...</p>
      ) : instituicoes.length === 0 ? (
        <div style={{ padding: '30px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', textAlign: 'center', borderRadius: '8px' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Nenhuma instituição cadastrada até ao momento.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Nome da Instituição</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>CNPJ</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Endereço</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {instituicoes.map((inst) => (
                <tr key={inst.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px', color: '#0f172a', fontWeight: '500' }}>{inst.nome}</td>
                  <td style={{ padding: '15px', color: '#475569' }}>{inst.cnpj}</td>
                  <td style={{ padding: '15px', color: '#475569' }}>{inst.endereco}</td>
                  <td style={{ padding: '15px' }}>
                    <button style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE CADASTRO ATUALIZADO */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '20px', color: '#1a103c' }}>Cadastrar Nova Instituição</h3>
            
            <form onSubmit={handleCriarInstituicao} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* NOVO CAMPO: Seleção do Fundo Municipal */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Fundo Municipal</label>
                <select 
                  value={fundoSelecionado} 
                  onChange={(e) => setFundoSelecionado(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                >
                  <option value="" disabled>Selecione um Fundo</option>
                  {fundos.map(fundo => (
                    <option key={fundo.id} value={fundo.id}>{fundo.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Nome da Instituição</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>CNPJ (14 números)</label>
                <input 
                  type="text" 
                  value={cnpj} 
                  onChange={(e) => setCnpj(e.target.value)} 
                  required 
                  maxLength="14"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Endereço Completo</label>
                <input 
                  type="text" 
                  value={endereco} 
                  onChange={(e) => setEndereco(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setMostrarModal(false)} 
                  style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '10px 15px', backgroundColor: '#6b21a8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}