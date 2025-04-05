import {Row, Col, Typography} from 'antd';
import useNavigate from '../../hooks/useNavigateCompat';
import {PRODUCTS} from '../../constants/products';
import ProductCard from '../../components/ProductCard';

const {Title} = Typography;

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <>
            <div style={{padding: 24}}>
                {/* 标题区 */}
                <Title level={2} style={{textAlign: 'center', marginBottom: 40}}>
                    请选择要创建的产品环境
                </Title>

                {/* 产品卡片网格 */}
                <Row
                    gutter={[24, 24]}
                    justify="center"
                    style={{maxWidth: 1200, margin: '0 auto'}}
                >
                    {PRODUCTS.map((product) => (
                        <Col
                            key={product.id}
                            xs={24} sm={12} md={8} lg={8} xl={6}
                        >
                            <ProductCard
                                product={product}
                                onClick={() => navigate(product.route)}
                            />
                        </Col>
                    ))}
                </Row>

                {/* 底部说明 */}
                <div style={{
                    marginTop: 48,
                    textAlign: 'center',
                    color: '#666'
                }}>
                    <p>点击卡片开始创建对应的产品环境</p>
                </div>
            </div>
        </>
    );
};

export default HomePage;