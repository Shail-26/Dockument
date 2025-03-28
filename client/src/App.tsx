// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider } from './contexts/WalletContext'; // Import WalletProvider
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Features } from './pages/Features';
import { Signup } from './pages/Signup';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';
import { FileUpload } from './pages/FileUpload';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MyDocuments } from './pages/MyDocuments';
// import { MyDocuments } from './pages/DemoDocument';
import { IssuerDashboard } from './components/issuer/IssuerDashboard';

function App() {
  return (
    <ThemeProvider>
      <WalletProvider> {/* Wrap with WalletProvider */}
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/features" element={<Features />} />
                <Route path="/connect-wallet" element={<Signup />} />
                <Route path="/contact" element={<Contact />} />
                {/* <Route path="/folder/:a" element={<DocumentPage />} /> */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/documents" element={<MyDocuments />} />
                  <Route path="/upload" element={<FileUpload />} />
                </Route>
                <Route path="/issuer-dashboard" element={<IssuerDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;