const express = require('express')
const app = express()
const corse = require('cors')
const port = process.env.PORT || 5000

app.use(corse())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})