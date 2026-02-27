import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { errorHandler } from "./middleware/errorHandler.js";
import config from './config/index.js';
const app = express();

const allowedOrigins = [
    'http://localhost',
    'http://backend:5000',  // For local development on your machine
    'http://localhost:8080',
    'http://localhost:3000',
    'https://www.dowellsmartlabelling.uxlivinglab.org',
    // Add other potential development origins if needed
    'http://127.0.0.1:8080',
    'http://69.169.108.183:3000',
    'http://69.169.108.183:5000'
];

const corsOptions = {
  // Use a function to check the origin dynamically
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true); 
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // You can return an error if the origin is not allowed
      callback(new Error('Not allowed by CORS')); 
    }
  },
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies and authentication headers (if needed)
};

// Apply CORS middleware
app.use(cors(corsOptions)); // <--- APPLY CORS BEFORE ROUTES

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());
// Error handler
app.use(errorHandler);
app.use('/api/v1/', routes);

app.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'API services are running fine'
    });
})

const onListening = () => {
    console.log(`Listening on port ${config.PORT}`);
};

app.listen(config.PORT, onListening);