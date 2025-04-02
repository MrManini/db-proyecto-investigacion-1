const express = require('express');
const neo4j = require('neo4j-driver');
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

app.use(express.urlencoded({ extended: true }));

// Create a User
app.post("/users", async (req, res) => {
    const { idU, nombre } = req.body;
    const session = driver.session();
    
    try {
        await session.run("CREATE (:Usuario {idU: $idU, nombre: $nombre})", { idU, nombre });
        res.send("Usuario creado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Create a Post
app.post("/posts", async (req, res) => {
    const { idP, contenido, autorId } = req.body;
    const session = driver.session();

    try {
        await session.run(`
            MATCH (u:Usuario {idU: $autorId})
            CREATE (p:Post {idP: $idP, contenido: $contenido})
            CREATE (u)-[:CREA]->(p)
        `, { idP, contenido, autorId });
        res.send("Post creado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Create a Comment
app.post("/comments", async (req, res) => {
    const { consec, texto, autorId, postId } = req.body;
    const session = driver.session();

    try {
        await session.run(`
            MATCH (u:Usuario {idU: $autorId}), (p:Post {idP: $postId})
            CREATE (c:Comentario {consec: $consec, texto: $texto})
            CREATE (u)-[:ESCRIBE]->(c)
            CREATE (c)-[:PERTENECE_A]->(p)
        `, { consec, texto, autorId, postId });
        res.send("Comentario creado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Delete a User (removes relationships too)
app.delete("/users/:id", async (req, res) => {
    const session = driver.session();

    try {
        await session.run("MATCH (u:Usuario {idU: $idU}) DETACH DELETE u", { idU: parseInt(req.params.id) });
        res.send("Usuario eliminado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Delete a Post
app.delete("/posts/:id", async (req, res) => {
    const session = driver.session();

    try {
        await session.run("MATCH (p:Post {idP: $idP}) DETACH DELETE p", { idP: parseInt(req.params.id) });
        res.send("Post eliminado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Delete a Comment
app.delete("/comments/:id", async (req, res) => {
    const session = driver.session();

    try {
        await session.run("MATCH (c:Comentario {consec: $consec}) DETACH DELETE c", { consec: parseInt(req.params.id) });
        res.send("Comentario eliminado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));