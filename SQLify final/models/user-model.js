const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/SQLifyDB");

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password:String,
    files:[
        {type:mongoose.Schema.Types.ObjectId, ref:'file'}
    ],
})

module.exports= mongoose.model('user',userSchema);