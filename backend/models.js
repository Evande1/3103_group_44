const mongoose = require("mongoose");

const ClickSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    jobId: {type: String, required: true},
}, { collection: 'mailing_list'});

const Click = mongoose.model("Click", ClickSchema);

module.exports = Click;