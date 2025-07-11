
# Verdakra – Online Judge Platform

**Verdakra** is a full-stack Online Judge (OJ) system that allows users to solve programming problems, run and submit code, and track their progress. The platform is designed with a developer-friendly interface, secure backend, and efficient code execution and evaluation pipeline.

## Features

- User Authentication: Register and log in with secure JWT-based sessions.
- Problem Solving Interface: Browse problems with descriptions, constraints, and test cases.
- Code Execution: Run code against public test cases before submission.
- Automated Judging: Submissions are evaluated automatically against hidden test cases.
- Submission History: Track past submissions, verdicts, and timestamps.
- Leaderboard: Displays top performers based on submission accuracy and speed.
- Monaco Editor: Integrated code editor with syntax highlighting and multi-language support.
- Responsive UI: Built for both desktop and mobile devices.

## Tech Stack

### Backend

- Node.js, Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Security: Helmet, XSS protection, CORS handling, rate limiting
- Logging: Custom debug-level logging

### Frontend

- React.js, Vite
- Tailwind CSS for styling
- Axios for API communication
- React Router for client-side routing
- Monaco Editor for code input

## Project Structure

```
Verdakra/
│
├── Backend/
│   ├── controllers/       # Business logic
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route definitions
│   ├── middleware/        # Auth, error handling, security
│   ├── code-execution/    # Code execution and result evaluation logic
│   ├── utils/             # Helper utilities
│   ├── server.js          # Entry point
│   └── .env               # Environment config
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI elements
│   │   ├── pages/         # Pages like Dashboard, ProblemSet, Submissions
│   │   └── context/       # React context providers
│   ├── public/            # Static files
│   └── .env               # Vite config
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or hosted)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `Backend/` folder:

   ```
   # Server
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/verdakra

   # Auth
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=30d
   JWT_COOKIE_EXPIRES=30

   # CORS
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

   # Optional: Gemini AI Key
   GEMINI_API_KEY=your_api_key

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=15*60*1000
   RATE_LIMIT_MAX=100

   # Logging
   LOG_LEVEL=debug

   # Security Headers
   HELMET_ENABLED=true
   XSS_ENABLED=true
   NOSNIFF_ENABLED=true
   HIDE_POWERED_BY=true

   # Debug Mode
   DEBUG=app:*,error:*
   ```

4. Start the server:
   ```bash
   npm start
        or
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend/` folder:

   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Using the Platform

- Open http://localhost:5173
- Register or log in
- Navigate to problem sets
- Solve and submit problems
- Track progress in dashboard and submissions tab

## Contributing

Interested in contributing? You're welcome to submit pull requests or open issues to discuss features, bug fixes, or improvements.

## Notes

- This project is under active development.
- Currently not licensed – proprietary unless explicitly open-sourced.

## Acknowledgements

- Inspired by platforms like LeetCode, Codeforces, and HackerRank
- Code editor powered by Monaco Editor
- Built using open-source tools and frameworks
