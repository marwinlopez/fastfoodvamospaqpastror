const { Router } = require("express");
const controller = require("../controllers/upload.controller");
const router = new Router();

router.post("/", controller.uploadImage);

module.exports = router;
