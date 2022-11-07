var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');
var medicineSchema = new Schema({
    medicine: {type: String, unique: true, required: true},
    vote: Number
});
medicineSchema.plugin(passportLocalMongoose);

mongoose.model('medicine', medicineSchema)
module.exports = mongoose.model('medicine');