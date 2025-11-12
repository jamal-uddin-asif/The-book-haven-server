const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ltnfqwl.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Book Haven running fine");
});

async function run() {
  try {
    await client.connect();

    const booksDB = client.db("BooksDB");
    const booksCollection = booksDB.collection("books");
    const commentsCollections = booksDB.collection('comments')

    app.get("/latest-books", async (req, res) => {
      const cursor = booksCollection.find().sort({ create_at: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/all-books", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.userEmail = email;
      }
      const cursor = booksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/all-books-sort", async (req, res) => {
      const sort = req.query.sort;
      if (sort === "high-low") {
        const cursor = booksCollection.find().sort({ rating: -1 });
        const result = await cursor.toArray();
        res.send(result);
      }
      if (sort === "low-high") {
        const cursor = booksCollection.find().sort({ rating: 1 });
        const result = await cursor.toArray();
        res.send(result);
      }
    });

    app.get("/bookDetails/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(filter);
      res.send(result);
    });

    app.post("/books", async (req, res) => {
      const newBook = req.body;
      // console.log(newBook)
      const result = await booksCollection.insertOne(newBook);
      res.send(result);
    });

    app.delete("/delete-book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await booksCollection.deleteOne(filter);
      res.send(result);
    });

    // comment 
    app.post('/comments',async(req, res)=>{
      const comment = req.body;
      const result = await commentsCollections.insertOne(comment)
      res.send(result)
    })

    app.get('/comments/:id', async(req, res)=>{
      const id = req.params.id
      const filter = {book:id}
      const cursor = commentsCollections.find(filter)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.patch(`/update-Book/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const book = req.body;

      const update = {
        $set: {
          title: book.title,
          author: book.author,
          genre: book.genre,
          rating: book.rating,
          coverImage: book.coverImage,
          summary: book.summary,
          userEmail: book.userEmail,
          userName: book.userName
        },
      };
      const options = {}
      const result = await booksCollection.updateOne(query, update, options)
      res.send(result)
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Book haven listening on port ${port}`);
});
