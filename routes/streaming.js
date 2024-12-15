// MongoDB
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../credentials/.env') }) 

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.5irqv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};

// Router stuff
const express = require("express");
const { info } = require("console");
const router = express.Router();

router.get("/plotSearch", (req, res) => {
    res.render("plotSearch");
})

router.post("/plotSearch", async (req, res) => {
    const { title } = req.body;
    let title_id, plot, title_name;
    // get Watchman title id
    const id_url = `https://api.watchmode.com/v1/search/?apiKey=${process.env.API_KEY}&search_field=name&search_value=${title}`;
    let response = await fetch(id_url);
    let data = await response.json();
    title_id = data.title_results[0].id;

    // use Watchman title id to get movie details 
    const info_url = `https://api.watchmode.com/v1/title/${title_id}/details/?apiKey=${process.env.API_KEY}`
    response = await fetch(info_url);
    data = await response.json();
    title_name = data.title;
    plot = data.plot_overview;

    const result = { title_name, plot }
    // add result to db
    try {
        await client.connect();
        await client
            .db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .insertOne(result);
            
        res.render("plotResult", { title_name, plot });
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

router.get("/streamingSourceSearch", (req, res) => {
    res.render("streamingSourceSearch");
})

router.post("/streamingSourceSearch", async (req, res) => {
    const { title } = req.body;
    let title_id, title_name;
    // get Watchman title id
    const id_url = `https://api.watchmode.com/v1/search/?apiKey=${process.env.API_KEY}&search_field=name&search_value=${title}`;
    let response = await fetch(id_url);
    let data = await response.json();
    title_id = data.title_results[0].id;
    title_name = data.name;

    // use Watchman title id to get movie details 
    const info_url = `https://api.watchmode.com/v1/title/${title_id}/sources/?apiKey=${process.env.API_KEY}`
    console.log(info_url);
    response = await fetch(info_url);
    data = await response.json();
    console.log(data);

    // list of objects containing source name and web url to watch on that source
    // let sources = [];
    // source_json.forEach(source => {
    //     source_name = source.name;
    //     source_url = source.web_url;
    //     sources.push({ source_name, source_url });
    // })
    // add result to db
    const result = { title_name };
    try {
        await client.connect();
        await client
            .db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .insertOne(result);
            
        res.render("streamingSourceResult", { result });
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

router.get("/previousResults", async (req, res) => {
    try {
        await client.connect();

        res.render("previousResults", { results });
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

module.exports = router;