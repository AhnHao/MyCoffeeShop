const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect('', {
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