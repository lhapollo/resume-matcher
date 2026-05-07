//setup: load express and environment vars, inits express and cors, parses JSON requests
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const matchRouter = require('./routes/match');
const coverLetterRouter = require('./routes/coverLetter');
const historyRouter = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({origin: process.env.CORS_ORIGIN || 'http://localhost:5173'}));
app.use(express.json());
app.use('/api/match', matchRouter);
app.use('/api/cover-letter', coverLetterRouter);
app.use('/api/history', historyRouter);

//verifies server health
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Resume Matcher API is running'});
});

//starts listening
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});