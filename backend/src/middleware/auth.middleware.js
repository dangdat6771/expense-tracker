const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[0] === "Bearer"
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "expense_tracker_dev_secret";
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Access token is invalid" });
  }
}

module.exports = {
  authenticateToken,
};
