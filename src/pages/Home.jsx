import React, { useState, useEffect } from 'react';
import { Upload, Button, Layout, Typography, Card, Row, Col, Image, Popconfirm, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL;

const handleApiError = (error, defaultMessage) => {
  console.error(error);
  message.error(defaultMessage);
  return null;
};

const Home = () => {
  const [fileList, setFileList] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await axios.get(`${API_URL}/files`)
        .catch(error => handleApiError(error, 'Erro ao carregar arquivos'));
      
      if (response) {
        setFiles(response.data);
      }
      setLoading(false);
    };

    fetchFiles();
  }, [API_URL]);

  const handleUpload = () => {
    if (!fileList.length) return;

    fileList.forEach(item => {
      const file = item.originFileObj;
      uploadSingleFile(file);
    });

    setFileList([]);
  };

  const uploadSingleFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload`, formData)
      .catch(() => message.error('Erro ao enviar arquivo.'));
    
    if (response) {
      setFiles(prev => [response.data, ...prev]);
    }
  };

  const handleDelete = async (fileId, filePath) => {
    setDeletingId(fileId);
    
    const response = await axios.delete(`${API_URL}/files/${fileId}`, { data: { path: filePath } })
      .catch(error => handleApiError(error, 'Erro ao excluir arquivo'));
    
    if (response) {
      setFiles(files.filter(file => file.id !== fileId));
    }
    setDeletingId(null);
  };

  const isVideo = (file) => file.mimetype?.startsWith('video/') || file.url?.endsWith('.mp4');

  const renderFileCard = (file) => (
    <Col key={file.id} xs={24} sm={12} md={8} lg={6}>
      <Card
        hoverable
        cover={isVideo(file) ? (
          <video controls style={{ width: '100%', height: '160px', objectFit: 'cover' }} src={file.url} />
        ) : (
          <Image src={file.url} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
        )}
        actions={[
          <Popconfirm
            title="Excluir arquivo?"
            onConfirm={() => handleDelete(file.id, file.path)}
          >
            <Button danger icon={<DeleteOutlined />} loading={deletingId === file.id} />
          </Popconfirm>
        ]}
      >
        <Card.Meta title={file.name} description={`${Math.round(file.size / 1024)} KB`} />
      </Card>
    </Col>
  );

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Card title="Upload de Arquivo" style={{ marginBottom: 24 }}>
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            multiple
            accept="image/*,video/*"
            beforeUpload={() => false} 
          >
            <Button icon={<UploadOutlined />}>Selecionar Arquivo(s)</Button>
          </Upload>

          {fileList.length > 0 && (
            <Button type="primary" onClick={handleUpload} style={{ marginTop: 16 }}>
              Enviar Arquivo(s)
            </Button>
          )}
        </Card>

        <Card title="Arquivos Disponíveis" loading={loading}>
          <Row gutter={[16, 16]}>
            {files.length > 0 ? files.map(renderFileCard) : (
              <Text type="secondary" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                Nenhum arquivo encontrado
              </Text>
            )}
          </Row>
        </Card>
      </Content>

      <Footer style={{ textAlign: 'center' }}>SnapBox © {new Date().getFullYear()}</Footer>
    </Layout>
  );
};

export default Home;