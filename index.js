const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://artVerse:OunjSlGFsZdTyHGo@cluster0.jj9ycrc.mongodb.net/art_db?retryWrites=true&w=majority&tls=true";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("art_db");
    const artsCollection = db.collection("arts");

    // arts api's
    app.post("/arts", async (req, res) => {
      const newArt = req.body;
      const result = await artsCollection.insertOne(newArt);
      res.send(result);
    });

    app.post("/arts", async (req, res) => {
      const newArt = {
        ...req.body,
        createdAt: new Date(),
        likes: 0,
        favorites: [],
      };
      const result = await artsCollection.insertOne(newArt);
      res.send(result);
    });

    app.get("/arts/all", async (req, res) => {
      const cursor = await artsCollection
        .find()
        .sort({ _id: -1 })
        .limit(20)
        .toArray();
      res.send(cursor);
    });

    app.get("/arts", async (req, res) => {
      const cursor = artsCollection.find().sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/arts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artsCollection.findOne(query);
      res.send(result);
    });

    app.post("/arts/:id/like", async (req, res) => {
      const id = req.params.id;
      const result = await artsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { likes: 1 } }
      );
      res.send(result);
    });

    app.post("/arts/:id/favorite", async (req, res) => {
      const id = req.params.id;
      const userEmail = req.body.email;
      const result = await artsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $addToSet: { favorites: userEmail } }
      );
      res.send(result);
    });

    app.post("/arts/:id/unfavorite", async (req, res) => {
      const id = req.params.id;
      const userEmail = req.body.email;
      const result = await artsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { favorites: userEmail } }
      );
      res.send(result);
    });

    app.get("/users/:email/favorites", async (req, res) => {
      const { email } = req.params;
      const favorites = await artsCollection
        .find({ favorites: email })
        .toArray();
      res.send(favorites);
    });

    app.post("/arts/:id/like", async (req, res) => {
      const id = req.params.id;
      const result = await artsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { likes: 1 } }
      );
      res.send(result);
    });

    app.post("/arts/:id/unlike", async (req, res) => {
      const { email } = req.body;
      const id = req.params.id;

      const result = await artsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { likedBy: email } }
      );

      res.send(result);
    });

    app.delete("/arts/:id", async (req, res) => {
      const id = req.params.id;
      const result = await artsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.put("/arts/:id", async (req, res) => {
      const id = req.params.id;
      const updatedArt = req.body;
      const result = await artsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedArt }
      );
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ArtVerse is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
