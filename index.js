const connectToMongo = require("./db");
const express = require("express");
const App = express();
const port = 8082;
connectToMongo();
App.use(express.json());

App.get("/", (req, res) => {
  res.send("<h1>Hello Abdulla!</h1>");
});

App.use("/api/auth/", require("./Routes/auth_router"));
App.use("/api/note/", require("./Routes/notes_router"));

App.listen(port, () => {
  //localhost:8080/
  console.log(`Example app listening on port http://localhost:${port}/`);
});
