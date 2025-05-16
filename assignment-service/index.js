const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const assignmentRoutes = require('./routes/assignmentRoutes');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/api/assignments', assignmentRoutes);

const PORT = process.env.PORT || 3003;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`Assignment service running on port ${PORT}`);
        });
    })
    .catch(err => console.error(err));
