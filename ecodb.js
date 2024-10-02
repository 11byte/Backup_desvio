const http = require("http");
const mysql = require("mysql");
const multer = require("multer");
const { Readable } = require("stream");

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: "localhost", // Replace with your MySQL host
  user: "root", // Replace with your MySQL user
  password: "mysql022004", // Your MySQL password
  database: "desvio", // Your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database");
});

// Configure multer for file storage
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Function to handle image upload
function uploadImage(imageBuffer, callback) {
  const query = "INSERT INTO images (image) VALUES (?)";

  db.query(query, [imageBuffer], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      callback(false);
      return;
    }

    console.log("Image inserted with ID:", results.insertId);
    callback(true);
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Handle preflight request
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST") {
    // Handle file uploads
    const uploadMiddleware = upload.single("file");

    uploadMiddleware(req, res, (err) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ success: false, error: "File upload error" })
        );
      }

      if (!req.file) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ success: false, error: "No file uploaded" })
        );
      }

      // Get the image buffer from the uploaded file
      const imageBuffer = req.file.buffer;

      // Upload the image to the database
      uploadImage(imageBuffer, (success) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success }));
      });
    });
  } else {
    // Handle other requests (e.g., 404 Not Found)
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
