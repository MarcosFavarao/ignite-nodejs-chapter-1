const express = require("express");

const app = express();
const SERVER_PORT = 3333;
const SERVER_HOST = "localhost";

app.use(express.json());

app.get("/courses", (request, response) => {
    const query = request.query;
    console.log(query);

    return response.json(["Curso 1", "Curso 2", "Curso 3"]);
});

app.post("/courses", (request, response) => {
    const body = request.body;
    console.log(body);

    return response.json(["Curso 1", "Curso 2", "Curso 3", "Curso 4"]);
});

app.put("/courses/:id", (request, response) => {
    const { id } = request.params;
    console.log(id);

    return response.json(["Curso 6", "Curso 2", "Curso 3", "Curso 4"]);
});

app.patch("/courses/:id", (request, response) => {
    return response.json(["Curso 6", "Curso 7", "Curso 3", "Curso 4"]);
});

app.delete("/courses/:id", (request, response) => {
    return response.json(["Curso 6", "Curso 7", "Curso 4"]);
});

// Server start
app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(
        `Server is up and running at: http://${SERVER_HOST}:${SERVER_PORT}`
    );
});
