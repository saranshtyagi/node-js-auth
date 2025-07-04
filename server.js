require("dotenv").config();
const express = require('express'); 
const connectToDB = require("./database/db");
const authRoutes = require('./routes/auth-routes.js');
const homeRoutes = require('./routes/home-routes.js'); 
const adminRoutes = require('./routes/admin-routes.js');

const app = express(); 

app.use(express.json()); 

const PORT = process.env.PORT || 3000; 

connectToDB();
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});