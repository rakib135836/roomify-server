const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;



// middle wire
app.use(cors());
app.use(express.json());






// ---------------------------------





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qtepxet.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)


    // collection for available rooms 

    const roomCollection = client.db('roomDB').collection('room');

    // collection for booking details
    const bookingCollection = client.db('roomDB').collection('booking');


    //  getting rooms from db

    app.get('/room', async (req, res) => {
      const { minPrice, maxPrice } = req.query;
      let query = {};

      if (minPrice && maxPrice) {
        query = { price_per_night: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) } };
      }

      const cursor = roomCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });


    // id query for room details 

    app.get('/room/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await roomCollection.findOne(query);
      res.send(result);
    })


    // email query for user booking 

    app.get('/my-bookings/:email', async (req, res) => {

      console.log(req.params.email)
      const result = await bookingCollection.find({ email: req.params.email }).toArray();
      res.send(result)
    });


    // sending booking data to data base 
    app.post('/booking', async (req, res) => {
      const bookigDetails = req.body;
      console.log(bookigDetails);
      
      const result = await bookingCollection.insertOne(bookigDetails);
      res.send(result);
    })


    // delte booking data 

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })





    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






// ---------------------------------





app.get('/', (req, res) => {
  res.send('server is runnig')
})

app.listen(port, () => {
  console.log(`server is running in port: ${port}`)
})
