const express = require("express");
const app = express();
const path = require("path");

const streamingRoutes = require("./routes/streaming");

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use("/", streamingRoutes);

app.get("/", (req, res) => {
    res.render("index");
});

const portNumber = process.env.PORT || 5001;

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