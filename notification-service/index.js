const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const notificationRoutes = require('./routes/notificationRoutes');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 3004;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`Notification service running on port ${PORT}`);
        });
    })
    .catch(err => console.error(err));
