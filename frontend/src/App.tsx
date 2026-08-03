import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { DarkModeProvider } from './components/DarkModeProvider';

function App() {
  return (
    <DarkModeProvider>
    <RouterProvider router={router} />
    </DarkModeProvider>
  );
}

export default App;
