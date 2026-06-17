import React, { useState, useEffect } from 'react';

export default function GestaoDoadores() {
  const [doadores, setDoadores] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Estados do Formulário
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const carregarDoadores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/doadores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setDoadores(await response.json());
      } else {
        setErro('Falha ao carregar os doadores.');
      }
    } catch (err) {
      console.error("Erro na API:", err);
      setErro('Erro de ligação ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDoadores();
  }, []);

  const handleCriarDoador = async (e) => {
    e.preventDefault();
    try {
      // Como vimos no seu SecurityConfig, o POST de doadores é público, 
      // mas vamos enviar o cabeçalho padrão por boa prática
      const response = await fetch('http://localhost:8080/api/doadores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          nome: nome, 
          cpf: cpf, 
          email: email,
          senha: senha 
        })
      });

      if (response.ok) {
        alert('Doador cadastrado com sucesso!');
        setNome('');
        setCpf('');
        setEmail('');
        setSenha('');
        setMostrarModal(false);
        carregarDoadores(); 
      } else {
        alert('Erro ao cadastrar. Verifique se o CPF ou E-mail já existem.');
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert('Erro de comunicação com o servidor.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#6b21a8' }}>Gestão de Doadores</h2>
        <button 
          onClick={() => setMostrarModal(true)}
          style={{ padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Novo Doador
        </button>
      </div>

      {erro && <p style={{ color: 'red', marginBottom: '15px' }}>{erro}</p>}
      
      {carregando ? (
        <p style={{ color: '#6b7280' }}>A carregar dados do servidor...</p>
      ) : doadores.length === 0 ? (
        <div style={{ padding: '30px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', textAlign: 'center', borderRadius: '8px' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Nenhum doador registado até ao momento.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Nome</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>CPF</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>E-mail</th>
              </tr>
            </thead>
            <tbody>
              {doadores.map((doador) => (
                <tr key={doador.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px', color: '#0f172a', fontWeight: '500' }}>{doador.nome}</td>
                  <td style={{ padding: '15px', color: '#475569' }}>{doador.cpf}</td>
                  <td style={{ padding: '15px', color: '#475569' }}>{doador.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO */}
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '20px', color: '#1a103c' }}>Cadastrar Novo Doador</h3>
            
            <form onSubmit={handleCriarDoador} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Nome Completo</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>CPF</label>
                <input 
                  type="text" 
                  value={cpf} 
                  onChange={(e) => setCpf(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>E-mail</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Senha de Acesso</label>
                <input 
                  type="password" 
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)} 
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