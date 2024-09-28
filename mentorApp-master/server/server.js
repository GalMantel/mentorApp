const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const ObjectId = mongoose.Types.ObjectId; 
const CodeBlock = require('./schema.js');  


const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
}));

app.use(express.json());


// Connect to the database
mongoose.connect('mongodb+srv://galmantel16:s4fyzccavV2_f.y@mentorapp.8uygy.mongodb.net/mentorApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Listen for successful connection
mongoose.connection.once('open',async  () => {
    console.log('Connected to MongoDB!');

    try {
        // Use async/await to ensure MongoDB operations happen after the connection is fully ready
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in mentorApp:', collections.map(collection => collection.name));
    } catch (err) {
        console.error('Error retrieving collections:', err);
    }
});

// Handle connection error
mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});



app.get('/api/codeBlock/:blockId', async (req, res) => {
    const blockId = req.params.blockId;

    try {
        console.log("secction1")
        const collection = mongoose.connection.db.collection('codeblocks');
        const codeBlock = await collection.findOne({ _id: new ObjectId(blockId) });
        console.log('enter to codeblock collection' );

        if (!codeBlock) {
            return res.status(404).json({ message: 'Code block not found' });
        }

        res.json(codeBlock);
    } catch (error) {
        console.error('Error fetching code block:', error);
        res.status(500).json({ message: 'Error fetching code block' });
    }
});

// Track rooms and roles
const rooms = {};

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    socket.on('joinRoom', (blockId) => {
        if (socket.joinedRoom) {
            // If the client has already joined the room, prevent re-joining
            console.log(`Client ${socket.id} has already joined room ${blockId}, skipping re-join.`);
            return;
        }

        // Mark the socket as having joined the room
        socket.joinedRoom = true;

        // Initialize room if it doesn't exist
        if (!rooms[blockId]) {
            rooms[blockId] = { mentor: null, students: [], participants: 0 };
        }

        const room = rooms[blockId];

         // Assign role: first to join is mentor, others are students
         if (!room.mentor) {
            room.mentor = socket.id;
            socket.emit('roleAssigned', { role: 'mentor', participants: room.participants + 1 });
            console.log(`Client ${socket.id} joined room ${blockId} as mentor`);
        } else {
            room.students.push(socket.id);
            socket.emit('roleAssigned', { role: 'student', participants: room.participants + 1 });
            console.log(`Client ${socket.id} joined room ${blockId} as student`);
        }

        room.participants++;  // Increment participant count

        

        // Notify all clients in the room about the updated number of participants
        io.to(blockId).emit('updateParticipants', room.participants);

        // Join the socket room
        socket.join(blockId);
    });

    // Handle code updates
    socket.on('codeChange', async (blockId, newCode) => {
        const room = rooms[blockId];
        if (room && room.mentor !== socket.id) {  // Only allow students to edit
            try {
                await CodeBlock.findByIdAndUpdate(
                    blockId,
                    { $set: { CurrentState: newCode } }  // Save the updated code
                );
                console.log('Code saved successfully');

                // Emit the code update to other users in the room
                socket.to(blockId).emit('codeUpdate', newCode);
            } catch (err) {
                console.error('Error updating code in DB:', err);
            }
        }
        });
    


    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);

        // Handle removal from rooms
        for (const [blockId, room] of Object.entries(rooms)) {
            if (room.mentor === socket.id) {
                console.log(`Mentor ${socket.id} left room ${blockId}. Removing room.`);
                io.to(blockId).emit('mentorLeft');  // Notify students
                delete rooms[blockId];  // Delete the room if mentor leaves
            } else if (room.students.includes(socket.id)) {
                room.students = room.students.filter(sid => sid !== socket.id);
                room.participants--;
                if (room.participants > 0) {
                    io.to(blockId).emit('updateParticipants', room.participants);  // Update participant count
                } else {
                    // If no participants are left, clean up the room
                    delete rooms[blockId];
                }
                
            }
        }
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
