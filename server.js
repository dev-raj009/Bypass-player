import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ✅ Health check
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ✅ Main Proxy API
app.get("/api/proxy", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      error: "Missing ?url parameter"
    });
  }

  try {
    console.log("Fetching:", videoUrl);

    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": videoUrl
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch video",
        status: response.status
      });
    }

    const contentType = response.headers.get("content-type");

    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // 🔥 stream directly
    response.body.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

// ✅ Smart Video Info API (optional)
app.get("/api/info", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: "Missing URL" });
  }

  try {
    let type = "unknown";

    if (videoUrl.includes(".m3u8")) {
      type = "hls";
    } else if (videoUrl.includes(".mpd")) {
      type = "dash";
    } else if (videoUrl.includes(".mp4")) {
      type = "mp4";
    }

    res.json({
      url: videoUrl,
      type: type,
      playable: true
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
