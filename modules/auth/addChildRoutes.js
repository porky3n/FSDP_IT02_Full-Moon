const express = require("express");
const router = express.Router();
const childController = require("./addChildController");

router.get("/", childController.getChildren);
router.post("/", childController.addChild);
router.put("/:id", childController.updateChild);
router.delete("/:id", childController.deleteChild);

module.exports = router;
