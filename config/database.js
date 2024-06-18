const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://hao:Anhhao08MG@cluster0.ud84vso.mongodb.net/coffeeShop?retryWrites=true&w=majority&appName=Cluster0', {
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