const express = require("express");
const authMiddleware = require("../middleware/auth");
const router = express.Router();
const webhookController = require("../controller/webhookController");

router.post("/", authMiddleware, webhookController.saveWebhook);
router.get("/", authMiddleware, webhookController.userWebhooks);
router.patch("/", authMiddleware, webhookController.updateStatus);
router.get("/event", webhookController.eventHandler);

module.exports = router;
