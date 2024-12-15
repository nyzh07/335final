// from summer camp server
const express = require("express");
const app = express();
const path = require("path");

let url = 'https://api.watchmode.com/v1/autocomplete-search/?apiKey=NlKLCbkH2zQ4gaDANv2oCC8TX5IPtwXcyDbmKfa0&search_value=Breaking%20bad&search_type=1';

fetch(url, { method: 'Get' })
    .then((res) => res.json())
    .then((json) => {
        console.log(json);
    });

const streamingRoutes = require("./routes/streaming");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", streamingRoutes);

app.get("/", (req, res) => {
    res.render("index");
});

let portNumber;

if (process.argv.length == 3) {
    portNumber = process.argv[2];
} else {
    console.log(`Usage: ${process.argv[1]}'portNumber`);
    process.exit(1);
} 

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

process.stdin.setEncoding("utf-8");
const prompt = "Stop to shutdown the server: "
process.stdout.write(prompt);
process.stdin.on('readable', () => {
    const dataInput = process.stdin.read();
    if (dataInput != null) {
        const command = dataInput.trim();
        if (command === "stop") {
            console.log("Shutting down the server");
            process.exit(0);
        } else {
            console.log(`Invalid command: ${command}`);
        }
    }
    process.stdout.write(prompt);
    process.stdin.resume();
});