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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    try {
      let user = await User.findOne({ email: email });

      if (user) {
        return res
          .status(400)
          .json({ error: "Please try with another email!" });
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
      res.json({ message: "User Created!", token: token });
      next();
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        error: "Please enter unique value for email!",
      });
    }
  }
);

// Login user
module.exports = router.get(
  "/login",
  [
    body("email", "email can not be blank!").exists(),
    body("email", "Enter a valid Email!").isEmail(),
    body("password", "Password can not be blank!").exists(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });

      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to log in with correct credentials!" });
      }

      const passwordCompare = bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials!" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secretToken");
      res.json({ message: "User logged in!", token: token });
      next();
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        error: "Internal server error!",
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
