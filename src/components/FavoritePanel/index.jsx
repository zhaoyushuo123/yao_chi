import { Card, Button, List, message, Modal, Input, Space, Tag } from 'antd';
import { StarFilled, StarOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';

const FavoritePanel = ({ form }) => {
    const [favorites, setFavorites] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [favoriteName, setFavoriteName] = useState('');

    // 保存当前配置为收藏
    const saveFavorite = () => {
        form.validateFields()
            .then(values => {
                setIsModalOpen(true);
            })
            .catch(() => message.error('表单校验未通过'));
    };

    // 确认保存
    const handleSaveConfirm = () => {
        if (!favoriteName.trim()) {
            message.error('请输入收藏名称');
            return;
        }

        const currentConfig = form.getFieldsValue();
        setFavorites([...favorites, {
            id: Date.now(),
            name: favoriteName,
            config: currentConfig,
            timestamp: new Date().toLocaleString()
        }]);

        message.success('配置已收藏');
        setFavoriteName('');
        setIsModalOpen(false);
    };

    // 应用收藏配置
    const applyFavorite = (config) => {
        form.setFieldsValue(config);
        message.success('配置已加载');
    };

    // 删除收藏
    const removeFavorite = (id, e) => {
        e.stopPropagation();
        setFavorites(favorites.filter(fav => fav.id !== id));
        message.success('收藏已删除');
    };

    return (
        <Card
            title="我的收藏"
            extra={
                <Button
                    icon={<StarOutlined />}
                    onClick={saveFavorite}
                    size="small"
                >
                    收藏当前
                </Button>
            }
            style={{ marginBottom: 16 }}
        >
            <List
                dataSource={favorites}
                renderItem={(item) => (
                    <List.Item
                        onClick={() => applyFavorite(item.config)}
                        style={{
                            cursor: 'pointer',
                            padding: '8px 12px',
                            border: '1px solid #f0f0f0',
                            marginBottom: 8,
                            borderRadius: 4
                        }}
                        actions={[
                            <DeleteOutlined
                                onClick={(e) => removeFavorite(item.id, e)}
                                style={{ color: '#ff4d4f' }}
                            />
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<StarFilled style={{ color: '#faad14' }} />}
                            title={item.name}
                            description={
                                <Space>
                                    <Tag color="blue">{item.config?.clusters?.[0]?.businessType || '未知'}</Tag>
                                    <span>{item.timestamp}</span>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: '暂无收藏' }}
            />

            <Modal
                title="收藏当前配置"
                open={isModalOpen}
                onOk={handleSaveConfirm}
                onCancel={() => setIsModalOpen(false)}
            >
                <Input
                    placeholder="输入收藏名称"
                    value={favoriteName}
                    onChange={(e) => setFavoriteName(e.target.value)}
                    onPressEnter={handleSaveConfirm}
                />
            </Modal>
        </Card>
    );
};

export default FavoritePanel;