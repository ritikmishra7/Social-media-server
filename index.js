const express = require('express');
const app = express();
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
const mainRouter = require('./routers/mainRouter');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;


dotenv.config('./.env');

// Cloudinary Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//middlewares
app.use(express.json({ limit: '50mb' }));
app.use(morgan('common'));
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));


app.use('/', mainRouter);

const PORT = process.env.PORT || 4001;


dbConnect();
app.listen(PORT, () => {
    console.log('Listening on port: ', PORT);
});

