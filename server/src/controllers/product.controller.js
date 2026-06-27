const { db } = require("../firebase");
const controller = require("../controllers/divisas.controller");

exports.getAll = async (req, res) => {
  const events = db.collection("products");
  const querySnapshot = await events.get();

  const tempDoc = querySnapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() };
  });

  const exchangeRef = db.collection("divisas").doc("DolarToday");
  const exchange = await exchangeRef.get();
  if (exchange.exists) {
    const { quote } = exchange.data();
    console.log(quote)
    tempDoc.map((p) => {
      p.price = parseFloat(quote) * p.price;
      return p;
    });
  }

  res.json({ status: true, data: tempDoc });
};

exports.update = (req, res) => {
  const { body, params } = req;

  console.log(params);

  db.collection("products")
    .doc(params.id)
    .update(body)
    .then(() => {
      res.status(202).json({ message: "Registro actualizado" });
    })
    .catch(() => {
      res.status(400).json({ message: "Error no se actualizo el registro" });
    });
};

exports.create = async (req, res) => {
  const { products } = req.body;
  console.log(products);

  let colRef = db.collection("products");
  var batch = db.batch();
  products.forEach((product) => {
    var id = db.collection(`products`).doc().id;
    let ref = colRef.doc(`${id}`);
    batch.set(ref, product);
  });
  await batch.commit();

  res.json();
};

exports.search = async (req, res) => {
  const { query } = req.body;
  const productsRef = db.collection("products");

  const querySnapshot = await productsRef.get();

  const tempDoc = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    if (
      data.name.toUpperCase().includes(query.toUpperCase()) ||
      data.coin.toUpperCase().includes(query.toUpperCase())
    )
      return { id: doc.id, ...data };
  });

  res.json({ data: tempDoc.filter((i) => i != null) });
};
