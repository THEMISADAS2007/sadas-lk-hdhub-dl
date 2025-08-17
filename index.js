const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

// Universal download API
app.get("/api/download", async (req, res) => {
  const fileUrl = req.query.q;
  if (!fileUrl) return res.status(400).json({ error: "Missing URL parameter" });

  try {
    let endpoint = "";
    let fileId = "";
    let referer = fileUrl;

    if (fileUrl.includes("hubdrive.space")) {
      const match = fileUrl.match(/file\/(\d+)/);
      if (!match) return res.status(400).json({ error: "Invalid HubDrive URL" });
      fileId = match[1];
      endpoint = "https://hubdrive.space/ajax.php?ajax=direct-download";

    } else if (fileUrl.includes("taazabull24.com")) {
      const urlObj = new URL(fileUrl);
      fileId = urlObj.searchParams.get("id");
      if (!fileId) return res.status(400).json({ error: "Invalid Taazabull24 URL" });
      endpoint = "https://taazabull24.com/ajax.php?ajax=direct-download";

    } else {
      return res.status(400).json({ error: "Unsupported URL" });
    }

    console.log("Requesting endpoint:", endpoint);
    console.log("File ID:", fileId);

    const response = await axios.post(
      endpoint,
      new URLSearchParams({ id: fileId }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": referer
        },
        validateStatus: false // Prevent axios from throwing on 404
      }
    );

    if (response.status === 404) {
      return res.status(404).json({ error: "Endpoint not found (404)", endpoint, fileId });
    }

    const data = response.data;

    if (data && data.code === "200" && data.data?.gd) {
      res.json({ gd: data.data.gd });
    } else {
      res.status(400).json({ 
        error: "Failed to get direct download URL", 
        status: response.status,
        details: data,
        endpoint,
        fileId
      });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Universal download API running at http://localhost:${port}`);
});
