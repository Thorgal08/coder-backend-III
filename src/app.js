import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config.js';
import morganMiddleware from './config/logger.config.js';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';

const app = express();
const PORT = process.env.PORT||8080;
// MongoDB connection - comentado temporalmente para testing sin BD
// const connection = mongoose.connect(`mongodb://localhost:27017/db_example?directConnection=true`)

// CORS middleware
app.use(cors());

// Morgan logger middleware
app.use(morganMiddleware);

app.use(express.json());
app.use(cookieParser());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);
app.use('/api/mocks',mocksRouter);

app.get('/', (req, res) => {
    const style = `
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            p { color: #555; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    `;
    const content = `
        <h1>Welcome to the AdoptMe API</h1>
        <p>Use the endpoints to manage users, pets, adoptions, and sessions.</p>
        <p><strong>API Documentation:</strong> <a href="/api-docs">Swagger UI</a></p>
    `;
    res.send(`${style}${content}`);
});

app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
});
