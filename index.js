const express = require('express')
const app = express()
const corse = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(corse())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8wqrrau.mongodb.net/?retryWrites=true&w=majority`;

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
        const listingCollection = client.db('PetAdoption').collection('petListion')
        const usersCollection = client.db('PetAdoption').collection('users')
        const adoptCollection = client.db('PetAdoption').collection('adoption')
        const addpetCollection = client.db('PetAdoption').collection('addpet')

        // Get  all petlisting
        app.get('/petlisting', async (req, res) => {
            const result = await listingCollection.find().toArray()
            res.send(result)
        })

        // Get single petlisting
        app.get('/petlisting/:id', async (req, res) => {
            const id = req.params.id
            const result = await listingCollection.findOne({ _id: new ObjectId(id) })
            res.send(result)
        })

        // Save or modify user email, status in DB
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const query = { email: email }
            const options = { upsert: true }
            const isExist = await usersCollection.findOne(query)
            console.log('User found?----->', isExist)
            if (isExist) {
                if (user?.status === 'Requested') {
                    const result = await usersCollection.updateOne(
                        query,
                        {
                            $set: user,
                        },
                        options
                    )
                    return res.send(result)
                } else {
                    return res.send(isExist)
                }
            }
            const result = await usersCollection.updateOne(
                query,
                {
                    $set: { ...user, timestamp: Date.now() },
                },
                options
            )
            res.send(result)
        })
        // adoption
        app.post('/adoption', async (req, res) => {
            const adopt = req.body;
            const result = await adoptCollection.insertOne(adopt)
            res.send(result)
        })
        // addpet 
        app.post('/addpet', async (req, res) => {
            const addpet = req.body;
            const result = await addpetCollection.insertOne(addpet)
            res.send(result)
        })
        // get my added pet by query
        app.get('/addpet', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await addpetCollection.find(query).toArray()
            res.send(result)
        })
        // single  pet delete
        app.delete('/addpet/:id', async (req, res) => {
            const filter = req.params.id
            const finddelete = await  addpetCollection.deleteOne({ _id: new ObjectId(filter) })
            res.send(finddelete)
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


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})