const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    originalName: { type: String, required: true },   // Original file name
    filename: { type: String, required: true },       // Name of the file on the server (random name)
    filepath: { type: String, required: true },       // Path where the file is stored on the server
    size: { type: Number, required: true },           // File size in bytes
    mimetype: { type: String, required: true },       // File MIME type
    uploadDate: { type: Date, default: Date.now }
})

module.exports= mongoose.model('file',fileSchema);