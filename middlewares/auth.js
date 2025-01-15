// // /middlewares/auth.js
const authMiddleware = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Set req.user from session
    req.user = req.session.user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const ensureAdminAuthenticated = (req, res, next) => {
  if (req.session.user && req.session.user.AccountType === "Admin") {
    return next();
  }
  res.status(403).send("Access denied. Admins only.");
};

module.exports = {
  authMiddleware,
  ensureAdminAuthenticated,
};
