const Notes = require("../Models/Notes");
const { validationResult } = require("express-validator");

exports.getAllNotes = async (req, res, next) => {
  const notes = await Notes.find({ user: req.user.id });
  try {
    res.json(notes);
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Internal server error!",
    });
  }
};

exports.addNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, description, tag } = req.body;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const note = new Notes({
      title,
      description,
      tag,
      user: req.user.id,
    });
    const savedNote = await note.save();

    res.json(savedNote);
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Internal server error!",
    });
  }
};

exports.updateNote = async (req, res, next) => {
  const { title, description, tag } = req.body;
  try {
    // Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res
        .status(401)
        .send(
          "Unauthorized Access: Your credentials do not grant you access to this resource. Please login with valid credentials and try again."
        );
    }
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send(`Not Found ${id}`);
    }

    if (note.user.toString() !== req.user.id) {
      return res
        .status(401)
        .send(
          "Unauthorized Access: Your credentials do not grant you access to this resource. Please login with valid credentials and try again."
        );
    }

    await Notes.findByIdAndDelete(req.params.id)
      .then((result) => {
        res.json({ title: result.title, Success: "Note has been deleted" });
      })
      .catch((err) => {
        res.status(200).send(err.message);
      });
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};
