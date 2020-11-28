if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = [
    {
        email: 'nguyen0096@gmail.com',
        id: 'nguyen',
        password: bcrypt.hash('123', 10),
    }
];

async function initUsers() {
    users.push({
        id: Date.now().toString(),
        name: "Nguyen",
        email: "test@test.com",
        password: await bcrypt.hash('123', 10),
    });
}

initUsers();

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.get('/',checkAuthenticated, (req,res) => {
    res.render('index.ejs', { name: req.user.name })    
})

app.get('/login',checknotAuthenticated, (req,res) =>{
    res.render('login.ejs')
})

app.get('/register', checknotAuthenticated, (req, res) => {
    res.render('register.ejs')
})



app.post('/login', checknotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register',checknotAuthenticated, async (req,res) =>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    }catch {
        res.redirect('/register')
    }
})

app.delete('/logout',checknotAuthenticated, (req,res) =>{
      req.logOut() 
      res.redirect('/login') 
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }else{
        res.redirect('/login')
    }
}

function checknotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    } else {
        next()
    }
}

// io server
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
    socket.on('message', (msg) => {
        console.log('message: ' + msg);
        io.emit('broadcast message', { value: msg + '' });
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});