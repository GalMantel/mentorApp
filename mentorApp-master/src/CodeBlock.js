import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  // useNavigate for redirecting
import AceEditor from 'react-ace';
import io from 'socket.io-client';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

const socket = io('http://localhost:4000');

const CodeBlock = () => {
    const { blockId } = useParams();  // Get blockId from route
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [role, setRole] = useState('');  // Role of the user (mentor/student)
    const [participants, setParticipants] = useState(0);  // Number of people in the room
    const [solution, setSolution] = useState('');
    const [showSmiley, setShowSmiley] = useState(false);

    useEffect(() => {
        // Join the room when the component mounts
        socket.emit('joinRoom', blockId);

        // Fetch initial code template from the server
        const fetchCode = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/codeBlock/${blockId}`); // GET code-block/:blockId
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Fetched data:', data); // Log the data to see its structure

                setCode(data.CurrentState || data.InitialTemplate);  // Use CurrentState if available, else InitialTemplate
                setSolution(data.Solution);
            } catch (error) {
                console.error('Error fetching code:', error);
            }
        };
        
        fetchCode();

        // Handle role assignment from the server
        const handleRoleAssignment = ({ role, participants }) => {
            setRole(role);  // Set the correct role from the server
            setParticipants(participants);
            console.log(`You are a ${role} in room ${blockId}`);
        };

        // Handle socket events
        socket.on('roleAssigned', handleRoleAssignment);
        socket.on('codeUpdate', newCode => setCode(newCode));  // Update code when notified
        socket.on('mentorLeft', () => {
            alert('The mentor has left the room. Redirecting to the lobby...');
            navigate('/');
        });
        socket.on('updateParticipants', (count) => {
            setParticipants(count);
            console.log(`Updated participants count: ${count}`);
        });
        

        socket.on('codeMatched', () => {
    
            setShowSmiley(true);  // Show smiley when code matches
        });

        

        // Clean up on component unmount
        return () => {
            socket.off('roleAssigned', handleRoleAssignment);
            socket.off('codeUpdate');
            socket.off('mentorLeft');
            socket.off('updateParticipants');
            socket.off('codeMatched');
        };
    }, [blockId, navigate]);

    const handleCodeChange = (newCode) => {
        if (role === 'student') {  // Only students can edit code
            setCode(newCode);
         
            socket.emit('codeChange', blockId, newCode);
            // Check if the new code matches the solution
            if (newCode === solution) {  // Compare with solution
                setShowSmiley(true);
                socket.emit('codeMatched');  // Emit event if it matches
        
            }
   

            // Save the code to the server
            fetch('http://localhost:4000/save-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    blockId,
                    code: newCode,  // Send blockId and the current code
                }),
            })
            .then(response => response.text())
            .then(data => console.log('Code saved:', data))
            .catch(err => console.error('Error saving code:', err));
        }
       
    };

    return (
        <div>
            <h1>Code Block</h1>
            <p>Your Role: {role === 'mentor' ? 'Mentor (Read-Only)' : 'Student (Editable)'}</p>
            <p>Participants in this room: {participants}</p>
            <AceEditor
                setOptions={{ useWorker: false }}
                mode="javascript"
                theme="github"
                value={code}
                onChange={handleCodeChange}
                readOnly={role === 'mentor'}  // Mentors have read-only access
                name="codeEditor"
                editorProps={{ $blockScrolling: true }}
            />
            {showSmiley && <div style={{ fontSize: '50px' }}>😊</div>}  {/* Display smiley */}
        </div>
    );
};

export default CodeBlock;
