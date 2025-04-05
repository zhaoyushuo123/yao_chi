import React from 'react';
import {Card, Button, List, message, Upload, Modal, Input, Space} from 'antd';
import { StarOutlined, StarFilled, UploadOutlined, DownloadOutlined } from '@ant-design/icons';

const TemplatePanel = ({ favorites, activeTemplate, onApplyTemplate, onSaveFavorite }) => {
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [configName, setConfigName] = React.useState('');

    const handleExport = () => {
        message.success('导出功能待实现');
    };

    const handleImport = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                onApplyTemplate(null, { name: file.name, config });
                message.success('配置导入成功');
            } catch (error) {
                message.error('配置文件格式错误');
            }
        };
        reader.readAsText(file);
        return false;
    };

    return (
        <>
            <Card title="模板配置" style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    style={{ marginBottom: 8, width: '100%' }}
                    onClick={() => onApplyTemplate('3NODE_1Client')}
                >
                    3节点+1客户端
                </Button>
                <Button
                    style={{ marginBottom: 8, width: '100%' }}
                    onClick={() => onApplyTemplate('BLOCK_Template')}
                >
                    块存储模板
                </Button>
            </Card>

            <Card
                title="收藏配置"
                extra={
                    <Space>
                        <Button icon={<StarOutlined />} onClick={() => setIsModalVisible(true)} size="small" />
                        <Upload beforeUpload={handleImport} showUploadList={false}>
                            <Button icon={<UploadOutlined />} size="small" />
                        </Upload>
                        <Button icon={<DownloadOutlined />} onClick={handleExport} size="small" />
                    </Space>
                }
            >
                <List
                    dataSource={favorites}
                    renderItem={(item, index) => (
                        <List.Item
                            actions={[
                                <Button type="link" onClick={() => onApplyTemplate(null, item)}>应用</Button>,
                                <Button type="text" icon={item.isFavorite ? <StarFilled /> : <StarOutlined />} />
                            ]}
                        >
                            <List.Item.Meta title={item.name} />
                        </List.Item>
                    )}
                />
            </Card>

            <Modal
                title="保存配置"
                visible={isModalVisible}
                onOk={() => {
                    onSaveFavorite(configName);
                    setIsModalVisible(false);
                    setConfigName('');
                }}
                onCancel={() => setIsModalVisible(false)}
            >
                <Input
                    placeholder="输入配置名称"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                />
            </Modal>
        </>
    );
};

export default React.memo(TemplatePanel);