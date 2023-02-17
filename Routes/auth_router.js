const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const { body } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const {
  createUser,
  loginUser,
  updateUser,
  getUser,
} = require("../Controller/Controller.Users");

// create user
module.exports = router.post(
  "/createuser",
  [
    body("name", "name can not be blank!").exists(),
    body("name", "Enter a valid Name!").isLength({ min: 3 }),
    body("email", "email can not be blank!").exists(),
    body("email", "Enter a valid Email!").isEmail(),
    body("password", "Password can not be blank!").exists(),
    body("password", "Password must be At least five characters!").isLength({
      min: 3,
    }),
  ],
  createUser
);

// Login user
module.exports = router.post(
  "/login",
  [
    body("email", "email can not be blank!").exists(),
    body("email", "Enter a valid Email!").isEmail(),
    body("password", "Password can not be blank!").exists(),
  ],
  loginUser
);

//Update user
module.exports = router.post(
  "/update-user/:id",
  [
    body("name", "Name can not be blank!").exists(),
    body("name", "Enter a valid Name!").isLength({ min: 3 }),
    body("email", "Email can not be blank!").exists(),
    body("email", "Enter a valid Email!").isEmail(),
    body("password", "Password can not be blank!").exists(),
    body("password", "Password must be at least three characters!").isLength({
      min: 3,
    }),
  ],
  fetchuser,
  updateUser
);

// get user details
module.exports = router.get("/getuser", fetchuser, getUser);
