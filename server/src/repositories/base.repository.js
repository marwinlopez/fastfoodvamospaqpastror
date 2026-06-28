const { db } = require("../firebase");

class BaseRepository {
  constructor(collectionName) {
    this.collection = db.collection(collectionName);
  }

  async getAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async create(data) {
    const docId = data.id || data.productId || data.productoId;
    const docRef = docId
      ? this.collection.doc(docId.toString())
      : this.collection.doc();
    await docRef.set(data);
    return { id: docRef.id, ...data };
  }

  async createBatch(items) {
    const batch = db.batch();
    const createdItems = [];

    items.forEach((item) => {
      const docId = item.id || item.productId || item.productoId;
      const docRef = docId
        ? this.collection.doc(docId.toString())
        : this.collection.doc();
      batch.set(docRef, item);
      createdItems.push({ id: docRef.id, ...item });
    });

    await batch.commit();
    return createdItems;
  }

  async update(id, data) {
    await this.collection.doc(id).set(data, { merge: true });
    return { id, ...data };
  }

  async delete(id) {
    await this.collection.doc(id).delete();
    return id;
  }
}

module.exports = BaseRepository;
