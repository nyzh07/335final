// from summer camp project 

// MongoDB
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../credentials/.env') }) 

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.5irqv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};

// Router stuff
const express = require("express");
const router = express.Router();

router.get("/selectByGPA", (req, res) => {
    res.render("admin");
});

router.post("/selectByGPA", async (req,res) => {
    try {
        await client.connect();
        const {gpa} = req.body;
        let filter = {gpa: {$gte: parseFloat(gpa)}};
        const applicants = await client
            .db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .find(filter).toArray();

        res.render("gfas", { applicants })
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

router.get("/removeAll", (req, res) => {
    res.render("remove");
});

router.post("/removeAll", async (req, res) => {
    try {
        await client.connect();

        const result = await client
            .db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .deleteMany({});
        let num = result.deletedCount;
        res.render("removedAll", { num });
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

module.exports = router;