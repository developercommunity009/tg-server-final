// Core Modules
const path = require('path');
const http = require('http');

// External Modules
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { Server } = require("socket.io");

// Custom Modules
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const { initializeSocketIO } = require("./sockets");
const morganMiddleware = require("./logger/morgan.logger");

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const egginfoRoutes = require('./routes/eggInformationRoutes');
const medicationRoutes = require('./routes/medicationScheduleRoutes');
const embryoRoutes = require('./routes/embryoRoutes');
const bloodTestRoutes = require('./routes/bloodTestRoutes');
const ultrasoundTestRoutes = require('./routes/ultrasoundTestRoutes');

// Initialize Express App
const app = express();
const httpServer = http.createServer(app);

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Middleware for Parsing and Logging
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// CORS Configuration

const allowedOrigins =
  process.env.NODE_ENV === "development"
    ? ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]
    : ["https://your-production-domain.com"]; // Replace with actual production URL

// const allowedOrigins = process.env.NODE_ENV === 'production' 
// ? ['http://localhost:5173/'] 
// : ['http://localhost:5173/'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  max: 10000,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Custom Logger Middleware
app.use(morganMiddleware);

// Basic Route
app.get("/", (req, res) => {
  res.json("Embrotrust Server is Running");
});

// API Routes
app.use('/api/v1/', authRoutes);
app.use('/api/v1/doctor', doctorRoutes);
app.use('/api/v1/patient', patientRoutes);
app.use('/api/v1/egginfo', egginfoRoutes);
app.use('/api/v1/medication', medicationRoutes);
app.use('/api/v1/embryo', embryoRoutes);
app.use('/api/v1/blood', bloodTestRoutes);
app.use('/api/v1/ultrasound', ultrasoundTestRoutes);



// Handle Undefined Routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set("io", io); 

initializeSocketIO(io);

// Global Error Handler
app.use(globalErrorHandler);

// Export HTTP Server
module.exports = httpServer;





