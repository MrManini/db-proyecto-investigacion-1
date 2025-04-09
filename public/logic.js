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

document.getElementById("updateUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("updateUserId").value;
    const nombre = document.getElementById("updateUserName").value;
    
    await fetch(`/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre }) });
    alert("User updated!");
});

document.getElementById("updatePostForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("updatePostId").value;
    const contenido = document.getElementById("updatePostContent").value;
    
    await fetch(`/posts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contenido }) });
    alert("Post updated!");
});

document.getElementById("updateCommentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("updateCommentId").value;
    const texto = document.getElementById("updateCommentText").value;
    
    await fetch(`/comments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto }) });
    alert("Comment updated!");
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