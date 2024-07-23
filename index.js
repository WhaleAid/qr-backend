// index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('express-jwt');
const socketHandler = require('./sockets');
const { initSocket } = require('./sockets/socketEvents');

const aiRoutes = require('./routes/ai.routes');
const scanRoutes = require('./routes/scan.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const campaignRoutes = require('./routes/campaign.routes');
const generationRoutes = require('./routes/generation.routes');
const imageRoutes = require('./routes/image.routes');
const webhookRoutes = require('./routes/webhook.routes');

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
});

try {
    mongoose.connect(mongoDB);
    console.log('MongoDB Client Connected');
} catch (error) {
    console.log('MongoDB Client Error', error);
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'none',
    }
}));

const origins = process.env.ALLOWED_ORIGINS;

app.use(deserializeUser)
app.use(cors({
    origin: (origin, callback) => {
        if (origins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.set('trust proxy', true);
aiRoutes(app);
scanRoutes(app);
authRoutes(app);
userRoutes(app);
campaignRoutes(app);
generationRoutes(app);
imageRoutes(app);
webhookRoutes(app);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to turnadon API' });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: origins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});
socketHandler(io);
initSocket(io);

module.exports = app;