const express = require('express');
const authRoutes = require('./src/routes/auth');
const eventRoutes = require('./src/routes/events');
const { authenticateToken } = require('./src/middleware/auth');
const { initializeReminders } = require('./src/services/reminderService');

const app = express();
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/events', authenticateToken, eventRoutes);


initializeReminders();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


module.exports = { app, server };