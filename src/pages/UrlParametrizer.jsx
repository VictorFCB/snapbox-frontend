import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Input, Button, Space, Checkbox, Select, Typography, Modal, Upload, message, Popconfirm
} from 'antd';
import { PlusOutlined, CopyOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const PARAMS_LIST = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fase', 'subCampanha', 'regiao', 'audiencia', 'segmentacao', 'teste',
  'tituloEmail', 'linhaEditorial', 'formato', 'tipoArte', 'direcionamento',
  'campoLivreEmail', 'area', 'evento', 'produto'
];

const utmOptions = {
  utm_source: ['google', 'facebook', 'instagram', 'linkedin', 'email', 'newsletter', 'whatsapp'],
  utm_medium: ['cpc', 'organic', 'email', 'social', 'referral', 'banner']
};

const handleApiError = (error, defaultMessage) => {
  console.error(error);
  message.error(defaultMessage);
  return null;
};

const UrlParametrizer = () => {
  const [baseUrl, setBaseUrl] = useState('');
  const [selectedParams, setSelectedParams] = useState([]);
  const [params, setParams] = useState({});
  const [resultUrl, setResultUrl] = useState('');
  const [savedUrls, setSavedUrls] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const agencyName = 'FCBHEALTH';
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchSavedUrls = async () => {
      const response = await axios.get(`${API_URL}/urls`).catch(error =>
        handleApiError(error, 'Erro ao buscar URLs salvas')
      );
      if (response) setSavedUrls(response.data);
    };
    fetchSavedUrls();
  }, [API_URL]);

  const handleInputChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleParametrize = async () => {
    if (!baseUrl) return message.warning('A URL base é obrigatória!');

    const selectedValues = PARAMS_LIST
      .filter(param => selectedParams.includes(param) && params[param])
      .reduce((acc, param) => ({ ...acc, [param]: params[param] }), { agencia: agencyName });

    const formData = new FormData();
    formData.append('baseUrl', baseUrl);
    formData.append('params', JSON.stringify(selectedValues));
    if (imageUrl) formData.append('image', imageUrl);

    const response = await axios.post(`${API_URL}/parametrize-url`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).catch(error => handleApiError(error, 'Erro ao gerar URL parametrizada.'));

    if (response) {
      setResultUrl(response.data.parametrizedUrl);
      message.success('URL parametrizada com sucesso!');
    }
  };

  const handleSaveUrl = async () => {
    if (!resultUrl) return message.warning('Por favor, gere a URL antes de salvar.');

    const savedUrl = {
      name: `Campanha ${savedUrls.length + 1}`,
      url: resultUrl,
      image: imageUrl || null
    };

    const response = await axios.post(`${API_URL}/save-url`, savedUrl)
      .catch(error => handleApiError(error, 'Erro ao salvar URL.'));

    if (response) {
      setSavedUrls([...savedUrls, savedUrl]);
      setBaseUrl('');
      setParams({});
      setSelectedParams([]);
      setImageUrl(null);
      setResultUrl('');
    }
  };

  const handleDelete = async () => {
    if (!selectedUrl?.id) return message.error('ID inválido para exclusão');

    const response = await axios.delete(`${API_URL}/urls/${selectedUrl.id}`)
      .catch(error => handleApiError(error, 'Erro ao excluir a URL'));

    if (response) {
      setSavedUrls(savedUrls.filter(url => url.id !== selectedUrl.id));
      setIsModalVisible(false);
      message.success('URL excluída com sucesso!');
    }
  };

  const handleCopyUrl = () => {
    if (resultUrl) {
      navigator.clipboard.writeText(resultUrl);
      message.success('URL copiada para a área de transferência!');
    }
  };

  const handleEditCampaignName = async (e) => {
    if (e.key === 'Enter' && selectedUrl?.id) {
      const response = await axios.put(`${API_URL}/urls/${selectedUrl.id}`, {
        name: newCampaignName
      }).catch(error => handleApiError(error, 'Erro ao atualizar nome da campanha.'));

      if (response) {
        setSavedUrls(savedUrls.map(url =>
          url.id === selectedUrl.id ? { ...url, name: newCampaignName } : url
        ));
        setIsEditing(false);
        message.success('Nome da campanha atualizado!');
      }
    }
  };

  const renderParamInputs = () => (
    <>
      {selectedParams.includes('utm_source') && (
        <Select
          placeholder="utm_source"
          value={params.utm_source}
          onChange={value => handleInputChange('utm_source', value)}
          options={utmOptions.utm_source.map(src => ({ label: src, value: src }))}
          allowClear
        />
      )}

      {selectedParams.includes('utm_medium') && (
        <Select
          placeholder="utm_medium"
          value={params.utm_medium}
          onChange={value => handleInputChange('utm_medium', value)}
          options={utmOptions.utm_medium.map(m => ({ label: m, value: m }))}
          allowClear
        />
      )}

      {PARAMS_LIST.filter(p => selectedParams.includes(p) && !utmOptions[p]).map(param => (
        <Input
          key={param}
          placeholder={param}
          value={params[param] || ''}
          onChange={e => handleInputChange(param, e.target.value)}
        />
      ))}
    </>
  );

  const renderSavedUrls = () => (
    savedUrls.length > 0 ? (
      savedUrls.map((savedUrl, index) => (
        <Card
          key={index}
          title={
            isEditing && selectedUrl?.url === savedUrl.url ? (
              <Input
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                onKeyDown={handleEditCampaignName}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div onClick={() => {
                setSelectedUrl(savedUrl);
                setNewCampaignName(savedUrl.name);
                setIsEditing(true);
              }}>
                {savedUrl.name}
              </div>
            )
          }
          size="small"
          style={{ marginBottom: 12, cursor: 'pointer', width: '100%', borderRadius: 8 }}
          cover={savedUrl.image && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60, overflow: 'hidden', padding: 4 }}>
              <img src={savedUrl.image} alt="thumbnail" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          )}
          onClick={() => {
            setSelectedUrl(savedUrl);
            setNewCampaignName(savedUrl.name);
            setIsModalVisible(true);
          }}
        >
          <Text type="secondary" ellipsis>{savedUrl.url}</Text>
        </Card>
      ))
    ) : (
      <Text type="secondary">Nenhuma URL salva ainda.</Text>
    )
  );

  return (
    <Row gutter={[24, 24]} justify="center" style={{ padding: '20px', margin: 0 }}>
      <Col xs={24} md={6}>
        <Card title={<Title level={4}>Parametrizar URL</Title>} style={{ borderRadius: 8 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Agência:</Text>
            <Input value={agencyName} disabled style={{ fontWeight: 'bold' }} />
            <Text strong>Selecionar parâmetros:</Text>
            <Checkbox.Group
              value={selectedParams}
              onChange={setSelectedParams}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {PARAMS_LIST.map(param => (
                <Checkbox key={param} value={param}>{param}</Checkbox>
              ))}
            </Checkbox.Group>
          </Space>
        </Card>
      </Col>

      <Col xs={24} md={12}>
        <Card title={<Title level={4}>Geração de URL</Title>} style={{ borderRadius: 8 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={16} style={{ alignItems: 'center' }}>
              <Col span={16}>
                <Input
                  placeholder="URL base (ex: https://fcbhealth.com)"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                />
              </Col>
              <Col span={8}>
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = (e) => setImageUrl(e.target.result);
                    reader.readAsDataURL(file);
                    return false;
                  }}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="Imagem" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Carregar imagem</div>
                    </div>
                  )}
                </Upload>
              </Col>
            </Row>

            {renderParamInputs()}

            <Row justify="space-between" align="middle">
              <Col span={16}>
                <Button type="primary" onClick={handleParametrize} style={{ width: '100%' }}>
                  Gerar URL
                </Button>
              </Col>
              <Col span={6} style={{ paddingLeft: '10px' }}>
                {resultUrl && (
                  <>
                    <Input
                      value={resultUrl}
                      style={{
                        width: '100%',
                        height: 40,
                        fontSize: 14,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                      readOnly
                      suffix={
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={handleCopyUrl}
                          style={{ padding: 0 }}
                        />
                      }
                    />
                    <Button type="default" onClick={handleSaveUrl} style={{ width: '100%' }}>
                      Salvar URL
                    </Button>
                  </>
                )}
              </Col>
            </Row>
          </Space>
        </Card>
      </Col>

      <Col xs={24} md={6}>
        <Card title={<Title level={4}>URLs Salvas</Title>} style={{ borderRadius: 8 }}>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {renderSavedUrls()}
          </div>
        </Card>
      </Col>

      <Modal
        title="Visualizar URL"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="delete" danger onClick={handleDelete}>
            Excluir
          </Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Fechar
          </Button>,
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={handleCopyUrl}>
            Copiar URL
          </Button>,
        ]}
      >
        {selectedUrl && (
          <>
            <Title level={5}>Campanha: {selectedUrl.name}</Title>
            <Text>{selectedUrl.url}</Text>
          </>
        )}
      </Modal>
    </Row>
  );
};

export default UrlParametrizer;