const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate a JWT for testing. Change userId if needed.
const userId = 1;
const SECRET_KEY = process.env.SECRET_KEY || process.env.JWT_SECRET || 'SECRET_KEY';
const token = jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '7d' });
console.log(token);

// Print a note so it's clear this is a test token.
console.error('NOTE: This token is for testing only. It uses the SECRET_KEY from environment (or a default).');
