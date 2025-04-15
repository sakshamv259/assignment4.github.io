const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/database');
const routes = require('./routes');
const path = require('path');

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Set up middleware
// Configure CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://sakshamv259.github.io', 'https://assignment1-github-io.vercel.app']
        : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'volunteer-connect-secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Debug middleware for session tracking
app.use((req, res, next) => {
    console.log(`[Session Debug] ${req.method} ${req.path} | SessionID: ${req.sessionID} | User: ${req.session?.user ? req.session.user.username : 'none'}`);
    next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use(routes);

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 