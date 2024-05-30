const connectToMongo = require('./db');
var cors= require('cors')
connectToMongo();

const express = require('express')
const app = express()
const port = 8000
app.use(cors())
app.use(express.json())

//Available Routes

app.use('/api/auth', require('./routes/auth'))
app.use('/posts', require('./routes/posts'));


app.listen(port, () => {
  console.log(` backend  listening on port ${port}`)
})