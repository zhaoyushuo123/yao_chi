import React from 'react';
import { Form, Select, InputNumber, Button, Space, Checkbox, Row, Col } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';

const NodeItem = ({
                      name,
                      restField,
                      form, // 确保props中包含form
                      clusterName,
                      nodeTypeOptions = [], // 默认值
                      nodeRoleOptions = [], // 默认值
                      businessType,
                      vbsSeparateDeploy,
                      onRemove
                  }) => {
    // 防御性编程：确保form存在
    if (!form || !form.getFieldValue) {
        console.error('NodeItem: form实例未正确传递');
        return null;
    }

    // 安全获取字段值
    const getSafeFieldValue = (path) => {
        try {
            return form.getFieldValue(path) || null;
        } catch (e) {
            console.error('获取字段值失败:', path, e);
            return null;
        }
    };

    const nodeType = getSafeFieldValue(['clusterInfo', clusterName, 'nodeInfo', name, 'nodeType']);

    return (
        <div style={{ marginBottom: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
            <Space align="baseline" style={{ width: '100%' }}>
                {/* 节点类型选择 */}
                <Form.Item
                    {...restField}
                    name={[name, 'nodeType']}
                    rules={[{ required: true, message: '请选择节点类型!' }]}
                    style={{ width: 120 }}
                >
                    <Select
                        placeholder="节点类型"
                        options={nodeTypeOptions}
                    />
                </Form.Item>

                {/* 动态配置区域 */}
                {nodeType === 'storage' && (
                    <>
                        <Form.Item
                            {...restField}
                            name={[name, 'nodeRole']}
                            rules={[{ required: true, message: '请选择节点角色!' }]}
                            style={{ width: 120 }}
                        >
                            <Select
                                placeholder="节点角色"
                                options={nodeRoleOptions}
                            />
                        </Form.Item>

                        <Form.Item
                            {...restField}
                            name={[name, 'nodeCount']}
                            rules={[{ required: true, message: '请输入节点数量!' }]}
                        >
                            <InputNumber min={1} placeholder="数量" />
                        </Form.Item>
                    </>
                )}

                {/* 客户端配置 */}
                {nodeType === 'client' && (
                    <>
                        <Form.Item
                            {...restField}
                            name={[name, 'clientServices']}
                            rules={[{ required: true, message: '请至少选择一项服务!' }]}
                        >
                            <Checkbox.Group>
                                <Row gutter={8}>
                                    {['nfs', 'obs', 'dpc', 'fi'].map(service => (
                                        <Col key={service}>
                                            <Checkbox value={service}>{service.toUpperCase()}</Checkbox>
                                        </Col>
                                    ))}
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item
                            {...restField}
                            name={[name, 'nodeCount']}
                            rules={[{ required: true, message: '请输入节点数量!' }]}
                        >
                            <InputNumber min={1} placeholder="数量" />
                        </Form.Item>
                    </>
                )}

                <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => onRemove()}
                />
            </Space>
        </div>
    );
};

export default React.memo(NodeItem);