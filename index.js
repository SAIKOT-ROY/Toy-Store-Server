const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ndhwlcd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db("toysMarket").collection("items");
    // const figCollection = client.db('toysMarket').collection('toys')

    // const indexKeys = { name: 1}
    // const indexOptions = { toysName: "name"}

    // const result = await toysCollection.createIndex(indexKeys, indexOptions)

    app.get("/toysSearch/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await toysCollection
        .find({
          $or: [{ name: { $regex: searchText, $options: "i" } }],
        })
        .toArray();

      res.send(result);
    });

    // app.get('/items', async(req, res) => {
    //     const type = req.query.type == "ascending";
    //     const value = req.query.value;
    //     console.log(value)
    //     const sortObj = {};
    //     sortObj[value] = type ? 1 : -1;
    //     const products = await toysCollection.find({}).sort(sortObj).toArray();
    //     res.send(products)
    // })

    app.get("/items", async (req, res) => {
      const sort = req.query.sort;
      // console.log(sort);
      let query = {};
      const options = {
        sort: {"price": sort == 'asc' ? -1 : 1}
      }
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = toysCollection.find(query, options);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/items", async (req, res) => {
      const myToys = req.body;
      console.log(myToys);
      const result = await toysCollection.insertOne(myToys);
      res.send(result);
    });

    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await toysCollection.deleteOne(query);
      res.send({ result });
    });

    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.patch("/items/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateToys = req.body;
      console.log(updateToys);
      const updateDoc = {
        $set: {
          price: updateToys.price,
          quantity: updateToys.quantity,
          description: updateToys.description,
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // app.get('/toys', async(req, res) => {
    //     let query = {}
    //     if(req.query?.email){
    //         query = {email: req.query.email}
    //     }
    //     const cursor = figCollection.find(query);
    //     const result = await cursor.toArray();
    //     res.send(result)
    // })

    // only category api

    app.get("/anime", async (req, res) => {
      const query = { category: "Anime" };
      const cursor = toysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/dc", async (req, res) => {
      const query = { category: "DC" };
      const cursor = toysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/marvel", async (req, res) => {
      const query = { category: "Marvel" };
      const cursor = toysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy factory is making toys");
});

app.listen(port, () => {
  console.log(`Toy factory server is running on port: ${port}`);
});
