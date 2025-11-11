const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

const uri =
  "mongodb+srv://booksDB:Lq3y3xiJIALEYJhG@cluster0.ltnfqwl.mongodb.net/?appName=Cluster0";
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

    const booksDB = client.db('BooksDB')
    const booksCollection = booksDB.collection('books')


    app.get('/latest-books', async(req, res)=>{
        const cursor = booksCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })
    
    app.get('/books/:id', async(req, res)=>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id)}
        const result = await booksCollection.findOne(filter)
        res.send(result)
    })

  


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
