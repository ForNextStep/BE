require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const port = 3000;
const api = require("./routes/auth.router");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(logger("dev"));

app.get("/", (req, res, next) => {
    try {
        return res.json({status: true, message: "Ok", data:null});
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    res.status(500).json({ err: err.message });
});

app.use((req, res, next) => {
    res.status(404).json({ err: `Cannot ${req.method} ${req.url}` });
});

app.listen(port, "0.0.0.0", () => {
    console.info(`running on port ${port}`);
});

module.exports = app;
