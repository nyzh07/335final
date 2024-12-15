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

router.get("/plotSearch", (req, res) => {
    res.render("plotSearch");
})

router.post("/plotSearch", async (req, res) => {
    const { title } = req.body;
    let title_id, plot, title_name;
    // get Watchman title id
    const id_url = `https://api.watchmode.com/v1/search/?apiKey=${process.env.API_KEY}&search_field=name&search_value=${title}`;
    fetch(id_url, {method: 'get'})
        .then(res => res.json())
        .then(data => {
            title_id = data.title_results[0]?.id;
        })
        .catch(error => console.error('Fetch error', error));

    // use Watchman title id to get movie details 
    const info_url = `https://api.watchmode.com/v1/title/${title_id}/details/?apiKey=${process.env.API_KEY}`
    fetch(info_url, { method: 'get' })
        .then(res => res.json())
        .then(data => {
            title_name = data.title;
            plot = data.plot_overview;
        })
        .catch(error => console.error("Fetch error", error));

    const result = { title_name, plot }
    // add result to db
    try {
        await client.connect();
        await client
            .db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .insertOne(result);
            
        res.render("plotResult", { result });
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

router.get("streamingSourceSearch", (req, res) => {
    res.render("streamingSourceSearch");
})

router.post("streamingSourceSearch", async (req, res) => {
    const { title } = req.body;
    let title_id, title_name, source_json;
    // get Watchman title id
    const id_url = `https://api.watchmode.com/v1/search/?apiKey=${process.env.API_KEY}&search_field=name&search_value=${title}`;
    fetch(id_url, {method: 'get'})
        .then(res => res.json())
        .then(data => {
            title_id = data.title_results[0]?.id;
        })
        .catch(error => console.error('Fetch error', error));

    // use Watchman title id to get movie details 
    const info_url = `https://api.watchmode.com/v1/title/${title_id}/details/?apiKey=${process.env.API_KEY}`
    fetch(info_url, { method: 'get' })
        .then(res => res.json())
        .then(data => {
            title_name = data.title;
            source_json = data.sources;
        })
        .catch(error => console.error("Fetch error", error));

    // list of objects containing source name and web url to watch on that source
    let sources = [];
    source_json.forEach(source => {
        source_name = source.name;
        source_url = source.web_url;
        sources.push({ source_name, source_url });
    })
    // add result to db
    const result = { title_name, sources };
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