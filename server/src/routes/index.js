const products = require("./product.routes");
const divisas = require("./divisas.routes");
  
module.exports = (app) => {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use("/api/products", products);
  app.use("/api/divisas", divisas);
};


// const { Router } = require("express");
// const { db } = require("../firebase");
// const router = Router();

// router.post("/id/:id", async (req, res) => {
//   const doc = await db.collection("recipes").doc(req.params.id).get();
//   const { ingredients, cost_of_production, profit, retail_price, name } =
//     doc.data();
//   const list = [];
//   let item_price = 0;
//   for (let index = 0; index < ingredients.length; index++) {
//     const id = ingredients[index];
//     console.log(id);
//     let doc = await db.collection("ingredients").doc(id).get();
//     const { price, ...restOfDoc } = doc.data();
//     doc = await db.collection("products").doc(price).get();
//     const cost = doc.data().price / doc.data().quantity;
//     item_price += cost;
//     list.push({
//       name: restOfDoc.name,
//       quantity: restOfDoc.quantity,
//       price: cost,
//     });
//   }

//   res.json({
//     recipes: {
//       id: doc.id,
//       name,
//       ingredients: list,
//       cost_of_production: item_price,
//     },
//   });
// });

// router.post("/new_products", async (req, res) => {
//   const { list_products } = req.body;
//   console.log(list_products);
//   let colRef = db.collection("products");
//   var batch = db.batch();
//   list_products.forEach((product) => {
//     var id = db.collection(`products`).doc().id;
//     let ref = colRef.doc(`${id}`);
//     const { coin, name, price, quantity } = product;
//     batch.set(ref, {
//       coin,
//       name,
//       price,
//       quantity,
//     });
//   });
//   await batch.commit();

//   res.json();
// });

// router.post("/new", async (req, res) => {
//   const { name, list_ingredients, cost_of_production, profit, retail_price } =
//     req.body;

//   // const querySnapshot = await db.collection('recipes').get()

//   // const recipes = querySnapshot.docs.map(doc => ({
//   //     id: doc.id,
//   //     ...doc.data()
//   // }))

//   let ingredients = [];
//   // console.log(recipes)
//   //   ingredients = await list_ingredients.map(async (ingredient) => {
//   //     const { name, quantity, price } = ingredient;
//   //     console.log(name);
//   //     const newItem = await db.collection("ingredients").add({
//   //       name,
//   //       quantity,
//   //       price,
//   //     });
//   //     return newItem.id
//   //     //     ingredients.push(newItem.id)
//   //     // });
//   //   });
//   let colRef = db.collection("ingredients");
//   var batch = db.batch();

//   list_ingredients.forEach((ingredient) => {
//     console.log(ingredient);
//     var id = db.collection(`ingredients`).doc().id;
//     ingredients.push(id);
//     let ref = colRef.doc(`${id}`);
//     const { name, quantity, price } = ingredient;
//     batch.set(ref, {
//       name,
//       quantity,
//       price,
//     });
//   });

//   await batch.commit();

//   console.log(ingredients);
//   // console.log("Last");

//   const recipes = await db.collection("recipes").add({
//     name,
//     ingredients,
//     cost_of_production,
//     profit,
//     retail_price,
//   });

//   res.json(0);
// });

// module.exports = router;
