const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://galmantel16:s4fyzccavV2_f.y@mentorapp.8uygy.mongodb.net/?retryWrites=true&w=majority&appName=MentorApp';
const client = new MongoClient(uri);

async function run(req) {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const database = client.db('mentorApp');
        const collection = database.collection('codeblocks');
         
        // Capture user inputs from the request
        const role = req.body.role;  // Get user's role 
        const blockId = req.body.blockId;  // Get the block they clicked on
        const text = req.body.text;  // Get the text/code the user wrote

        const doc = {
            role: role,  // 'student' or 'mentor'
            blockId: blockId,  // The block they clicked on
            text: text,  // The code they wrote
        };
        console.log('Received request data:', req.body);

        // Insert a document
        try {
            const result = await collection.insertOne(doc);
            console.log('Document inserted with _id:', result.insertedId);
        } catch (error) {
            console.error('Error inserting document:', error);
        }

        const insertedDoc = await collection.findOne({ _id: result.insertedId });
        console.log('Inserted document:', insertedDoc);

        const allDocs = await collection.find().toArray();
        console.log('All documents in codeBlocks collection:', allDocs);  // Prints all documents

    } finally {
        await client.close();
    }
}

module.exports = { run };
