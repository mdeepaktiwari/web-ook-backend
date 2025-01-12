const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("WEBHOOKS API"));
router.use("/auth", require("./auth"));
router.use("/webhook", require("./webhook"));

module.exports = router;
