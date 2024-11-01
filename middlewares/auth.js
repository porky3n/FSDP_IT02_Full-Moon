// /middlewares/auth.js
module.exports = (req, res, next) => {
    // Check if the session indicates an admin user is logged in
    if (req.session && req.session.isAdmin) {
      return next(); // Proceed if the user is an admin
    } else {
      // Redirect to the admin login page if not authenticated
      return res.status(401).redirect('/adminSignIn.html');
    }
  };
  