const form = document.getElementById("video-form");
const urlInput = document.getElementById("video-url");
const message = document.getElementById("message");

const result = document.getElementById("video-result");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "Fetching video information...";
    message.style.color = "gray"
    result.replaceChildren();

    try {
        const response = await fetch ("/api/video", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                videoUrl: urlInput.value.trim()
            })
        });

        const data = await response.json();

        if(!response.ok || !data.success) {
            throw new Error(data.message || "Request failed.");
        } 

        const title = document.createElement("h2");
        title.textContent = data.title;

        const thumbnail = document.createElement("img");
        thumbnail.src = data.thumbnail;
        thumbnail.alt = `Thumbnail for ${data.title}`;
        thumbnail.className = "video-thumbnail";

        thumbnail.onerror = () => {
            console.error("Thumbnail failed to load:", thumbnail.src);
            message.textContent = "Video details loaded, but the thumbnail could not be loaded.";
            message.style.color = "red";
        }

        const author = document.createElement("p");
        author.textContent = data.author;
        author.className = "video-author"

        const resultHead = document.createElement("div");

        resultHead.append(title, author);

        const link = document.createElement("a");
        link.href = data.originalUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Watch on YouTube";
        
        result.append(resultHead, thumbnail, link);

        message.textContent = "Video retrieved successfully.";
        message.style.color = "green";

    } catch (error) {
            message.textContent = error.message || "Something went wrong.";
        }
});