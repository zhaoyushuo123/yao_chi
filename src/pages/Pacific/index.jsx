import React from 'react';
import { Row, Col, Button, Form, message, Input, Select, Space } from 'antd';
import useCluster from '../../hooks/useCluster';
import ClusterCard from '../../components/ClusterCard';
import TemplatePanel from '../../components/TemplatePanel';
import FavoritePanel from '../../components/FavoritePanel';
import { saveAs } from 'file-saver'; // 用于导出文件

const { TextArea } = Input;

const PacificPage = () => {
    const { clusters, addCluster, removeCluster } = useCluster();
    const [form] = Form.useForm();

    // 初始化 form 的值
    React.useEffect(() => {
        form.setFieldsValue({ clusters });
    }, [clusters, form]);

    // 处理集群删除前的确认
    const handleRemoveCluster = (id) => {
        if (!removeCluster(id)) {
            message.warning(`至少需要保留 ${clusters.length} 个集群`);
        }
    };

    // 导出表单数据
    const exportForm = () => {
        const data = form.getFieldsValue();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, 'form-data.json');
    };

    // 导入表单数据
    const importForm = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = JSON.parse(e.target.result);
                form.setFieldsValue(data);
            };
            reader.readAsText(file);
        }
    };

    // 推荐命名功能
    const recommendNaming = () => {
        // 根据表单数据生成推荐命名
        const values = form.getFieldsValue();
        const naming = `推荐命名：${values.clusters[0]?.name || '默认集群名称'}`;
        message.info(naming);
    };

    return (
        <Form form={form} layout="vertical">
            <Row gutter={16}>
                {/* 左侧集群表单区 */}
                <Col span={16}>
                    {clusters && Array.isArray(clusters) && clusters.map((cluster, index) => (
                        <ClusterCard
                            key={cluster.id}
                            cluster={cluster}
                            index={index}
                            onRemove={() => handleRemoveCluster(cluster.id)}
                            form={form} // 传递表单实例
                        />
                    ))}
                    <Button
                        type="dashed"
                        onClick={addCluster}
                        block
                        style={{ marginTop: 16 }}
                    >
                        + 添加集群
                    </Button>
                </Col>

                {/* 右侧操作面板区 */}
                <Col span={8}>
                    <TemplatePanel form={form} />
                    <FavoritePanel form={form} />
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button onClick={exportForm}>导出表单</Button>
                        <input type="file" onChange={importForm} />
                        <Button onClick={recommendNaming}>使用推荐命名</Button>
                    </Space>
                </Col>
            </Row>
        </Form>
    );
};

export default PacificPage;