/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing (CORS) for all routes
 */

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://verdakra.vercel.app',
  'https://verdakra-git-main-charvipalems-projects.vercel.app',
  'https://verdakra-charvipalems-projects.vercel.app',
  'https://verdakra-bknd.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.some(domain => 
      origin === domain || 
      origin.endsWith('.' + domain.replace(/^https?:\/\//, ''))
    )) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked: ${origin} is not in the allowed origins list`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Auth-Token'
  ],
  exposedHeaders: [
    'Content-Range', 
    'X-Content-Range',
    'Content-Disposition',
    'X-Request-Id'
  ],
  maxAge: 86400, // Cache preflight request for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

/**
 * Middleware to handle CORS preflight requests
 */
const handlePreflight = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
};

/**
 * Middleware to set security headers
 */
const securityHeaders = (req, res, next) => {
  // Set security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
};

module.exports = {
  corsOptions,
  handlePreflight,
  securityHeaders
};
