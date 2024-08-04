const express = require('express');
const {connectToMongoDB} = require('./connect');
const path = require('path');
const cookieParser = require('cookie-parser');
const URL = require('./models/url');
const {restrictToLoggedinUserOnly, checkAuth} = require('./middlerwares/auth');
// routes 
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express();
PORT = 8000;

connectToMongoDB('mongodb://localhost:27017/short-url').then(() => console.log("MongoDB connected!!"));

app.set("view engine", "ejs");
app.set("views", path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use("/url", restrictToLoggedinUserOnly, urlRoute);
// app.use("/url", urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);

app.get('/url/:shortID', async (req, res) => {
    const shortId = req.params.shortID;
    const entry = await URL.findOneAndUpdate(
    {
        // idhar aur upar const shortID wali line shortId aayega shortID nhi cause db mai shortId hai shortID nhi.  
        shortId, 
        // jo naam db mai hai vahi
    }, 
    { 
        $push: {
            visitHistory: {
                timestamps: Date.now(),
            },
        },
     },
    );
    console.log(shortId)
    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server running in port: ${PORT}`));