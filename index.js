const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

// GET /api/download?q=<hubdrive_url>
app.get("/api/download", async (req, res) => {
  const fileUrl = req.query.q;
  if (!fileUrl) return res.status(400).json({ error: "Missing URL parameter" });

  try {
    const match = fileUrl.match(/file\/(\d+)/);
    if (!match) return res.status(400).json({ error: "Invalid HubDrive URL" });

    const fileId = match[1];

    const response = await axios.post(
      "https://hubdrive.space/ajax.php?ajax=direct-download",
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

    res.json(response.data); // full JSON including direct download link
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`HubDrive API running on port ${port}`));
