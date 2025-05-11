const express = require('express');
const path = require('path');
const app = express();

// Serve os arquivos estáticos da pasta 'build' (ou 'build_prod', dependendo de onde os arquivos estão)
app.use(express.static(path.join(__dirname, 'build')));

// Redireciona todas as requisições para o index.html, permitindo que o React Router gerencie as rotas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
