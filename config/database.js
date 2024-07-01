const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          })
        console.log('Database connected')
    } 
    catch (err) {
        console.log('Fail to connect database', err)
        process.exit(1)
    }
}

module.exports = connectDB