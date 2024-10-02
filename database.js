const http = require("http");
const mysql = require("mysql");

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: "localhost", // Replace with your MySQL host
  user: "root", // Replace with your MySQL user
  password: "mysql022004",
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

// Function to validate credentials
function validateCredentials(username, password, callback) {
  const query = "SELECT * FROM userdb WHERE username = ? AND password = ?";

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      callback(false); // Return false if there's an error
      return;
    }

    // If the result set has at least one row, credentials are valid
    if (results.length > 0) {
      callback(true); // Valid credentials
    } else {
      callback(false); // Invalid credentials
    }
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allows all origins; for security, specify your exact origin in production
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Handle preflight request
    res.writeHead(204); // No content
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/validate") {
    let body = "";

    // Collect the data sent in the request
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    // When all data is received, parse it
    req.on("end", () => {
      const { username, password } = JSON.parse(body);

      // Validate the username and password using the database
      validateCredentials(username, password, (isValid) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: isValid }));
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
