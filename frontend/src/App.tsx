import { useState } from 'react'
import AuthScreen from './components/AuthScreen';
import PostsScreen from './components/PostsScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return !isAuthenticated ?
    <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} /> :
    <PostsScreen />;
}

export default App
