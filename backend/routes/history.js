const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const { rows } = await pool.query (
            'SELECT id, score, created_at, result_json FROM results WHERE session_id = $1 ORDER BY created_at DESC',
            [sessionId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching history: ', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 