const mongoose = require("mongoose");

// Define the CodeBlock schema
const CodeBlockSchema = new mongoose.Schema({
    InitialTemplate: String,
    CurrentState: String,  // store the current code in real-time
    Solution: String
});


// Create the CodeBlock model
const CodeBlock = mongoose.model('CodeBlock', CodeBlockSchema);
module.exports = CodeBlock;