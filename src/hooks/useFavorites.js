import { useState, useEffect } from 'react';

export default function useFavorites() {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('favoriteConfigs');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    const save = (name, config) => {
        const newFavorite = {
            name,
            config,
            timestamp: new Date().toISOString()
        };
        const updated = [...favorites, newFavorite];
        setFavorites(updated);
        localStorage.setItem('favoriteConfigs', JSON.stringify(updated));
    };

    return { favorites, saveFavorite: save };
}