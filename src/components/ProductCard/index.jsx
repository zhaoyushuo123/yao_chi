import React from 'react';
import { Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    return (
        <Card
            hoverable
            onClick={() => navigate(product.route)}
            style={{ width: 240, margin: '16px auto' }}
        >
            <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>{product.name}</Text>
            <Text style={{ marginTop: 8 }}>{product.description}</Text>
        </Card>
    );
};

export default ProductCard;