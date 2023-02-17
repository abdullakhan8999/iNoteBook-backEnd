const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const { body } = require("express-validator");
const {
  getAllNotes,
  addNote,
  updateNote,
  deleteNote,
} = require("../Controller/Controller.Notes");

//get all notes
module.exports = router.get("/fetchallnotes", fetchuser, getAllNotes);

//add notes for login users
module.exports = router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Email can not be blank!").exists(),
    body("description", "Description can not be blank!").exists(),
  ],
  addNote
);

//Update note
module.exports = router.put("/updatenote/:id", fetchuser, updateNote);

//delete note
module.exports = router.delete("/deletenote/:id", fetchuser, deleteNote);
