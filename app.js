if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

const DB_URL = process.env.ATLASDB_URL;


main().then(()=>{
    console.log("Connected to database");
})
.catch(err => {
    console.log(err);
})
async function main(){
    await mongoose.connect(DB_URL);
}

const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600
});

store.on("error", ()=>{
    console.log("Session store error", err);
})


const sessionOptions =  {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+ 1000 * 60 * 60 * 24 * 3 ,
        maxAge : 1000 * 60 * 60 * 24 * 3, 
        httpOnly: true,
    },
}
app.listen(8080 , ()=>{
    console.log("server is running on port 8080")
})
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/privacy" , (req, res)=>{
    res.render("./listings/privacy.ejs");
})

app.get("/tc", (req, res)=>{
    res.render("./listings/terms&condition.ejs")
})

app.all("*", (req, res, next)=>{
    next(new ExpressError("Page Not Found!", 404));
});


app.use((err, req, res, next)=>{
    let {status= 502 , message="Something went wrong!"} = err +"500";
    res.render("./listings/error.ejs" ,{err});
})