const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oxzfl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const productCollection = client.db("trendyCommerce").collection("products");
    const usersCollection = client.db("trendyCommerce").collection("users");
    const orderCollection = client.db("trendyCommerce").collection("orders");
    const reviewCollection = client.db("trendyCommerce").collection("reviews");


    // get all products
    app.get("/products", async (req, res) => {
        const products = await productCollection.find({}).toArray();
        res.json(products);
    })
    // get single product
    app.get("/product/:id", async (req, res) => {
        const id = req.params.id;
        const product = await productCollection.findOne({ _id: ObjectId(id) });
        res.json(product);
    })

    // order single product
    app.post("/order", async (req, res) => {
        const product = await orderCollection.insertOne(req.body);
        res.json(product);
    })

    //get my order
    app.get('/myOrders/:email', async (req, res) => {
        const email = req.params.email;
        const order = await orderCollection.find({ email: email }).toArray();
        res.json(order);
    })

    //remove order
    app.delete('/removeOrder/:id', async (req, res) => {
        const id = req.params.id;
        const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
        res.json(result);
    })
    // save user
    app.post('/user', async (req, res) => {
        const user = await usersCollection.insertOne(req.body)
        res.send(user)
    })

    // add an admin
    app.put('/addAdmin/:email', async (req, res) => {
        const email = req.params.email;
        const query = await usersCollection.findOne({ email: email });
        if (query) {
            const updatedDoc = {
                $set: {
                    role: 'admin',
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc);
            res.json(result);
        }
        else {
            res.status(403).json({ message: 'You do not have access.' })
        }
    })

    // get an admin
    app.get('/saveUser/:email', async (req, res) => {
        const email = req.params.email;
        const result = await usersCollection.findOne({ email: email });
        let isAdmin = false;
        if (result?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })

    // post review
    app.post("/review", async (req, res) => {
        const review = await reviewCollection.insertOne(req.body);
        res.json(review);
    })
    // get review
    app.get("/review", async (req, res) => {
        const review = await reviewCollection.find({}).toArray();
        res.json(review);
    })


    // get all orders
    app.get("/allOrders", async (req, res) => {
        const orders = await orderCollection.find({}).toArray();
        res.json(orders);
    })

    //  update status
    app.put("/allOrders/:id", async (req, res) => {
        const id = req.params.id;
        const updateStatus = req.body;
        const filter = { _id: ObjectId(id) };
        const updateDoc = {
            $set: {
                status: updateStatus.status,
            },
        };
        const result = await orderCollection.updateOne(
            filter,
            updateDoc,
        );
        res.json(result);
    });
    //add new item
    app.post('/addItem', async (req, res) => {
        const newItem = await productCollection.insertOne(req.body);
        res.json(newItem);
    })

    //delete a product 
    app.delete('/removeItem/:id', async (req, res) => {
        const id = req.params.id;
        const result = await productCollection.deleteOne({ _id: ObjectId(id) });
        res.json(result);
    })

    // client.close();
});


app.get("/", (req, res) => {
    res.send("server successfully run");
});

app.listen(port, () => {
    console.log("listening on port", port);
});