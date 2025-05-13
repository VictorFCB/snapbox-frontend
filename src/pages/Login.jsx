import React, { useState } from 'react';
import { useEffect } from 'react';
import { Layout, Card, Input, Button, message, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content, Footer } = Layout;

const Login = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('email'); // 'email' ou 'code'
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('auth_token');
    if (isAuthenticated) {
      message.info('Você já está autenticado.');
      navigate('/Home');
    }
  }, [navigate]);

  // Função que valida o e-mail e envia o código de verificação
  const handleEmailSubmit = async () => {
    if (!email) {
      message.warning('Por favor, insira seu e-mail.');
      return;
    }

    // Verifica se o e-mail tem o domínio @fcbhealth.com
    if (!email.endsWith('@fcbhealth.com')) {
      message.warning('O e-mail deve ser do domínio @fcbhealth.com');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/send-verification-code`, { email });

      if (response.data.success) {
        message.success('Código de verificação enviado para seu e-mail.');
        setStage('code'); 
      } else {
        message.error('Erro ao enviar código de verificação.');
      }
    } catch (error) {
      message.error('Erro ao enviar código de verificação.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      message.warning('Por favor, insira o código de verificação.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/verify-code`, {
        email,
        code
      });
  
      if (response.data.success) {
        message.success('Código verificado com sucesso!');
        const { token, isAdmin } = response.data;
  
        // Salvar o token JWT e o e-mail do usuário no localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_email', email);
        localStorage.setItem('is_admin', isAdmin);  // Salvar se é admin
  
        // Redirecionar para o Home ou Admin dependendo do tipo de usuário
        if (isAdmin) {
          navigate('/Admin');
        } else {
          navigate('/Home');
        }
      } else {
        message.error('Código inválido. Tente novamente.');
      }
    } catch (error) {
      message.error('Erro ao verificar o código.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card title={stage === 'email' ? 'Verificação de E-mail' : 'Insira o Código'} style={{ width: 400 }}>
          <Form layout="vertical">
            {stage === 'email' ? (
              <>
                <Form.Item label="E-mail" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    block
                    loading={loading}
                    onClick={handleEmailSubmit}
                  >
                    Enviar Código
                  </Button>
                </Form.Item>
              </>
            ) : (
              <>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: '#555' }}>
                  Um código foi enviado para <strong>{email}</strong>
                </p>
              </div>
            
              <Form.Item label={<span style={{ fontWeight: 500 }}>Código de Verificação</span>} required>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Código"
                  style={{
                    fontSize: '18px',
                    textAlign: 'center',
                    letterSpacing: '6px',
                    padding: '10px 14px',
                    borderRadius: 6,
                  }}
                  maxLength={6}
                />
              </Form.Item>
            
              <Form.Item>
                <Button
                  type="primary"
                  block
                  loading={loading}
                  onClick={handleVerifyCode}
                  style={{
                    fontWeight: 'bold',
                    height: 40,
                    borderRadius: 6,
                  }}
                >
                  Verificar Código
                </Button>
              </Form.Item>
            
              <Form.Item>
                <Button
                  type="default"
                  block
                  disabled={loading}
                  onClick={handleEmailSubmit}
                  style={{
                    height: 40,
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  Reenviar Código
                </Button>
                <Button
                  type="link"
                  block
                  onClick={() => setStage('email')}
                  disabled={loading}
                >
                  Voltar e alterar e-mail
                </Button>
              </Form.Item>
            </>
            )}
          </Form>
        </Card>
      </Content>

      <Footer style={{ textAlign: 'center' }}>SnapBox © {new Date().getFullYear()}</Footer>
    </Layout>
  );
};

export default Login;
