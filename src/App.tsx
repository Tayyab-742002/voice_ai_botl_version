import React from 'react';
import { ConversationProvider } from './contexts/ConversationContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ConversationContainer } from './components/conversation/ConversationContainer';

function App() {
  return (
    <ConversationProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto max-w-6xl">
          <ConversationContainer />
        </main>
        
        <Footer />
      </div>
    </ConversationProvider>
  );
}

export default App;