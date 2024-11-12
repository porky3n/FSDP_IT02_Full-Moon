const express = require("express");
const router = express.Router();
const childController = require("./addChildController");

// Ensure all routes have proper middleware
router.use((req, res, next) => {
  if (!req.session || !req.session.accountId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  next();
});

// Define routes
router.get("/", childController.getChildren);
router.get("/:id", childController.getChild);
router.post("/", childController.addChild);
router.put("/:id", childController.updateChild);
router.delete("/:id", childController.deleteChild);

module.exports = router;
