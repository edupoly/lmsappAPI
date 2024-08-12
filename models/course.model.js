const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseVideoSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }
});

const courseSchema = new Schema({
    coursetopic: { type: String, required: true },
    coursename: { type: String, required: true },
    coursetrainer: { type: String, required: true },
    courseduration: { type: String, required: true },
    courseprice: { type: Number, required: true },
    coursetype: { type: String, required: true },
    courseprereq: { type: [String], required: true },
    coursesamplevideo: { type: String, required: true },
    courselogourl: { type: String, required: true },
    coursedescription: { type: String, required: true },
    courseroughtopics: { type: [String], required: true },
    coursevideos: { type: [courseVideoSchema], required: true }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
