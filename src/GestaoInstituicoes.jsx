import React, { useState, useEffect } from 'react';

export default function GestaoInstituicoes() {
  const [instituicoes, setInstituicoes] = useState([]);
  const [fundos, setFundos] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Estados do Formulário e do Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [instituicaoEditando, setInstituicaoEditando] = useState(null); // Guarda o ID se estivermos a editar
  
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [fundoSelecionado, setFundoSelecionado] = useState('');

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const resInst = await fetch('http://localhost:8080/api/instituicoes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resInst.ok) setInstituicoes(await resInst.json());

      const resFundos = await fetch('http://localhost:8080/api/fundos-municipais', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resFundos.ok) {
        const dadosFundos = await resFundos.json();
        setFundos(dadosFundos);
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

  // FUNÇÃO 1: Abre o modal limpo para CRIAR
  const abrirModalNova = () => {
    setInstituicaoEditando(null); // Garante que não tem ID
    setNome('');
    setCnpj('');
    setEndereco('');
    setMostrarModal(true);
  };

  // FUNÇÃO 2: Abre o modal preenchido para EDITAR
  const abrirModalEdicao = (inst) => {
    setInstituicaoEditando(inst.id); // Guarda o ID da instituição
    setNome(inst.nome);
    setCnpj(inst.cnpj);
    setEndereco(inst.endereco);
    setMostrarModal(true);
  };

  // FUNÇÃO 3: Salva os dados (Serve tanto para Criar quanto para Editar)
  const handleSalvarInstituicao = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Se tiver um ID guardado, a URL recebe o ID e o método vira PUT. Senão, é POST.
      const url = instituicaoEditando 
        ? `http://localhost:8080/api/instituicoes/${instituicaoEditando}`
        : 'http://localhost:8080/api/instituicoes';
        
      const metodo = instituicaoEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          nome: nome, 
          cnpj: cnpj, 
          endereco: endereco,
          fundoMunicipalId: fundoSelecionado 
        })
      });

      if (response.ok) {
        alert(instituicaoEditando ? 'Instituição atualizada com sucesso!' : 'Instituição cadastrada com sucesso!');
        setMostrarModal(false);
        carregarDados(); 
      } else {
        alert('Erro ao salvar a instituição. Verifique os dados.');
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert('Erro de comunicação com o servidor.');
    }
  };

  // FUNÇÃO 4: Exclui a instituição
  const handleExcluir = async (id) => {
    // Exibe uma caixa de confirmação nativa do navegador
    const confirmacao = window.confirm("Tem a certeza que deseja excluir esta instituição? Esta ação não pode ser desfeita.");
    
    if (!confirmacao) return; // Se o utilizador clicar em "Cancelar", a função para aqui.

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/instituicoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Instituição excluída com sucesso!');
        carregarDados(); // Recarrega a tabela
      } else {
        // Se o back-end recusar, geralmente é porque existe uma restrição de chave estrangeira (Foreign Key).
        // Ex: A instituição já tem campanhas vinculadas a ela.
        alert('Não foi possível excluir. Verifique se esta instituição possui campanhas ativas vinculadas a ela.');
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert('Erro de comunicação com o servidor.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#6b21a8' }}>Gestão de Instituições</h2>
        <button 
          onClick={abrirModalNova} // Usa a nova função
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
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {instituicoes.map((inst) => (
                <tr key={inst.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px', color: '#0f172a', fontWeight: '500' }}>{inst.nome}</td>
                  <td style={{ padding: '15px', color: '#475569' }}>{inst.cnpj}</td>
                  <td style={{ padding: '15px', color: '#475569' }}>{inst.endereco}</td>
                  <td style={{ padding: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    
                    {/* BOTÃO DE EDITAR */}
                    <button 
                      onClick={() => abrirModalEdicao(inst)}
                      style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      ✏️ Editar
                    </button>

                    {/* BOTÃO DE EXCLUIR */}
                    <button 
                      onClick={() => handleExcluir(inst.id)}
                      style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      🗑️ Excluir
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL (Agora serve para os dois propósitos) */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            {/* Título dinâmico */}
            <h3 style={{ marginBottom: '20px', color: '#1a103c' }}>
              {instituicaoEditando ? 'Editar Instituição' : 'Cadastrar Nova Instituição'}
            </h3>
            
            <form onSubmit={handleSalvarInstituicao} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
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
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>CNPJ (14 números)</label>
                <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required maxLength="14" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Endereço Completo</label>
                <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#6b21a8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {instituicaoEditando ? 'Atualizar Dados' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}