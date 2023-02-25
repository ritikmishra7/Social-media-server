const mongoose = require('mongoose');

module.exports = async () => {
    const uri = process.env.MONGODB_URI;
    try {
        mongoose.set("strictQuery", false);
        const connect = await mongoose.connect(uri, {
            useNewUrlParser: true, useUnifiedTopology: true
        });
        console.log('MongoDb connected: ', connect.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}