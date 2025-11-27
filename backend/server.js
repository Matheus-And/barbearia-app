const express = require('express');
const connectDB = require('./db');
const cors = require('cors');

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API da Barbearia Rodando!'));

app.use('/api/auth', require('./routes/auth'));

app.use('/api/appointments', require('./routes/appointments'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));