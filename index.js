const express = require('express');
const cors = require('cors');
// mongodb 
const app = express();
const port = process.env.PORT || 5000;



// middle wire
app.use(cors());
app.use(express.json());






// ---------------------------------









// ---------------------------------





app.get('/', (req, res) => {
    res.send('server is runnig')
  })
  
  app.listen(port, () => {
    console.log(`server is running in port: ${port}`)
  })
