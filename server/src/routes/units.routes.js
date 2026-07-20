const router = require("express").Router();
const unitController = require("../controllers/unit.controller");

router.get("/", unitController.getAll);
router.post("/create", unitController.create);
router.put("/update/:id", unitController.update);
router.delete("/delete/:id", unitController.delete);

module.exports = router;
