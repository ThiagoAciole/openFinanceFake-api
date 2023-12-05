const express = require("express");
const { Client } = require("pg");

const app = express();
const PORT = 3000;

// Configurações do banco de dados PostgreSQL
const dbConfig = {
  user: "postgres",
  host: "db.reokhgxwpcocalenxpxe.supabase.co",
  database: "postgres",
  password: "fintracker123$",
  port: 5432,
};

// Conectar ao banco de dados PostgreSQL
const db = new Client(dbConfig);
db.connect();

// Middleware para processar JSON
app.use(express.json());

// Rota para obter transações de uma conta
app.get("/accounts/:id/transactions", async (req, res) => {
  const accountId = req.params.id;

  try {
    const transactionsResult = await db.query(
      "SELECT * FROM transactionsAPI WHERE accountId = $1",
      [accountId]
    );

    res.json(transactionsResult.rows);
  } catch (error) {
    console.error("Erro ao obter transações da conta:", error);
    res.status(500).json({ error: "Erro ao obter transações da conta." });
  }
});
// Rota para obter todas as contas vinculadas a um usuário
app.get("/accounts/:userId", async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const accountsResult = await db.query(
        "SELECT * FROM accounts WHERE user_id = $1",
        [userId]
      );
      const userAccounts = accountsResult.rows;
  
      res.json(userAccounts);
    } catch (error) {
      console.error("Erro ao obter contas do usuário:", error);
      res.status(500).json({ error: "Erro ao obter contas do usuário." });
    }
  });
  
  // Rota para criar uma nova conta vinculada a um usuário
  app.post("/accounts/:userId", async (req, res) => {
    const userId = req.params.userId;
    const { agencia, conta, banco_nome, saldo } = req.body;
  
    if (!agencia || !conta || !banco_nome || !saldo) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios não fornecidos." });
    }
  
    try {
      const result = await db.query(
        "INSERT INTO accounts (agencia, conta, banco_nome, saldo, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [agencia, conta, banco_nome, saldo, userId]
      );
      const newAccount = result.rows[0];
  
      res.status(201).json(newAccount);
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      res.status(500).json({ error: "Erro ao criar conta." });
    }
  });

// Rota para obter detalhes da conta
app.get("/accounts/:id", async (req, res) => {
    const accountId = req.params.id;
  
    try {
      const accountResult = await db.query(
        "SELECT * FROM accounts WHERE id = $1",
        [accountId]
      );
  
      if (accountResult.rows.length === 0) {
        return res.status(404).json({ error: "Conta não encontrada." });
      }
  
      const accountDetails = accountResult.rows[0];
      res.json(accountDetails);
    } catch (error) {
      console.error("Erro ao obter detalhes da conta:", error);
      res.status(500).json({ error: "Erro ao obter detalhes da conta." });
    }
  });
  

// Rota para criar uma nova transação em uma conta
app.post("/accounts/:id/transactions", async (req, res) => {
  const accountId = req.params.id;
  const { date, type, amount, category } = req.body;

  if (!date || !type || !amount || !category) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios não fornecidos." });
  }

  try {
    const result = await db.query(
      "INSERT INTO transactionsAPI (accountId, date, type, amount, category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [accountId, date, type, amount, category]
    );
    const newTransaction = result.rows[0];

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    res.status(500).json({ error: "Erro ao criar transação." });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
