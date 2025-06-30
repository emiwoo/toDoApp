import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ToDoApp from './ToDoApp.jsx';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<ToDoApp />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;