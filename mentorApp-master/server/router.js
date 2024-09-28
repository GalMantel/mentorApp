const express = require("express")
const router = express.Router()
const CodeBlock = require("./schema.js")

router.get('/code-block/:blockId', async (req, res) => {
    const codeBlock = await CodeBlock.findById(req.params.blockId);
    res.status(200).send(codeBlock)
}) 

// Define the /save-code route for saving code
router.post('/save-code', async (req, res) => {
    try {
        const { blockId, code } = req.body;  

        // Update the current code in MongoDB
        const updatedBlock = await CodeBlock.findByIdAndUpdate(
            blockId,
            { $set: { CurrentState: code } },  // Update the current code state
            { new: true }  // Return the updated document
        );

        if (!updatedBlock) {
            return res.status(404).send('Code block not found');
        }

        res.status(200).send('Code saved successfully');
    } catch (err) {
        console.error('Error saving code:', err);
        res.status(500).send('Error saving code');
    }
});

// Define the /insert-codeblock route for inserting a new code block
router.post('/insert-codeblock', async (req, res) => {
    try {
        await run(req);
        res.status(200).send('Data inserted successfully');
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error inserting data');
    }
});

module.exports = router;