const { Router } = require("express");
const controller = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = new Router();

router.post("/login", controller.login);
router.get("/me", authMiddleware, controller.me);

module.exports = router;
