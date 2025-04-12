const express = require('express');
const cors = require('cors');

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json()); // Para aceitar JSON no body das requisições

app.get('/api/users', (req, res) => {
    res.json([
        { id: 1, name: 'Usuário 1', email: 'user1@example.com' },
        { id: 2, name: 'Usuário 2', email: 'user2@example.com' },
    ]);
});

app.listen(8000, () => {
    console.log('Servidor rodando na porta 8000');
});
