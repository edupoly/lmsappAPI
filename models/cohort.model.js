const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cohortSchema = new Schema({
    cohortname: { type: String, required: true },
    cohortid: { type: String, required: true },
    cohorttags: { type: [String], required: true },
    cohortpic: { type: String, required: true },
    cohortdate: { type: Date, required: true } // Use Date type for date fields
});

const Cohort = mongoose.model('Cohort', cohortSchema);
module.exports = Cohort;

