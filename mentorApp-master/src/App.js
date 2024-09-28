
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Lobby from './Lobby';
import CodeBlock from './CodeBlock';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/code-block/:blockId" element={<CodeBlock />} />
            </Routes>
        </Router>
    );
}

export default App;