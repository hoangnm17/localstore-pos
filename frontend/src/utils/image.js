const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/150';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL}${imageUrl}`;
};



