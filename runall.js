const http = require("http");
const mysql = require("mysql");

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql022004",
  database: "desvio",
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
      callback(false);
      return;
    }
    callback(results.length > 0);
  });
}

// Function to set location
function setLocation(source, destination, callback) {
  const query = "INSERT INTO location (src, destination) VALUES (?, ?)";
  db.query(query, [source, destination], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      callback(false);
      return;
    }
    console.log("Insert result:", results);
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
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/location")) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get("id");

    if (!id) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No ID provided" }));
      return;
    }

    const query = "SELECT * FROM location WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Database query error",
            details: err.message,
          })
        );
        return;
      }

      if (results.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Location not found" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results[0])); // Send the first result
    });
  } else if (req.method === "POST") {
    let body = "";

    // Collect the data sent in the request
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { action, username, password, source, destination } =
          JSON.parse(body);

        if (action === "validate") {
          validateCredentials(username, password, (isValid) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: isValid }));
          });
        } else if (action === "setLocation") {
          setLocation(source, destination, (success) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success }));
          });
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Invalid action" }));
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
