import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import PacificPage from "./pages/Pacific";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pacific" element={<PacificPage />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;