const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const port = 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hcopb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect((err) => {
    console.log(err);
    const userCollection = client.db("user-info").collection("user");


    // Add data to database 
    app.post('/adduser', (req, res) => {
        const userInfo = req.body;
        userCollection.insertOne(userInfo)
            .then((result) => {
                res.send(result.insertedCount > 0);
                console.log("User Info add to database")
            });
    });


    //load User Info 
    app.get("/users", (req, res) => {
        userCollection.find({}).toArray((err, user) => {
            res.send(user)
        });
    });


    // Delete user
    app.delete('/user/:id', (req, res) => {
        const id = ObjectID(req.params.id);

        userCollection.findOneAndDelete({ _id: id })
            .then(result => {
                res.json({ success: !!result.value })
            })
            .then(error => {
                console.log(error);
            })
    });

    // Update user
    app.patch('/update/:id', (req, res) => {
        userCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { firstName: req.body.firstName, lastName: req.body.lastName, userName: req.body.userName, email: req.body.email, showPassword: req.body.showPassword }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    //single user load
    app.get('/user/:id', (req, res) => {
        userCollection.find({ _id: ObjectID(req.params.id) })
            .toArray((err, users) => {
                res.send(users)
            })
    })

});



app.get('/', (req, res) => {
    res.send('Hello Database connected successfully!!!')
})
app.listen(process.env.PORT || port)