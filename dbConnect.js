const mongoose = require('mongoose');

module.exports = async () => {
    const uri = 'mongodb+srv://ritikmishra7:fEReXDDNsbJZm2HD@cluster0.0hfgegi.mongodb.net/?retryWrites=true&w=majority';
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