require('dotenv').config();             
const http        = require('http');
const express     = require('express');
const cors        = require('cors');

const config      = require('./config');             
const { sequelize } = require('./db/database');    
const createRoutes = require('./routes');           
const { errorHandler } = require('./middlewares/errorHandler');
const auth        = require('./middlewares/auth');

// HTTP Express server
const app    = express();
const server = http.createServer(app);

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global authentication middleware
app.use(auth);

// --- ROUTES ---
app.use('/api', createRoutes());

// --- ERROR HANDLER ---
app.use(errorHandler);


// --- DATABASE & SERVER STARTUP ---
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    server.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (err) {
    console.error('Database connection error', err);
    process.exit(1);
  }
})();