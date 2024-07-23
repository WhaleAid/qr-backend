const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { deserializeUser } = require('./middlewares/deserializeUser');
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const mongoDB = process.env.MONGODB_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const sessionStore = MongoStore.create({
    mongoUrl: mongoDB,
    autoRemove: 'native',
});

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
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }
}));

const origins = process.env.ALLOWED_ORIGINS.split(',');

app.use(deserializeUser);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origins.includes(origin)) {
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
    res.json({ message: 'Welcome to the API' });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on ${process.env.BACKEND_URL}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: origins,
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

socketHandler(io);
initSocket(io);

module.exports = app;