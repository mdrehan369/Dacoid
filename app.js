import express from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import { connect } from './lib/connectdb.js';
import { loginController } from './controllers/login.controller.js';
import { signupController } from './controllers/signup.controller.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { ticketModel } from './lib/tickets.schema.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import { customerModel } from './lib/customer.schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT;

// Connecting to database
connect(process.env.MONGO_URI);

app.set("views", "templates");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: "hjbfewrfnewfewuk",resave: false,
saveUninitialized: true}));
app.use(express.static(path.join(__dirname, 'public')));

function makeid(req, res, next) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 10) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    req.session.token = result;
    next();
}

app.get("/", (req, res) => {
    if(req.session.user) {
        if(req.session.user.email == 'mdrehan4650@gmail.com') {
            res.redirect("/admin");
        }else{
            res.redirect("/customer");
        }
    }else{
        res.redirect("/login");
    }
});

app.get("/admin", async (req, res) => {
    const users = await customerModel.countDocuments({});
    const tickets = await ticketModel.countDocuments({});
    res.render("admin_dashboard", {users, tickets});
})

app.get("/admin/tickets", async (req, res) => {
    const tickets = await ticketModel.find({});
    res.render("admin_tickets", {tickets});
})

app.get("/admin/users", async (req, res) => {
    const users = await customerModel.find({});
    res.render("admin_users", {users});
})

app.get("/customer", async (req, res) => {
    let tickets = await ticketModel.find({user: req.session.user._id});
    res.render("customer_dashboard", {tickets: tickets});
})

app.get("/login", (req, res) => {
    res.render("login", {msg:""});
});

app.get("/signup", (req, res) => {
    res.render("signup", {msg:""});
});

app.get("/addTicket", (req, res) => {
    res.render("addTicket");
});

app.get("/logout", (req, res) => {
    req.session.user = null;
    res.redirect("/login");
})

app.get("/admin/deleteUser/:email", async (req, res) => {
    const { email } = req.params;
    try{
        const user = await customerModel.findOne({email});
        await user.deleteOne();
        res.redirect("/admin/users");
    } catch(e) {
        console.log(e);
    }
})

app.post("/admin/search", async (req, res) => {
    const { email } = req.body;
    try {
        const users = await customerModel.find({"email": {$regex: `/^${email}/`, $options: 'i'}});
        // const users = await query.regex("email", `${email}/`);
        res.render("admin_users", {users});
    }catch(e) {
        console.log(e);
    }
})

app.get("/delete/:token", async (req, res) => {
    const { token } = req.params;
    try {
        const ticket = await ticketModel.findOne({token});
        await ticket.deleteOne();
        res.redirect("/customer");
    } catch (e) {
        console.log(e);
    }
})

app.get("/admin/delete/:token", async (req, res) => {
    const { token } = req.params;
    try {
        const ticket = await ticketModel.findOne({token});
        await ticket.deleteOne();
        res.redirect("/admin");
    } catch (e) {
        console.log(e);
    }
})


app.post("/addTicket", makeid, async (req, res) => {
    const { subject, description, type, location } = req.body;
    const user = req.session.user._id;
    const token = req.session.token;
    const d = new Date();
    const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    const time = d.toLocaleTimeString("it-IT");
    const status = 'Pending';

    const ticket = new ticketModel({
        subject,
        description,
        type,
        location,
        user,
        token,
        date,
        time,
        status
    });

    try {
        await ticket.save();
        res.redirect('/customer');
    } catch (e) {
        console.log(e);
    }

})

app.get("/update/:token", async (req, res) => {
    const { token } = req.params;
    const { subject, description, location } = await ticketModel.findOne({token});

    res.render("updateTicket", { subject, description, location, token });
})

app.get("/admin/done/:token", async (req, res) => {
    const { token } = req.params;
    try {
        await ticketModel.findOneAndUpdate({token}, {status: 'Done'});
        res.redirect("/admin/tickets");
    } catch(e) {
        console.log(e);
    }
})

app.get("/admin/close/:token", async (req, res) => {
    const { token } = req.params;
    try {
        await ticketModel.findOneAndUpdate({token}, {status: 'Closed'});
        res.redirect("/admin/tickets");
    } catch(e) {
        console.log(e);
    }
})

app.post("/update/:token", async (req, res) => {
    const { token } = req.params;
    const { subject, description, type, location } = req.body;

    try {
        await ticketModel.findOneAndUpdate({ token }, { subject, description, type, location });
        res.redirect("/customer");
    } catch(e) {
        console.log(e);
    }
})

app.post("/login", loginController);

app.post("/signup", signupController);


app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
})

