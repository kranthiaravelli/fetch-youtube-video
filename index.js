const { urlencoded } = require("body-parser");
const { error } = require("console");
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/api/video", async (req, res) => {
    const { videoUrl } = req.body;

    if(!videoUrl) {
        return res.status(400).json({
            success: false,
            message: "Please enter a Video URL."
        });
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(videoUrl);
    } catch {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid URL."
        })
    }

    const allowedHost = [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be"
    ];

    if(
        parsedUrl.protocol !== "https:" ||
        !allowedHost.includes(parsedUrl.hostname)
    ) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid HTTPS YouTube URL."
        });
    }

    try {
        const endpoint = new URL(
            "https://www.youtube.com/oembed"
        );

        endpoint.searchParams.set("url", parsedUrl.href);
        endpoint.searchParams.set("format", "json");

        const response = await fetch(endpoint);

        if (!response.ok) {
            return res.status(400).json({
                success: false,
                message: "Video Information is unavailable."
            });
        }

        const video = await response.json();

        console.log("Thumbnail URL:", video.thumbnail_url);

        res.json({
            success: true,
            title: video.title,
            thumbnail: video.thumbnail_url,
            author: video.author_name,
            originalUrl: parsedUrl.href
        });
    } catch (error) {
        console.error("Metadata error: ", error);

        res.status(502).json({
            success: false,
            message: "Could not retrieve video Information. Try again."
        });
    };    
});

app.get("/download/sample", (req, res) => {
    const filePath = path.join(
        __dirname,
        "public",
        "sample.mp4"
    );

    res.download(filePath, "my-video.mp4", (error) => {
        if (error && !res.headersSent) {
            console.error("Download failed: ", error);
            res.status(500).send("Unable to download this file.");
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
