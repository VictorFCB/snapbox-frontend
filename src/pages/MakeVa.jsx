import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Card, Modal, message, Input } from 'antd';
import { Html5Outlined, AppstoreAddOutlined } from '@ant-design/icons'; // ícones
import { DndProvider, useDrag, useDrop } from 'react-dnd'; // Importando react-dnd
import { HTML5Backend } from 'react-dnd-html5-backend'; // Backend do react-dnd

const { Sider, Content } = Layout;

const MakeVa = () => {
  const [currentTable, setCurrentTable] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [codeType, setCodeType] = useState(''); // Tipo de código (HTML ou CSS)
  const [bgImage, setBgImage] = useState(''); // Estado para armazenar o background da área de conteúdo
  const [buttonImage, setButtonImage] = useState(''); // Estado para armazenar a imagem do botão
  const [buttonWidth, setButtonWidth] = useState('50'); // Largura do botão
  const [buttonHeight, setButtonHeight] = useState('50'); // Altura do botão
  const [buttonZIndex, setButtonZIndex] = useState(10); // Z-Index do botão
  const [generatedHTML, setGeneratedHTML] = useState(''); // Estado para armazenar o HTML gerado
  const [generatedCSS, setGeneratedCSS] = useState(''); // Estado para armazenar o CSS gerado
  const [buttons, setButtons] = useState([]); // Armazena os botões arrastados no conteúdo

  useEffect(() => {
    setCurrentTable('Background');
    setGeneratedHTML(`
      <!DOCTYPE html>
      <html lang="pt">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>V</title>
          <link href="style.css" rel="stylesheet" type="text/css">
        </head>
        <body>
          <div id="content"></div>
        </body>
      </html>
    `);
    setGeneratedCSS(`
      body {
        margin: 0;
        font-family: Arial, sans-serif;
      }
      #content {
        width: 100%;
        height: 100vh;
        background: #fff;
      }
    `);
  }, []);

  const handleTableSelect = (tableName) => {
    setCurrentTable(tableName);
  };

  const handleShowCode = (type) => {
    setCodeType(type); // Define o tipo de código a ser exibido (HTML ou CSS)
    setShowCode(true);
  };

  const handleCloseCode = () => {
    setShowCode(false);
  };

  // Função para solicitar a seleção de uma imagem e definir o background ou o botão
  const handleImageSelection = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageURL = URL.createObjectURL(file);
      if (type === 'background') {
        setBgImage(imageURL); // Atualiza o estado com a URL da imagem do background
      } else if (type === 'button') {
        setButtonImage(imageURL); // Atualiza o estado com a URL da imagem do botão
      }
    } else {
      message.error('Por favor, selecione uma imagem válida!');
    }
  };

  // Função para adicionar um novo botão (com imagem de 50px)
  const addButton = (position) => {
    const newButton = {
      id: Date.now(),
      left: position.left - buttonWidth / 2, // Ajuste para centralizar o botão (com base na largura do botão)
      top: position.top - buttonHeight / 2, // Ajuste para centralizar o botão (com base na altura do botão)
      width: buttonWidth,
      height: buttonHeight,
      zIndex: buttonZIndex,
    };
    setButtons((prevButtons) => [...prevButtons, newButton]);
  };

  const ItemType = 'MENU_ITEM';

  const DragItem = () => {
    const [, drag] = useDrag(() => ({
      type: ItemType,
      item: { type: 'background' },
    }));

    return (
      <Menu.Item key="Background" ref={drag}>
        Background
      </Menu.Item>
    );
  };

  const ButtonDragItem = () => {
    const [, drag] = useDrag(() => ({
      type: ItemType,
      item: { type: 'button', width: buttonWidth, height: buttonHeight, zIndex: buttonZIndex }, // Inclui os dados do tamanho e z-index
    }));

    return (
      <Menu.Item key="Button" ref={drag}>
        Button
      </Menu.Item>
    );
  };

  const DropArea = () => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemType,
      drop: (item, monitor) => {
        const position = monitor.getClientOffset(); // Obtenha a posição do clique
        if (item.type === 'background') {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.onchange = (e) => handleImageSelection(e, 'background');
          fileInput.click();
        } else if (item.type === 'button') {
          if (position) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (e) => handleImageSelection(e, 'button'); // Aqui selecionamos a imagem do botão
            fileInput.click();
            addButton({
              left: position.x,
              top: position.y,
            });
          }
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <Content
        ref={drop} // Atribui o ref corretamente
        style={{
          width: '1024px',
          height: 'calc(100vh - 64px)',
          background: bgImage ? `url(${bgImage}) no-repeat center center` : 'red',
          backgroundSize: '100% 100%',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Renderiza os botões aqui */}
        {buttons.map((button) => (
          <Button
            key={button.id}
            style={{
              position: 'absolute',
              left: button.left,
              top: button.top,
              background: buttonImage ? `url(${buttonImage}) no-repeat center center` : 'blue',
              backgroundSize: 'cover', // Faz a imagem se ajustar ao botão
              width: button.width,
              height: button.height,
              zIndex: button.zIndex,
            }}
          />
        ))}
      </Content>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}> {/* Provider para configurar o contexto do DnD */}
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          width={200}
          style={{
            background: '#f0f2f5',
            padding: '10px',
            position: 'fixed',
            left: 0,
            top: '64px',
            bottom: 0,
          }}
        >
          <Menu
            mode="inline"
            onClick={({ key }) => handleTableSelect(key)}
            selectedKeys={[currentTable]}
            style={{ height: '100%', borderRight: 0 }}
          >
            <DragItem />
            <ButtonDragItem /> {/* Novo item do botão */}
            <Menu.Item key="Tabela2">Tabela 2</Menu.Item>
          </Menu>

          <div style={{ position: 'absolute', bottom: '20px', left: '10px' }}>
            <Button
              type="primary"
              shape="circle"
              icon={<Html5Outlined />}
              onClick={() => handleShowCode('html')}
              style={{ marginBottom: '10px' }}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<AppstoreAddOutlined />}
              onClick={() => handleShowCode('css')}
              style={{ marginBottom: '10px' }}
            />
          </div>
        </Sider>

        <Layout
          style={{
            marginLeft: 200,
            marginRight: 200,
            paddingTop: 64,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 64px)',
          }}
        >
          <DropArea />
        </Layout>

        <Sider
          width={200}
          style={{
            background: '#f0f2f5',
            padding: '10px',
            position: 'fixed',
            right: 0,
            top: '64px',
            bottom: 0,
          }}
        >
          <Card title={`Tabela selecionada: ${currentTable}`} style={{ height: '100%' }}></Card>
          
          {/* Controle do botão */}
          <Input
            style={{ marginTop: '20px' }}
            placeholder="Largura do botão"
            type="number"
            value={buttonWidth}
            onChange={(e) => setButtonWidth(e.target.value)}
          />
          <Input
            style={{ marginTop: '10px' }}
            placeholder="Altura do botão"
            type="number"
            value={buttonHeight}
            onChange={(e) => setButtonHeight(e.target.value)}
          />
          <Input
            style={{ marginTop: '10px' }}
            placeholder="Z-Index"
            type="number"
            value={buttonZIndex}
            onChange={(e) => setButtonZIndex(e.target.value)}
          />
        </Sider>

        <Modal
          title={codeType === 'html' ? 'Código HTML Gerado' : 'Código CSS Gerado'}
          visible={showCode}
          onCancel={handleCloseCode}
          footer={null}
          width="80%"
        >
          {codeType === 'html' ? (
            <>
              <h3>HTML Gerado:</h3>
              <pre>{generatedHTML}</pre>
            </>
          ) : (
            <>
              <h3>CSS Gerado:</h3>
              <pre>{generatedCSS}</pre>
            </>
          )}
        </Modal>
      </Layout>
    </DndProvider>
  );
};

export default MakeVa;
