const mongoose = require("mongoose");
const mongooseURI = "mongodb://localhost:27017/";

const connectToMongo = () => {
  mongoose.connect(mongooseURI, () => {
    console.log("Server is up and running");
  });
};

module.exports = connectToMongo;
