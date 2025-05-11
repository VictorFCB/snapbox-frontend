import React from 'react';
import {
  Layout,
  Typography,
  Menu,
  Row,
  Col,
  Button,
  Avatar,
  Space,
  Popconfirm,
  Tooltip
} from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title, Text } = Typography;

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('auth_email');
  const userInitials = userEmail ? userEmail.split('@')[0].slice(0, 2).toUpperCase() : '';

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_email');
    navigate('/');
  };

  const getMenuKey = () => {
    if (location.pathname === '/') return 'login';
    if (location.pathname === '/Home') return 'home';
    if (location.pathname.startsWith('/Email')) return 'send';
    if (location.pathname.startsWith('/UrlParametrizer')) return 'Parametrizer';
    return '';
  };

  return (
    <Header
      style={{
        background: '#001529',
        padding: '0 24px',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Row justify="space-between" align="middle" style={{ width: '100%' }}>
        {/* Logo */}
        <Col>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              SnapBox
            </Title>
          </Link>
        </Col>

        {/* Menu e usuário à direita */}
        <Col>
          <Row align="middle" gutter={16} wrap={false}>
            {/* Menu */}
            <Col>
              <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[getMenuKey()]}
                style={{ background: 'transparent', borderBottom: 'none' }}
              >
                <Menu.Item key="home">
                  <Link to="/Home">Home</Link>
                </Menu.Item>
                <Menu.Item key="send">
                  <Link to="/Email">Send</Link>
                </Menu.Item>
                <Menu.Item key="Parametrizer">
                  <Link to="/UrlParametrizer">Parametrizer</Link>
                </Menu.Item>
              </Menu>
            </Col>

            {userEmail && (
              <Col>
                <Space size="middle" align="center">
                  <Tooltip title={userEmail}>
                    <Space size="small" align="center">
                      <Avatar size="small" style={{ backgroundColor: '#87d068', fontSize: 15 }}>
                        {userInitials}
                      </Avatar>
                    </Space>
                  </Tooltip>

                  <Popconfirm
                    title="Deseja realmente sair?"
                    onConfirm={handleLogout}
                    okText="Sim"
                    cancelText="Não"
                  >
                    <span style={{ cursor: 'pointer', color: '#fff', fontSize: 16 }}>
                      <LogoutOutlined />
                    </span>
                  </Popconfirm>

                </Space>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Header>
  );
};

export default AppHeader;
