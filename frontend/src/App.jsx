import React, { useState } from 'react';
import DesktopEnvironment from './components/DesktopEnvironment';
import BootSequence from './components/BootSequence';

function App() {
  const [booted, setBooted] = useState(false);

  return (
    <div className="App">
      {!booted ? (
        <BootSequence onComplete={() => setBooted(true)} />
      ) : (
        <DesktopEnvironment />
      )}
    </div>
  );
}

export default App;
