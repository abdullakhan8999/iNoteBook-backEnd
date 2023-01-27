const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretToken = "secretToken";

module.exports = (req, res, next) => {
  // get user from token
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using valid token!" });
    next();
  }
  try {
    const data = jwt.verify(token, secretToken);
    req.user = data.user;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).send({ error: "Please authenticate using valid token!" });
    next(error);
  }
};
