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

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  function setCategory(category, callback) {
    const quer0 = "truncate categories";
    db.query(quer0, (error, results) => {
      if (error) {
        console.error("Error truncating categories table:", error);
        return;
      }
      console.log("Categories table truncated successfully.");
    });

    const query = "INSERT INTO categories (category) VALUES (?)";

    db.query(query, [category], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        callback(false); // Return false if there's an error
        return;
      }

      console.log("Insert result:", results); // Log the results to see if data is inserted
    });
  }

  function validateCredentials(username, password, callback) {
    var currentToken;
    const query0 =
      "SELECT token FROM userdb WHERE username = ? AND password = ?";
    const query1 = "truncate tokens";
    db.query(query1, (error, results) => {
      if (error) {
        console.error("Error truncating categories table:", error);
        return;
      }
      console.log("Categories table truncated successfully.");
    });
    db.query(query0, [username, password], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        callback(false); // Return false if there's an error
        return;
      }

      // If the result set has at least one row, credentials are valid
      if (results.length > 0) {
        currentToken = results[0].token;
        tokenization(currentToken);
      } else {
        callback(false); // Invalid credentials
      }
    });

    const query =
      "SELECT username,password FROM userdb WHERE username = ? AND password = ?";

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

  function registeration(username, password, email, phone, token, callback) {
    const query =
      "INSERT INTO userdb (username,password,email,phone,token) VALUES (?, ?,?,?,?)";

    db.query(
      query,
      [username, password, email, phone, token],
      (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          callback(false); // Return false if there's an error
          return;
        }

        console.log("Insert result:", results); // Log the results to see if data is inserted
        callback(true);
      }
    );
  }

  function tokenization(token) {
    const query = "INSERT INTO tokens (token) VALUES (?)";

    db.query(query, [token], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        // callback(false);
        return;
      }

      console.log("Insert result:", results); // Log the results to see if data is inserted
      // callback(true);
    });
  }

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

    const query = "SELECT * FROM location";

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error executing query:", err); // Log the error
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Database query error",
            details: err.message,
          })
        );
        return;
      }

      // Check if any results were found
      if (results.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Location not found" }));
        return;
      }

      // Send the result back to the client
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results[0])); // Assuming you want to send the first result
    });
  } else if (req.method === "POST" && req.url.startsWith("/category")) {
    let body = "";

    // Collect the data sent in the request
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log(body);
      const { action, catChoice } = JSON.parse(body);
      setCategory(catChoice);
    });
  } else if (req.method === "POST" && req.url.startsWith("/insertLocation")) {
    let body = "";

    // Collect the data sent in the request
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log(body);
      const { action, source, destination } = JSON.parse(body);
      setLocation(source, destination, (success) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success }));
      });
    });
  } else if (req.method === "POST" && req.url.startsWith("/validate")) {
    let body = "";

    // Collect the data sent in the request
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log(body);
      const { username, password } = JSON.parse(body);
      validateCredentials(username, password, (isValid) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: isValid }));
      });
    });
  } else if (req.method === "GET" && req.url.startsWith("/fetchCat")) {
    const query = "SELECT * FROM categories";

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error executing query:", err); // Log the error
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Database query error",
            details: err.message,
          })
        );
        return;
      }

      // Check if any results were found
      if (results.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Category not found" }));
        return;
      }

      // Send the result back to the client
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results[0]));
    });
  } else if (req.method === "POST" && req.url.startsWith("/register")) {
    let body = "";

    // Collect the data sent in the request
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log(body);
      const { action, username, password, email, phone, token } =
        JSON.parse(body);
      registeration(username, password, email, phone, token, (success) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success }));
      });
    });
  } else if (req.method === "POST" && req.url.startsWith("/token")) {
    let body = "";

    // Collect the data sent in the request
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log(body);
      const { action, token } = JSON.parse(body);
      tokenization(token, (success) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success }));
      });
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
