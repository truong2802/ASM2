require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 8000;

//Database
mongoose.connect('mongodb+srv://truongpmngcs210343:01225513228aA@cluster0.k8jrkyz.mongodb.net/',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("MongoDB Connected"));


//middleware

app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(session({
    secret :'my secret key',
    saveUninitialized :true,
    resave:false
}));

app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('uploads'));

//Template engine

app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//     res.send("Hello Boobalan A R");
// });

//router prefix

app.use("", require('./routes/routes'))

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});