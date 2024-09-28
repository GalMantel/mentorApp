import React from 'react';
import { Link } from 'react-router-dom';

const Lobby = () => {
    const codeBlocks = [
        { id: '66eb19b7e2c7e516dbbdcc38', title: 'Async Case' },
        { id: '66ebf898aba11d6766cc2654', title: 'Promise Example' },
        { id: '66ec3ac34ab4c3372275833d', title: 'Array Methods' },
        { id: '66ec3b84d9e8acec3b23a8ed', title: 'Object Destructuring' }
    ];

    return (
        <div>
            <h1>Choose Code Block</h1>
            <ul>
                {codeBlocks.map(block => (
                    <li key={block.id}>
                        <Link to={`/code-block/${block.id}`}>{block.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Lobby;
