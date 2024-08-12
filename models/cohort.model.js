const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cohortSchema = new Schema({
    cohortname: { type: String, required: true },
    cohortid: { type: String, required: true },
    cohorttags: { type: [String], required: true },  // Array of strings for tags
    cohortpic: { type: String, required: true }  // Path to the uploaded cohort picture
});

const Cohort = mongoose.model('Cohort', cohortSchema);
module.exports = Cohort;
