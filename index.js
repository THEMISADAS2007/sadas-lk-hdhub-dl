const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

app.get("/api/taazabull", async (req, res) => {
  const fileUrl = req.query.q;
  if (!fileUrl) return res.status(400).json({ error: "Missing URL parameter" });

  try {
    const urlObj = new URL(fileUrl);
    const fileId = urlObj.searchParams.get("id");
    if (!fileId) return res.status(400).json({ error: "Invalid Taazabull24 URL" });

    // Update this endpoint based on actual DevTools observation
    const endpoint = "https://taazabull24.com/ajax.php?ajax=download-file"; 

    const response = await axios.post(
      endpoint,
      new URLSearchParams({ id: fileId }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": fileUrl
        }
      }
    );

    const data = response.data;

    if (data && data.code === "200" && data.data?.gd) {
      res.json({ gd: data.data.gd });
    } else {
      res.status(400).json({ error: "Failed to get direct download URL", details: data });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Taazabull24 download API running at http://localhost:${port}`);
});
