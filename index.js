const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;



// middle wire
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://roomify-1529f.web.app",
      "https://roomify-1529f.firebaseapp.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());






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
    const adminCollection = client.db('roomDB').collection('admin');






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


    // getting rooms for featured rooms 
    app.get('/rooms', async (req, res) => {
      const cursor = roomCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // getting bookings for home page  
    app.get('/bookings', async (req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Get reviews for a specific room
    app.get('/review-room/:id', async (req, res) => {

      const roomId = req.params.id;
      const query = { id: roomId };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);

    });



    // id query for room details 

    app.get('/room/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await roomCollection.findOne(query);
      res.send(result);
    })


    // getting bookings for update 
    app.get('/getting-bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.findOne(query);
      res.send(result);
    })


    // email query for user booking 

    app.get('/my-bookings/:email', async (req, res) => {

      console.log(req.params.email)
      console.log('tok tok token ', req.cookies)
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    });


    // sending booking data to data base 
    app.post('/booking', async (req, res) => {
      const bookigDetails = req.body;
      console.log(bookigDetails);

      const result = await bookingCollection.insertOne(bookigDetails);
      res.send(result);
    })


    // jwt related api 
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })


      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
        .send({ success: true })
    })


    // update

    app.put('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: {
          date: req.body.date,
          review: req.body.review
        }
      };

      try {
        const result = await bookingCollection.updateOne(filter, update);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error updating booking.");
      }
    });


    // delte booking data 

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

    
    // admins 

    app.get('/admins/:email', async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await adminCollection.findOne(query);

      if (user && user.identity === 'admin') {
        // Send back user data if they are an admin
        res.send({ ...user, message: 'the user is an admin' });
      } else {
        // Send 404 if user is not an admin
        res.status(404).send({ message: 'admin not found or user is not an admin' });
      }
    });





    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

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
