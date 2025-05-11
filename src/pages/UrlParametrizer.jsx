import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Input, Button, Space, Checkbox, Select, Typography, Modal, Upload, message
} from 'antd';
import { PlusOutlined, CopyOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
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
};

const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        const width = maxWidth;
        const height = img.height * scale;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('Erro ao comprimir a imagem.')),
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem.'));
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
};

// ... imports e constantes como estavam

const UrlParametrizer = () => {
  const [baseUrl, setBaseUrl] = useState('');
  const [selectedParams, setSelectedParams] = useState([]);
  const [params, setParams] = useState({});
  const [resultUrl, setResultUrl] = useState('');
  const [savedUrls, setSavedUrls] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false); // NOVO
  const [campaignNameToSave, setCampaignNameToSave] = useState(''); // NOVO
  const agencyName = 'FCBHEALTH';
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchSavedUrls = async () => {
    const response = await axios.get(`${API_URL}/urls`).catch(error =>
      handleApiError(error, 'Erro ao buscar URLs salvas')
    );
    if (response) setSavedUrls(response.data);
  };

  useEffect(() => {
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
    if (imageFile) formData.append('image', imageFile);

    const response = await axios.post(`${API_URL}/parametrize-url`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).catch(error => handleApiError(error, 'Erro ao gerar URL parametrizada.'));

    if (response) {
      setResultUrl(response.data.parametrizedUrl);
      message.success('URL parametrizada com sucesso!');
    }
  };

  // Abre o modal de nome
  const handleSaveUrl = () => {
    if (!resultUrl) return message.warning('Por favor, gere a URL antes de salvar.');
    setCampaignNameToSave('');
    setShowNameModal(true);
  };

  // Confirma o nome e salva no backend
  const confirmSaveUrl = async () => {
    try {
      const formData = new FormData();
      formData.append('name', campaignNameToSave || `Campanha ${savedUrls.length + 1}`);
      formData.append('url', resultUrl);
      if (imageFile) formData.append('image', imageFile);

      const response = await axios.post(`${API_URL}/save-url`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response) {
        await fetchSavedUrls();
        setBaseUrl('');
        setParams({});
        setSelectedParams([]);
        setImagePreview(null);
        setImageFile(null);
        setResultUrl('');
        setCampaignNameToSave('');
        setShowNameModal(false);
        message.success('URL salva com sucesso!');
      }
    } catch (error) {
      handleApiError(error, 'Erro ao salvar URL.');
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
          title={savedUrl.name}
          size="small"
          style={{ marginBottom: 12, cursor: 'pointer', width: '100%', borderRadius: 8 }}
          cover={savedUrl.image && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60, overflow: 'hidden', padding: 4 }}>
              <img src={savedUrl.image} alt="thumbnail" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          )}
          onClick={() => {
            setSelectedUrl(savedUrl);
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
      {/* Coluna lateral esquerda */}
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

      {/* Geração de URL */}
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
                  beforeUpload={async (file) => {
                    try {
                      const compressedBlob = await compressImage(file);
                      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

                      const reader = new FileReader();
                      reader.onload = (e) => setImagePreview(e.target.result);
                      reader.readAsDataURL(compressedFile);
                      setImageFile(compressedFile);
                      return false;
                    } catch {
                      message.error('Erro ao comprimir a imagem.');
                      return false;
                    }
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Imagem" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                      readOnly
                      style={{ width: '100%', height: 40, fontSize: 14, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                      suffix={<Button type="text" icon={<CopyOutlined />} onClick={handleCopyUrl} style={{ padding: 0 }} />}
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

      {/* URLs salvas */}
      <Col xs={24} md={6}>
        <Card title={<Title level={4}>URLs Salvas</Title>} style={{ borderRadius: 8 }}>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {renderSavedUrls()}
          </div>
        </Card>
      </Col>

      {/* Modal de visualização */}
      <Modal
        title="Visualizar URL"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="delete" danger onClick={handleDelete}>Excluir</Button>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>Fechar</Button>,
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={handleCopyUrl}>Copiar URL</Button>,
        ]}
      >
        {selectedUrl && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>Campanha: {selectedUrl.name}</Title>
            <Text>{selectedUrl.url}</Text>
            {selectedUrl.image && (
              <img src={selectedUrl.image} alt="Imagem da campanha" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', marginTop: 12 }} />
            )}
          </Space>
        )}
      </Modal>

      {/* Modal para nome da campanha */}
      <Modal
        title="Nome da campanha"
        visible={showNameModal}
        onCancel={() => setShowNameModal(false)}
        onOk={confirmSaveUrl}
        okText="Salvar"
      >
        <Input
          placeholder="Digite o nome da campanha"
          value={campaignNameToSave}
          onChange={(e) => setCampaignNameToSave(e.target.value)}
        />
      </Modal>
    </Row>
  );
};

export default UrlParametrizer;

