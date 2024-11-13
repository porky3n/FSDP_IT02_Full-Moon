// /middlewares/auth.js
module.exports = function ensureAdminAuthenticated(req, res, next) {
  if (req.session.isAdmin) {
    return next(); // Allow access to the route
  }
  res.status(403).send("Access denied. Admins only.");
};
