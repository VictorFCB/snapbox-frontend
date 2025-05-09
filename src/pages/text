import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Layout, Button, Typography, Space, Input, Divider, Row, Col, Tooltip, Card, message } from 'antd';
import { 
  AlignCenterOutlined, 
  AlignLeftOutlined, 
  AlignRightOutlined, 
  PictureOutlined, 
  SendOutlined,
  FontSizeOutlined,
  BorderOutlined,
  UploadOutlined,
  CloseOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { Title } = Typography;
const { Sider, Content } = Layout;

const ImageUploader = ({ image, onChange, onRemove }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        message.error('Por favor, selecione apenas imagens!');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
        onChange(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div 
      style={{ 
        position: 'relative',
        width: '100%',
        height: '200px',
        border: '1px dashed #d9d9d9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
      onClick={triggerFileInput}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*"
      />
      
      {preview || image ? (
        <>
          <img 
            src={preview || image} 
            alt="Preview" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }} 
          />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            display: 'flex',
            gap: '8px',
            zIndex: 1
          }}>
            <Button 
              icon={<SwapOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              size="small"
            />
            <Button 
              icon={<CloseOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onRemove();
              }}
              size="small"
              danger
            />
          </div>
        </>
      ) : (
        <>
          <UploadOutlined style={{ fontSize: '32px', color: '#999' }} />
          <p style={{ color: '#999', marginTop: '8px' }}>
            Arraste uma imagem ou clique para selecionar
          </p>
        </>
      )}
    </div>
  );
};

