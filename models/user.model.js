const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema
const userSchema = new Schema({
    "email": { type: 'String' },
    "password": { type: 'String'},
    "username": { type: 'String'},
    "contact": { type:'String' }
});

var User = mongoose.model('User', userSchema);
module.exports = User