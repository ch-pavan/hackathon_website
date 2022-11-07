var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new Schema({
    username: String,
    password: String,
    user_type: String
});
userSchema.plugin(passportLocalMongoose);

mongoose.model('User', userSchema)
module.exports = mongoose.model('User');