import React from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Avatar,
  Space,
  Popconfirm,
  Tooltip
} from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('auth_email');
  const userInitials = userEmail ? userEmail.split('@')[0].slice(0, 2).toUpperCase() : '';

  const handleLogout = async () => {
    const email = localStorage.getItem('auth_email');
    
    // Captura os caminhos visitados
    const visitedPaths = JSON.parse(localStorage.getItem('visited_paths')) || {};
    
    // Encontra o caminho mais visitado
    let mostVisited = '/';
    let maxCount = 0;
    
    Object.entries(visitedPaths).forEach(([path, count]) => {
      if (count > maxCount) {
        mostVisited = path;
        maxCount = count;
      }
    });
  
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/logout`, {
        email,
        most_viewed_path: mostVisited,
      });
    } catch (error) {
      console.error('Erro ao registrar logout:', error);
    }
  
    // Limpa o storage
    localStorage.removeItem('auth_token');  
    localStorage.removeItem('is_admin');
    localStorage.removeItem('auth_email');
    localStorage.removeItem('visited_paths');
    
    navigate('/');
  };
  

  const isActive = (path) => location.pathname.startsWith(path);

  const linkStyle = (path) => ({
    color: '#fff', 
    fontWeight: 'bold',
    textDecoration: 'none',
    paddingBottom: '2px', 
    borderBottom: isActive(path) ? '2px solid #fff' : 'none',
    transition: 'border-bottom 0.3s ease'
  });

  return (
    <Header
      style={{
        background: 'linear-gradient(90deg, #00AEEF, #1B5CFF, #7D2E61, #ED0F69, #ED3D24, #FFD600)',
        padding: '0 40px',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 1000
      }}
    >
      <Row justify="space-between" align="middle" style={{ width: '100%' }}>
        <Col>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>SnapBox</Title>
          </Link>
        </Col>

        <Col flex="auto">
          <Row justify="end" align="middle" gutter={24} wrap={false}>
            <Space size="large">
              <Link to="/Home" style={linkStyle('/Home')}>Home</Link>
              <Link to="/Email" style={linkStyle('/Email')}>Send</Link>
              <Link to="/UrlParametrizer" style={linkStyle('/UrlParametrizer')}>Parametrizer</Link>
            </Space>

            {userEmail && (
              <Space size="middle" align="center" style={{ marginLeft: 24 }}>
                <Tooltip title={userEmail}>
                  <Avatar size="small" style={{ backgroundColor: '#7D2E61', fontSize: 15 }}>{userInitials}</Avatar>
                </Tooltip>
                <Popconfirm title="Deseja realmente sair?" onConfirm={handleLogout} okText="Sim" cancelText="Não">
                  <span style={{ cursor: 'pointer', color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                    <LogoutOutlined />
                  </span>
                </Popconfirm>
              </Space>
            )}
          </Row>
        </Col>
      </Row>
    </Header>
  );
};

export default AppHeader;
