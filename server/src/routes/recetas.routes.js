const router = require("express").Router();
const recipeController = require("../controllers/recipe.controller");

router.get("/", recipeController.getAll);
router.get("/:id", recipeController.getById);
router.post("/create", recipeController.create);
router.put("/update/:id", recipeController.update);
router.delete("/delete/:id", recipeController.delete);

module.exports = router;
