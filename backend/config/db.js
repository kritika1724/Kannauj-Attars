const mongoose = require('mongoose')

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGO_URI is required')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(mongoUri, {
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
  })
}

module.exports = connectDB
