const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dashboardRoutes = require('./routes/dashboardRoutes');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3005;

// Connect to MongoDB (if needed for local storage or caching)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard-service', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`Dashboard service running on port ${PORT}`);
        });
    })
    .catch(err => console.error(err));
