import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: email, 
          senha: senha 
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Guarda o passaporte (token)
        localStorage.setItem('token', data.token);
        
        // Redireciona direto para o Dashboard!
        navigate('/dashboard');
      } else {
        alert("Credenciais inválidas. Verifique o seu e-mail e senha.");
      }
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Erro na comunicação. Verifique o console do navegador.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1a103c' }}>Entrar no Help Sync</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>E-mail ou CPF/CNPJ</label>
            <input 
              type="text" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          
          <div>
            <label>Senha</label>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          
          <button type="submit" style={{ padding: '10px', backgroundColor: '#6b21a8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Acessar
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: '#6b21a8', textDecoration: 'none' }}>Voltar para a página inicial</Link>
        </div>
      </div>
    </div>
  );
}