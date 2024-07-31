const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
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
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const { deserializeUser } = require('./middlewares/deserializeUser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const mongoDB = process.env.MONGODB_URI;

const sessionStore = MongoStore.create({
    mongoUrl: mongoDB,
    autoRemove: 'native'
});

mongoose.connect(mongoDB)
    .then(() => console.log('MongoDB Client Connected'))
    .catch(error => console.log('MongoDB Client Error', error));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none'
    }
}));

const origins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin);

app.use(deserializeUser);
app.use(cors({
    origin: origins,
    credentials: true
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

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: origins,
        methods: ["GET", "POST"],
        credentials: true,
        path: '/socket.io'
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

socketHandler(io);
initSocket(io);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;