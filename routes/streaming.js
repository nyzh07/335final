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
    title_name = data.title_results[0].name;

    // use Watchman title id to get movie details 
    const info_url = `https://api.watchmode.com/v1/title/${title_id}/sources/?apiKey=${process.env.API_KEY}`
    response = await fetch(info_url);
    data = await response.json();

    // list of objects containing source name and web url to watch on that source
    let sources = [];
    let source_names = [];
    data.forEach(source => {
        source_name = source.name;
        source_names.push(source_name);
        source_url = source.web_url;
        sources.push({ source_name, source_url });
    })
    // add result to db
    const result = { title_name, source_names };
    try {
        await client.connect();
        await client
            .db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .insertOne(result);
        res.render("streamingSourceResult", { title_name, sources });
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

router.get("/previousResults", async (req, res) => {
    try {
        await client.connect();
        const cursor = client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .find({});
        const results = await cursor.toArray();
        let plot_list = [];
        let source_list = [];
        results.forEach(result => {
            if (result.plot != undefined) {
                plot_list.push(result);
            } else {
                result.source_names  = result.source_names.join(", ");
                source_list.push(result);
            }
        })
        res.render("previousResults", { plot_list, source_list });
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

router.get("/clearResults", (req, res) => {
    res.render("clearResults");
})

router.post("/clearResults", async (req, res) => {
    try {
        await client.connect();
        await client
            .db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .deleteMany({});
        res.render("clearResultsConfirmation");
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
})

module.exports = router;