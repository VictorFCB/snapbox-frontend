import React, { useState, useEffect } from 'react';
import { 
  Line, 
  Bar,
  Pie 
} from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement, 
  PointElement, 
  Title as ChartTitle, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { Tabs, message } from 'antd';

// Importações do Ant Design
import Card from 'antd/es/card';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Space from 'antd/es/space';
import Statistic from 'antd/es/statistic';
import Divider from 'antd/es/divider';
import Button from 'antd/es/button';
import Tag from 'antd/es/tag';
import Image from 'antd/es/image';
import Spin from 'antd/es/spin';
import Typography from 'antd/es/typography';
import DatePicker from 'antd/es/date-picker';
import Table from 'antd/es/table';

// Ícones do Ant Design
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  LinkOutlined,
  CalendarOutlined,
  CopyOutlined,
  ShareAltOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  LineElement, 
  PointElement, 
  BarElement,
  ArcElement,
  ChartTitle, 
  Tooltip, 
  Legend
);

const API_URL = process.env.REACT_APP_API_URL;

const Performance = () => {
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_clicks: 0,
    unique_visitors: 0,
    conversion_rate: 0,
    devices: { desktop: 0, mobile: 0, tablet: 0, other: 0 },
    daily_data: [],
    geo_data: [],
    referrers: [],
    conversions: []
  });
  const [dateRange, setDateRange] = useState([
    moment().subtract(7, 'days'),
    moment()
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUrlData = async () => {
      const urlData = localStorage.getItem('selectedUrl');
      if (!urlData) {
        navigate('/');
        return;
      }

      try {
        const parsedUrl = JSON.parse(urlData);
        setSelectedUrl(parsedUrl);
        await fetchPerformanceData(parsedUrl.id);
      } catch (e) {
        console.error("Error parsing URL data:", e);
        message.error("Erro ao carregar dados da URL");
        navigate('/');
      }
    };

    loadUrlData();
  }, [navigate]);

  const fetchPerformanceData = async (urlId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/url-performance/${urlId}`, {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        },
        timeout: 10000 // 10 segundos timeout
      });
      
      if (!response.data) {
        throw new Error("Resposta vazia do servidor");
      }

      setStats({
        ...response.data,
        utm_stats: extractUTMParams(selectedUrl?.url || '')
      });
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setError(error.response?.data?.error || error.message);
      
      // Mostrar notificação de erro
      message.error({
        content: `Erro ao carregar dados: ${error.response?.data?.error || error.message}`,
        icon: <WarningOutlined />,
        duration: 5
      });
    } finally {
      setLoading(false);
    }
  };

  const extractUTMParams = (url) => {
    if (!url) return [];
    try {
      const params = new URL(url).searchParams;
      return Array.from(params.entries())
        .filter(([key]) => key.startsWith('utm_'))
        .map(([key, value]) => ({ param: key, value }));
    } catch {
      return [];
    }
  };

  const handleDateChange = (dates) => {
    if (!dates || dates.length !== 2) return;
    
    setDateRange(dates);
    if (selectedUrl) {
      fetchPerformanceData(selectedUrl.id);
    }
  };

  const copyToClipboard = () => {
    if (selectedUrl?.url) {
      navigator.clipboard.writeText(selectedUrl.url);
      message.success('URL copiada para a área de transferência!');
    }
  };

  const shareUrl = () => {
    if (selectedUrl?.url) {
      message.info('Recurso de compartilhamento será implementado em breve!');
    }
  };

  // Configurações dos gráficos
  const dailyData = stats.daily_data || [];
  
  const lineChartData = {
    labels: dailyData.map(item => moment(item.date).format('DD/MM')),
    datasets: [
      {
        label: 'Cliques',
        data: dailyData.map(item => item.clicks),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        tension: 0.3,
        borderWidth: 2
      },
      {
        label: 'Conversões',
        data: dailyData.map(item => item.conversions || 0),
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.2)',
        tension: 0.3,
        borderWidth: 2
      }
    ]
  };

  const deviceData = {
    labels: ['Desktop', 'Mobile', 'Tablet', 'Outros'],
    datasets: [
      {
        data: [
          stats.devices.desktop,
          stats.devices.mobile,
          stats.devices.tablet,
          stats.devices.other
        ],
        backgroundColor: [
          '#1890ff',
          '#722ed1',
          '#13c2c2',
          '#fa8c16'
        ],
        borderWidth: 1
      }
    ]
  };

  const referrerData = {
    labels: (stats.referrers || []).map(r => r.source),
    datasets: [
      {
        data: (stats.referrers || []).map(r => r.count),
        backgroundColor: [
          '#1890ff',
          '#722ed1',
          '#13c2c2',
          '#fa8c16',
          '#f5222d'
        ],
        borderWidth: 1
      }
    ]
  };

  if (!selectedUrl) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Cabeçalho com informações da URL */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col flex="auto">
                <Title level={3} style={{ marginBottom: 8 }}>
                  {selectedUrl.name}
                </Title>
                <Text type="secondary" style={{ display: 'flex', alignItems: 'center' }}>
                  <LinkOutlined style={{ marginRight: 8 }} />
                  <a 
                    href={selectedUrl.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      wordBreak: 'break-all',
                      color: '#1890ff'
                    }}
                  >
                    {selectedUrl.url}
                  </a>
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={copyToClipboard}
                    size="middle"
                  >
                    Copiar URL
                  </Button>
                  <Button 
                    icon={<ShareAltOutlined />}
                    type="primary"
                    onClick={shareUrl}
                    size="middle"
                  >
                    Compartilhar
                  </Button>
                </Space>
              </Col>
            </Row>
            
            {selectedUrl.image && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Image
                  src={selectedUrl.image}
                  alt="Preview"
                  style={{ 
                    maxHeight: 150, 
                    maxWidth: '100%',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0'
                  }}
                  preview={{
                    maskClassName: 'image-preview-mask'
                  }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Seletor de período */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={4} style={{ marginBottom: 0 }}>
                  Período de Análise
                </Title>
              </Col>
              <Col>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateChange}
                  suffixIcon={<CalendarOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Estatísticas principais */}
      <Row gutter={[24, 24]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cliques Totais"
              value={stats.total_clicks}
              precision={0}
              valueStyle={{ fontSize: '24px', color: '#1890ff' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Visitantes Únicos"
              value={stats.unique_visitors}
              precision={0}
              valueStyle={{ fontSize: '24px', color: '#52c41a' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Taxa de Conversão"
              value={stats.conversion_rate}
              precision={2}
              valueStyle={{ fontSize: '24px', color: '#fa8c16' }}
              suffix="%"
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Cliques e Conversões Diárias">
            <Line data={lineChartData} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Distribuição por Dispositivos">
            <Pie data={deviceData} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Fontes de Tráfego">
            <Bar data={referrerData} />
          </Card>
        </Col>
      </Row>

      {/* Dados Geográficos */}
      {stats.geo_data?.length > 0 && (
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="Distribuição Geográfica">
              <Tabs defaultActiveKey="table">
                <TabPane tab="Tabela" key="table">
                  <Table
                    columns={[
                      {
                        title: 'País',
                        dataIndex: 'country_name',
                        key: 'country_name',
                        render: (text, record) => (
                          <Space>
                            <span className={`fi fi-${record.country_code.toLowerCase()}`}></span>
                            {text}
                          </Space>
                        )
                      },
                      { 
                        title: 'Cliques', 
                        dataIndex: 'clicks', 
                        key: 'clicks',
                        sorter: (a, b) => a.clicks - b.clicks,
                        defaultSortOrder: 'descend'
                      },
                      { 
                        title: 'Percentual', 
                        key: 'percentage',
                        render: (_, record) => (
                          <Text>
                            {((record.clicks / stats.total_clicks) * 100).toFixed(1)}%
                          </Text>
                        )
                      }
                    ]}
                    dataSource={(stats.geo_data || []).map(item => ({
                      ...item,
                      key: item.country_code
                    }))}
                    pagination={false}
                    scroll={{ x: true }}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Performance;
