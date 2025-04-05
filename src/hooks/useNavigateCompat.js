// src/hooks/useNavigateCompat.js
import { useNavigate } from 'react-router-dom';

const useNavigateCompat = () => {
    const navigate = useNavigate();

    const navigateCompat = (to) => {
        navigate(to, { replace: true });
    };

    return navigateCompat;
};

export default useNavigateCompat;