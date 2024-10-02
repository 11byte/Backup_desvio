const http = require("http");
const mysql = require("mysql");

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
    callback(results.length > 0); // Valid or invalid credentials
  });
}

// Function to set location
function setLocation(source, destination, callback) {
  const query = "INSERT INTO location (src, destination) VALUES (?, ?)";

  db.query(query, [source, destination], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      callback(false); // Return false if there's an error
      return;
    }

    console.log("Insert result:", results); // Log the results to see if data is inserted
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
    let body = "";

    // Collect the data sent in the request
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    // When all data is received, parse it
    req.on("end", () => {
      try {
        const { action, username, password, source, destination } =
          JSON.parse(body);

        if (action === "validate") {
          // Validate the username and password using the database
          validateCredentials(username, password, (isValid) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: isValid }));
          });
        } else if (action === "setLocation") {
          // Set the location using the database
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
    // Handle other requests (e.g., 404 Not Found)
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
