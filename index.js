const express = require("express");
const app = express();
require('dotenv').config();
PORT = process.env.PORT;

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

const contactRoute = require("./routes/contactRoute")

app.get("/", (req, res) => {
    res.json("backend working good")
})

app.use("/contact", contactRoute)

app.listen(PORT, () => console.log(`Server running at ${PORT}`));