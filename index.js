const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('express-jwt');

const openaiRoutes = require('./routes/openai.routes');
const scanRoutes = require('./routes/scan.routes');
const authRoutes = require('./routes/auth.routes');

const mongoose = require('mongoose');
const { deserializeUser } = require('./middlewares/deserializeUser');
const MongoStore = require('connect-mongo');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const mongoDB = process.env.MONGODB_URI;
const sessionStore = MongoStore.create({
    mongoUrl: mongoDB,
    autoRemove: 'native'
})
try {
    mongoose.connect(mongoDB)
} catch (error) {
    console.log('MongoDB Client Error', error)
}

console.log('MongoDB Client Connected')
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.env === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(deserializeUser)
app.use(cors({
    credentials: true
}));
app.set('trust proxy', true);
openaiRoutes(app);
scanRoutes(app);
authRoutes(app);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to turnadon API' });
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});