const EmailBuilder = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  const handleDrop = useCallback((item) => {
    const newElement = {
      id: Date.now(),
      type: item.type,
      content:
        item.type === 'text'
          ? 'Texto de exemplo'
          : item.type === 'button'
          ? 'Clique'
          : item.type === 'spacer'
          ? 'spacer'
          : '',
      style: { 
        fontSize: '16px', 
        textAlign: 'left', 
        paddingTop: '0px', 
        paddingBottom: '0px', 
        paddingLeft: '0px', 
        paddingRight: '0px',
        marginBottom: '0px'
      },
    };
    setElements((prev) => [...prev, newElement]);
  }, []);

  const moveElement = (dragIndex, hoverIndex) => {
    const updated = [...elements];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, dragged);
    setElements(updated);
  };

  const updateContent = (id, value) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content: value } : el))
    );
  };

  const updateElementStyle = (id, newStyle) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, style: { ...el.style, ...newStyle } } : el))
    );
  };

  const SidebarItem = ({ type, icon, tooltip }) => {
    const [, drag] = useDrag(() => ({
      type: 'BOX',
      item: { type },
    }));

    return (
      <Tooltip title={tooltip}>
        <div ref={drag} style={{ textAlign: 'center', padding: '8px', cursor: 'move', color: '#fff' }}>
          {icon}
        </div>
      </Tooltip>
    );
  };

  const CanvasItem = ({ id, type, content, index, move, updateContent, updateStyle, selectItem, style }) => {
    const ref = useRef(null);
    const [localContent, setLocalContent] = useState(content);

    useEffect(() => {
      setLocalContent(content);
    }, [content]);

    const [, drop] = useDrop({
      accept: 'canvas-item',
      hover(item) {
        if (!ref.current || item.index === index) return;
        move(item.index, index);
        item.index = index;
      },
    });

    const [{ isDragging }, drag] = useDrag({
      type: 'canvas-item',
      item: { id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    drag(drop(ref));

    const handleClick = () => {
      selectItem(id);
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          border: selectedElement === id ? '2px solid green' : 'none',
          ...style,
        }}
      >
        {type === 'text' && (
          <Input.TextArea
            autoSize
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            onBlur={() => updateContent(id, localContent)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                updateContent(id, localContent);
              }
            }}
            style={{
              border: selectedElement === id ? 'none' : '1px solid #d9d9d9',
              textAlign: style.textAlign,
              fontSize: style.fontSize,
              padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
              marginBottom: '0px'
            }}
          />
        )}
        {type === 'image' && (
          <div>
            {content ? (
              <img src={content} alt="Imagem" style={{ width: '100%', display: 'block' }} />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  border: '1px dashed #d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                }}
              >
                <p>Imagem Aqui</p>
              </div>
            )}
          </div>
        )}
        {type === 'button' && (
          <Button 
            type="primary" 
            block
            style={{ 
              marginBottom: '0px',
              padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`
            }}
          >
            {content}
          </Button>
        )}
        {type === 'spacer' && <div style={{ height: '24px' }} />}
      </div>
    );
  };

  const EmailCanvas = ({ elements, onDrop, onMove, onUpdateContent, onUpdateStyle, onSelectItem }) => {
    const [, drop] = useDrop(() => ({
      accept: 'BOX',
      drop: (item) => onDrop(item),
    }));

    return (
      <div
        ref={drop}
        style={{
          width: '100%',
          background: '#fff',
          padding: '16px',
          minHeight: '80vh',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={4}>Pré-visualização</Title>
        <Divider style={{ margin: '0.6rem 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {elements.map((el, index) => (
            <CanvasItem
              key={el.id}
              index={index}
              id={el.id}
              type={el.type}
              content={el.content}
              style={el.style}
              move={onMove}
              updateContent={onUpdateContent}
              updateStyle={onUpdateStyle}
              selectItem={onSelectItem}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderEditOptions = () => {
    if (!selectedElement) return null;

    const selected = elements.find((el) => el.id === selectedElement);

    if (selected.type === 'image') {
      return (
        <Card style={{ padding: '16px' }}>
          <Title level={4}>Opções de Imagem</Title>
          <Divider />
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <ImageUploader
              image={selected.content}
              onChange={(imageData) => updateContent(selected.id, imageData)}
              onRemove={() => updateContent(selected.id, '')}
            />
            
            <Divider>Padding</Divider>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '100%', maxWidth: '200px' }}>
                <Input
                  type="number"
                  value={parseInt(selected.style.paddingTop) || 0}
                  onChange={(e) => updateElementStyle(selected.id, { paddingTop: `${e.target.value}px` })}
                  placeholder="Padding Top"
                  style={{ textAlign: 'center' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%' }}>
                <div style={{ width: '100px' }}>
                  <Input
                    type="number"
                    value={parseInt(selected.style.paddingLeft) || 0}
                    onChange={(e) => updateElementStyle(selected.id, { paddingLeft: `${e.target.value}px` })}
                    placeholder="Padding Left"
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <Input
                    type="number"
                    value={parseInt(selected.style.paddingRight) || 0}
                    onChange={(e) => updateElementStyle(selected.id, { paddingRight: `${e.target.value}px` })}
                    placeholder="Padding Right"
                  />
                </div>
              </div>

              <div style={{ width: '100%', maxWidth: '200px' }}>
                <Input
                  type="number"
                  value={parseInt(selected.style.paddingBottom) || 0}
                  onChange={(e) => updateElementStyle(selected.id, { paddingBottom: `${e.target.value}px` })}
                  placeholder="Padding Bottom"
                  style={{ textAlign: 'center' }}
                />
              </div>
            </div>
          </Space>
        </Card>
      );
    }

    return (
      <Card style={{ padding: '16px' }}>
        <Title level={4}>Opções de Edição</Title>
        <Divider />

        {selected.type === 'text' && (
          <>
            <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
              <Input
                type="number"
                value={parseInt(selected.style.fontSize) || 16}
                onChange={(e) => updateElementStyle(selected.id, { fontSize: `${e.target.value}px` })}
                placeholder="Tamanho da Fonte"
                style={{ width: '100%' }}
              />
            </Space>

            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={8}>
                <Tooltip title="Alinhar à Esquerda">
                  <AlignLeftOutlined
                    style={{ fontSize: 24, cursor: 'pointer' }}
                    onClick={() => updateElementStyle(selected.id, { textAlign: 'left' })}
                  />
                </Tooltip>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Tooltip title="Centralizar">
                  <AlignCenterOutlined
                    style={{ fontSize: 24, cursor: 'pointer' }}
                    onClick={() => updateElementStyle(selected.id, { textAlign: 'center' })}
                  />
                </Tooltip>
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Tooltip title="Alinhar à Direita">
                  <AlignRightOutlined
                    style={{ fontSize: 24, cursor: 'pointer' }}
                    onClick={() => updateElementStyle(selected.id, { textAlign: 'right' })}
                  />
                </Tooltip>
              </Col>
            </Row>
          </>
        )}

        <Divider>Padding</Divider>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '100%', maxWidth: '200px' }}>
            <Input
              type="number"
              value={parseInt(selected.style.paddingTop) || 0}
              onChange={(e) => updateElementStyle(selected.id, { paddingTop: `${e.target.value}px` })}
              placeholder="Padding Top"
              style={{ textAlign: 'center' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%' }}>
            <div style={{ width: '100px' }}>
              <Input
                type="number"
                value={parseInt(selected.style.paddingLeft) || 0}
                onChange={(e) => updateElementStyle(selected.id, { paddingLeft: `${e.target.value}px` })}
                placeholder="Padding Left"
              />
            </div>
            <div style={{ width: '100px' }}>
              <Input
                type="number"
                value={parseInt(selected.style.paddingRight) || 0}
                onChange={(e) => updateElementStyle(selected.id, { paddingRight: `${e.target.value}px` })}
                placeholder="Padding Right"
              />
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: '200px' }}>
            <Input
              type="number"
              value={parseInt(selected.style.paddingBottom) || 0}
              onChange={(e) => updateElementStyle(selected.id, { paddingBottom: `${e.target.value}px` })}
              placeholder="Padding Bottom"
              style={{ textAlign: 'center' }}
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={160} style={{ background: '#001529', padding: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <SidebarItem type="text" icon={<FontSizeOutlined style={{ fontSize: '24px' }} />} tooltip="Texto" />
            <SidebarItem type="image" icon={<PictureOutlined style={{ fontSize: '24px' }} />} tooltip="Imagem" />
            <SidebarItem type="button" icon={<SendOutlined style={{ fontSize: '24px' }} />} tooltip="Botão" />
            <SidebarItem type="spacer" icon={<BorderOutlined style={{ fontSize: '24px' }} />} tooltip="Espaçador" />
          </Space>
        </Sider>

        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', width: '70%' }}>
          <EmailCanvas
            elements={elements}
            onDrop={handleDrop}
            onMove={moveElement}
            onUpdateContent={updateContent}
            onUpdateStyle={updateElementStyle}
            onSelectItem={setSelectedElement}
          />
        </Content>

        <Layout style={{ padding: '16px', width: '60%' }}>
          {renderEditOptions()}
        </Layout>
      </Layout>
    </DndProvider>
  );
};

export default EmailBuilder;