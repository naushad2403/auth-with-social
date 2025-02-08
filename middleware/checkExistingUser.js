const User = require("../models/User");
const checkExisitngUser = async (req, res, next) => {

    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

  next()
};

module.exports = checkExisitngUser;
