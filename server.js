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
    let { idu, nombre } = req.body;
    const session = driver.session();
    
    try {
        idu = parseInt(idu);
        await session.run("CREATE (:Usuario {idu: $idu, nombre: $nombre})", { idu, nombre });
        res.send("Usuario creado!");
    } catch (error) {
        console.error(error);
        res.status(500).send("error");
    } finally {
        session.close();
    }
});

// Create a Post
app.post("/posts", async (req, res) => {
    let { idp, contenido, autorId } = req.body;
    const session = driver.session();

    try {
        idp = parseInt(idp);
        autorId = parseInt(autorId);
        await session.run(`
            MATCH (u:Usuario {idu: $autorId})
            CREATE (p:Post {idp: $idp, contenido: $contenido})
            CREATE (u)-[:PUBLICA]->(p)
        `, { idp, contenido, autorId });
        res.send("Post creado!");
    } catch (error) {
        res.status(500).send("error: " + error);
    } finally {
        session.close();
    }
});

// Create a Comment
app.post("/comments", async (req, res) => {
    let { contenido, autorId, postId, likeNotLike } = req.body;
    const session = driver.session();
    console.log(req.body); 

    try {
        autorId = parseInt(autorId);
        postId = parseInt(postId);
        await session.run(`
            MATCH (p:Post {idp: $postId})
            OPTIONAL MATCH (p)-[:TIENE]->(c:Comentario)
            MATCH (u:Usuario {idu: $autorId})
            WITH p, u, max(c.consec) AS lastConsec
            CREATE (new:Comentario {contenido: $contenido, consec: coalesce(lastConsec, 0) + 1, fechorCom: datetime(), likeNotLike: $likeNotLike})
            CREATE (p)-[:TIENE]->(new)
            CREATE (u)-[:HACE]->(new)
        `, { contenido, autorId, postId, likeNotLike });
        res.send("Comentario creado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Authorize a comment
app.put("/comments", async (req, res) => {
    let { postId, consec, userId } = req.body;
    const session = driver.session();

    try {
        postId = parseInt(postId);
        consec = parseInt(consec);
        userId = parseInt(userId);
        await session.run(`
            MATCH (u:Usuario {idu: $userId})-[:PUBLICA]->(p:Post {idp: $postId})-[:TIENE]->(c:Comentario {consec: $consec})
            SET c.fechorAut = datetime()
            CREATE (u)-[:AUTORIZA]->(c)
        `, { postId, consec, userId });
        res.send("Comentario autorizado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Update a User
app.put("/users/:id", async (req, res) => {
    let { userId, nombre } = req.body;
    const session = driver.session();

    try {
        userId = parseInt(userId);
        await session.run("MATCH (u:Usuario {idu: $userId}) SET u.nombre = $nombre", { userId, nombre });
        res.send("Usuario actualizado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Update a Post
app.put("/posts/:id", async (req, res) => {
    let { postId, contenido } = req.body;
    const session = driver.session();

    try {
        postId = parseInt(postId);
        await session.run("MATCH (p:Post {idp: $postId}) SET p.contenido = $contenido", { postId, contenido });
        res.send("Post actualizado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Update a Comment
app.put("/comments/:id", async (req, res) => {
    let { postId, consec, contenido } = req.body;
    const session = driver.session();

    try {
        postId = parseInt(postId);
        consec = parseInt(consec);
        await session.run("MATCH (p:Post {idp: $postId})-[:TIENE]->(c:Comentario {consec: $consec}) SET c.contenido = $contenido", 
            { postId, consec, contenido });
        res.send("Comentario actualizado!");
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
        await session.run("MATCH (u:Usuario {idu: $idu}) DETACH DELETE u", { idu: parseInt(req.params.id) });
        res.send(`Usuario ${req.params.id} eliminado!`);
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Delete a Post
app.delete("/posts/:id", async (req, res) => {
    const session = driver.session();
    let { idp } = req.body;

    try {
        await session.run("MATCH (p:Post {idp: $idp}) DETACH DELETE p", { idp: parseInt(req.params.id) });
        res.send("Post eliminado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

// Delete a Comment
app.delete("/comments", async (req, res) => {
    const session = driver.session();
    let { postId, consec } = req.body;
    
    try {
        postId = parseInt(postId);
        consec = parseInt(consec);
        await session.run(`
            MATCH (p:Post {idp: $postId})
            MATCH (p)-[:TIENE]->(c:Comentario {consec: $consec})
            DETACH DELETE c
        `, { postId, consec });
        res.send("Comentario eliminado!");
    } catch (error) {
        res.status(500).send(error);
    } finally {
        session.close();
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));