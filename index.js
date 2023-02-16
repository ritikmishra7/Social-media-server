const express = require('express');
const app = express();
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
const mainRouter = require('./routers/mainRouter');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
dotenv.config('./.env');


//middlewares
app.use(express.json());
app.use(morgan('common'));


app.use('/', mainRouter);

const PORT = process.env.PORT || 4001;

dbConnect();
app.listen(PORT, () => {
    console.log('Listening on port: ', PORT);
});

