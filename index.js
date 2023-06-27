import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config()

const MONGO_URL = process.env.MONGO_URI;
const PORT = 4000;

const app = express();

app.use(express.json());

app.use(cors());

const createConnection = async () => {

    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Connection to mongodb server is established")
    return client;
}

const client = await createConnection();


app.get("/", (req, res) => {
    res.send("<h1>Server is working</h1>");
})


// creating a route for booking the room
app.post("/create_rooms", async (req, res) => {
    const data = req.body;
    const result = await client
        .db("booking")
        .collection("create_rooms")
        .insertOne(data)

    if (result.acknowledged) {
        res.status(200).send({ msg: "Rooms created successfully" })
    } else {
        res.status(400).send({ msg: "Something went wrong!" })
    }

})

// route for booking rooms
app.post("/book_room", async (req, res) => {
    const data = req.body;
    const checkBooking = await client
        .db("booking")
        .collection("book_room")
        .findOne({ date: data["date"] });

    // if (checkBooking.date) {
    //     res.status(400).send({ msg: "Already booked for the day" })
    // } else {
    const result = await client
        .db("booking")
        .collection("book_room")
        .insertOne(data)

    if (result.acknowledged) {
        res.status(200).send({ msg: "Room booked Successfully" })
    } else {
        res.status(400).send({ msg: "Something went wrong! Room not booked" })
    }
    // }

})

app.get("/booked_rooms", async (req, res) => {
    const data = await client
        .db("booking")
        .collection("book_room")
        .find({ status: "booked" })
        .toArray();

    res.status(200).send(data);
})

app.listen(PORT, () => {
    console.log(`server is started at ${PORT}`);
})
