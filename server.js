const connectToMongo = require("./db");
const express = require("express");
const App = express();
const dotenv = require("dotenv").config();
const serverConfig = require("./config/server.configs");
connectToMongo();
const cors = require("cors");
App.use(cors());
App.use(express.json());

App.get("/", (req, res) => {
  res.send("<h1>MaNaNoteBook!</h1>");
});

App.use("/api/auth/", require("./Routes/auth_router"));
App.use("/api/note/", require("./Routes/notes_router"));

App.listen(serverConfig.PORT ? serverConfig.PORT : 8000, () => {
  console.log(
    `Server is running on http://localhost:${
      serverConfig.PORT ? serverConfig.PORT : 8000
    }`
  );
});
