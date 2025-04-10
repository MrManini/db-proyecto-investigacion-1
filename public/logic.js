async function sendRequest(url, method, body) {
    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    alert(await res.text());
}

document.getElementById("addUserForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sendRequest("/users", "POST", {
        idu: document.getElementById("userId").value,
        nombre: document.getElementById("userName").value
    });
});

document.getElementById("addPostForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sendRequest("/posts", "POST", {
        idp: document.getElementById("postId").value,
        contenido: document.getElementById("postContent").value,
        autorId: document.getElementById("postAuthorId").value
    });
});

document.getElementById("addCommentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sendRequest("/comments", "POST", {
        contenido: document.getElementById("commentText").value,
        autorId: document.getElementById("commentAuthorId").value,
        postId: document.getElementById("commentPostId").value,
        likeNotLike: document.getElementById("commentLikeNotLike").checked
    });
});

document.getElementById("authorizeCommentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sendRequest("/comments", "PUT", {
        postId: document.getElementById("authorizeCommentPostId").value,
        consec: document.getElementById("authorizeCommentId").value,
        userId: document.getElementById("authorizeCommentUserId").value,
    });
});

document.getElementById("updateUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("updateUserId").value;
    const nombre = document.getElementById("updateUserName").value;
    
    sendRequest(`/users/${id}`, "PUT", { userId: id, nombre });
});

document.getElementById("updatePostForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("updatePostId").value;
    const contenido = document.getElementById("updatePostText").value;
    
    sendRequest(`/posts/${id}`, "PUT", { postId: id, contenido });
});

document.getElementById("updateCommentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const postId = document.getElementById("updateCommentPostId").value;
    const consec = document.getElementById("updateCommentId").value;
    const contenido = document.getElementById("updateCommentText").value;
    
    sendRequest(`/comments/${consec}`, "PUT", { postId, consec, contenido });
});

document.getElementById("deleteUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("deleteUserId").value;
    
    sendRequest(`/users/${id}`, "DELETE");
});

document.getElementById("deletePostForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("deletePostId").value;
    
    sendRequest(`/posts/${id}`, "DELETE");
});

document.getElementById("deleteCommentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    sendRequest("/comments", "DELETE", {
        postId: document.getElementById("deleteCommentPostId").value,
        consec: document.getElementById("deleteCommentId").value
    });
});

document.getElementById("getUserPostsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("getUserPostsId").value;
    
    const res = await fetch(`/posts/${id}`);
    const data = await res.json();
    
    showPosts(data);
});

document.getElementById("getPostCommentsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("getPostCommentsId").value;
    
    const res = await fetch(`/comments/${id}`);
    const data = await res.json();
    
    showComments(data);
});

function showPosts(posts) {
    const msg = posts.map(post => {
        return `
🧾 Post #${post.idp}
💬 "${post.contenido}"
        `;
    }).join('\n\n');

    alert(msg);
}

function showComments(comments) {
    let msg = comments.map(comment => {
        
        let commentStatus = comment.fechorAut ? "✅" : "❌";

        const line = `
#${comment.consec}
✔️ Like: ${comment.likeNotLike}
💬 "${comment.contenido}"
🕒 Creado: ${comment.fechorCom}
${commentStatus} Autorizado: ${comment.fechorAut ? comment.fechorAut : "No autorizado"}
        `;
        
        return line;
    }).join('\n\n');

    alert(msg);
}