const express = require("express");
const { v4: uuidV4 } = require("uuid");

const app = express();
const SERVER_PORT = 3333;
const SERVER_HOST = "localhost";

let customers = [];

app.use(express.json());

// Middlewares
const verifyIfAccountExists = (request, response, next) => {
    const { cpf } = request.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return response.status(400).json({ error: "Customer not found!" });
    }

    request.customer = customer;

    return next();
};

// Functions
const getBalance = (statement) => {
    const balance = statement.reduce((acc, transaction) => {
        if (transaction.type === "credit") {
            return acc + transaction.amount;
        } else {
            return acc - transaction.amount;
        }
    }, 0);

    return balance;
};

// Routes
app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const custumerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );

    if (custumerAlreadyExists)
        return response.status(400).json({ error: "Customer already exists!" });

    customers = [
        ...customers,
        {
            name,
            cpf,
            id: uuidV4(),
            statement: [],
        },
    ];

    response.status(201).send();
});

app.get("/statement", verifyIfAccountExists, (request, response) => {
    const { customer } = request;

    return response.json(customer.statement);
});

app.get("/statement/date", verifyIfAccountExists, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter(
        (statement) =>
            statement.created_at.toDateString() ===
            new Date(dateFormat).toDateString()
    );

    return response.json(statement);
});

app.post("/deposit", verifyIfAccountExists, (request, response) => {
    const { customer } = request;
    const { description, amount } = request.body;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit",
    };

    customer.statement = [...customer.statement, statementOperation];

    return response.status(201).send();
});

app.post("/withdraw", verifyIfAccountExists, (request, response) => {
    const { customer } = request;
    const { amount } = request.body;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return response.status(400).json({ error: "Insufficient funds!" });
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit",
    };

    customer.statement = [...customer.statement, statementOperation];

    return response.status(201).send();
});

app.put("/account", verifyIfAccountExists, (request, response) => {
    const { customer } = request;
    const { name } = request.body;

    customer.name = name;

    return response.status(201).send();
});

app.get("/account", verifyIfAccountExists, (request, response) => {
    const { customer } = request;

    return response.json(customer);
});

app.get("/balance", verifyIfAccountExists, (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statement);

    return response.json({
        Message: `Your current balance is: R$${balance}.00`,
    });
});

app.delete("/account", verifyIfAccountExists, (request, response) => {
    const { customer } = request;

    customers = [...customers.filter((user) => user.cpf !== customer.cpf)];

    return response.status(200).json(customers);
});

// Server
app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(
        `Server is up and running at: http://${SERVER_HOST}:${SERVER_PORT}`
    );
    console.log("Type CTRL+C to stop the server");
});
