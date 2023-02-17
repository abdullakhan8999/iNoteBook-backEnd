const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

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
  async (req, res, next) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success = false;
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email } = req.body;
    try {
      let user = await User.findOne({ email: email });

      if (user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Please try with another email!" });
      }

      // hashing password
      const salt = await bcrypt.genSalt(10);
      const scePassword = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: scePassword,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secretToken");
      success = true;
      res.json({ success, message: "User Created!", token: token });
      next();
    } catch (error) {
      console.error(error.message);
      success = false;
      res
        .status(500)
        .json({ success, error: "Please enter unique value for email!" });
    }
  }
);

// Login user
module.exports = router.post(
  "/login",
  [
    body("email", "email can not be blank!").exists(),
    body("email", "Enter a valid Email!").isEmail(),
    body("password", "Password can not be blank!").exists(),
  ],
  async (req, res, next) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success = false;
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });

      if (!user) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to log in with correct credentials!",
        });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials!",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      const token = jwt.sign(data, "secretToken");
      res.json({ success, message: "User logged in!", token: token });
      next();
    } catch (error) {
      success = false;
      console.error(error.message);
      res.status(500).json({
        success,
        error: "Internal server error!",
      });
    }
  }
);

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    try {
      // Hash the password
      let hashPassword = null;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        hashPassword = await bcrypt.hash(req.body.password, salt);
      }

      // Find the user
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send("Not Found");
      }

      // Check if the request is coming from the correct user
      if (user._id.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
      }

      // Update the user data
      let updatedUser = {};
      if (name) {
        updatedUser.name = name;
      }
      if (email) {
        if (
          await User.findOne({
            email: email,
          })
        ) {
          return res
            .status(400)
            .json({ error: "Please try with another email!" });
        }
        updatedUser.email = email;
      }
      if (hashPassword) {
        updatedUser.password = hashPassword;
      }

      user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updatedUser },
        { new: true }
      );

      // Sign the JWT and send the response
      let data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secretToken");
      res.json({ message: "User data updated!", token: token });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        error: "Please enter a unique value for email!",
      });
    }
  }
);

// get user details
module.exports = router.get("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findById(userId)
      .select("-password")
      .then((user) => {
        res.json({ user });
      })
      .catch((err) => {
        console.log(err.message);
        return res
          .status(400)
          .json({ error: "Please try to log in with correct credentials!" });
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Internal server error!",
    });
  }
});
