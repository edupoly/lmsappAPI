const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cohortSchema = new Schema({
    cohortname: { type: String, required: true },
    cohortid: { type: String, required: true },
    cohorttags: { type: [String], required: true },  // Array of strings for tags
    cohortpic: { type: String, required: true },  // Path to the uploaded cohort picture
    cohortdate: { type: String, required: true }  // Cohort date as a string
});

const Cohort = mongoose.model('Cohort', cohortSchema);
module.exports = Cohort;

