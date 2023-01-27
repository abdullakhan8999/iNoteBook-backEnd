const mongoose = require("mongoose");

module.exports = mongoose.model(
  "note",
  new Schema({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      unique: true,
    },
    tag: {
      type: String,
      default: "General"
    },
    date: {
      type: Date,
      default: Date.now,
    },
  })
);
