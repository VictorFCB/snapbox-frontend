import React from 'react';
import { Layout, Typography, Menu, Row, Col } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
  const location = useLocation();

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
      <Row justify="space-between" align="middle">
        <Col>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              SnapBox
            </Title>
          </Link>
        </Col>

        <Col>
          <Menu theme="dark" mode="horizontal" selectedKeys={[getMenuKey()]}>
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
      </Row>
    </Header>
  );
};

export default AppHeader;
