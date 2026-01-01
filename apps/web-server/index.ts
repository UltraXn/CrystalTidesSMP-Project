import dotenv from 'dotenv'; // Force deploy
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
