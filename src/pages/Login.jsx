import React, { useState } from 'react';
import { Layout, Card, Input, Button, Typography, Form, message } from 'antd';
import axios from 'axios';

const { Content, Footer } = Layout;
const { Title } = Typography;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Para cadastro
  const [confirmPassword, setConfirmPassword] = useState(''); // Para cadastro
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Controla se está no modo de login ou cadastro

  const handleLogin = async () => {
    if (!email || !password) {
      message.warning('Preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        email,
        password,
      });

      const { data } = response;

      if (data.session) {
        message.success('Login bem-sucedido!');
        localStorage.setItem('access_token', data.session.access_token);
        // Redirecionar para a página principal ou dashboard
        // Exemplo: window.location.href = "/dashboard";
      }
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(error.response.data.error || 'Erro ao fazer login');
      } else {
        message.error('Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name || password !== confirmPassword) {
      message.warning('Preencha todos os campos corretamente.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
        name,
        email,
        password,
      });
  
      const { data } = response;
  
      if (data.session) {
        message.success('Cadastro bem-sucedido!');
        localStorage.setItem('access_token', data.session.access_token);
        // Redirecionar para a página principal ou dashboard
        // Exemplo: window.location.href = "/dashboard";
      }
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(error.response.data.error || 'Erro ao fazer cadastro');
      } else {
        message.error('Erro ao fazer cadastro');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card title={isLogin ? 'Login' : 'Cadastro'} style={{ width: 400 }}>
          <Form layout="vertical">
            {!isLogin && (
              <Form.Item label="Nome" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                />
              </Form.Item>
            )}

            <Form.Item label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
              />
            </Form.Item>

            <Form.Item label="Senha" required>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              />
            </Form.Item>

            {!isLogin && (
              <Form.Item label="Confirmar Senha" required>
                <Input.Password
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                />
              </Form.Item>
            )}

            <Form.Item>
              <Button type="primary" block loading={loading} onClick={isLogin ? handleLogin : handleRegister}>
                {isLogin ? 'Entrar' : 'Cadastrar'}
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                type="link"
                block
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Ainda não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>

      <Footer style={{ textAlign: 'center' }}>SnapBox © {new Date().getFullYear()}</Footer>
    </Layout>
  );
};

export default Login;
