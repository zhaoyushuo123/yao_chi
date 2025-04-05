import React from 'react';
import { Divider, Form, Select, InputNumber, Button, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { nodeTypeOptions, clientServiceOptions, storageRoleOptions, imageOptions } from '../../constants/options';

const NodeForm = ({ form, index, businessType }) => {
    return (
        <Form.List name={['clusters', index, 'nodes']}>
            {(fields, { add, remove }) => (
                <>
                    {fields.map((field, nodeIndex) => (
                        <div key={field.key} style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0' }}>
                            <Form.Item
                                {...field}
                                name={[field.name, 'type']}
                                label="节点类型"
                                rules={[{ required: true, message: '请选择节点类型' }]}
                            >
                                <Select
                                    options={nodeTypeOptions}
                                    placeholder="请选择"
                                    style={{ width: '100%' }}
                                    onChange={(value) => {
                                        form.setFieldsValue({
                                            ['clusters']: form.getFieldValue(['clusters']).map((cluster, clusterIdx) => {
                                                if (clusterIdx === index) {
                                                    return {
                                                        ...cluster,
                                                        nodes: cluster.nodes.map((node, nodeIdx) => {
                                                            if (nodeIdx === nodeIndex) {
                                                                return { ...node, services: [], role: '' };
                                                            }
                                                            return node;
                                                        })
                                                    };
                                                }
                                                return cluster;
                                            })
                                        });
                                    }}
                                />
                            </Form.Item>

                            {field.type === '客户端' && (
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'services']}
                                            label="业务服务"
                                            rules={[{ required: true, message: '请选择业务服务' }]}
                                        >
                                            <Select
                                                mode="multiple"
                                                options={clientServiceOptions}
                                                placeholder="请选择"
                                                style={{ width: '100%' }}
                                                onChange={(values) => {
                                                    if (values.includes('HDFS_FI') && values.includes('FI')) {
                                                        form.setFieldsValue({
                                                            ['clusters']: form.getFieldValue(['clusters']).map((cluster, clusterIdx) => {
                                                                if (clusterIdx === index) {
                                                                    return {
                                                                        ...cluster,
                                                                        nodes: cluster.nodes.map((node, nodeIdx) => {
                                                                            if (nodeIdx === nodeIndex) {
                                                                                return { ...node, services: values.filter(service => service !== 'FI') };
                                                                            }
                                                                            return node;
                                                                        })
                                                                    };
                                                                }
                                                                return cluster;
                                                            })
                                                        });
                                                    }
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'count']}
                                            label="节点数量"
                                            rules={[{ required: true, message: '请输入节点数量' }]}
                                        >
                                            <InputNumber min={1} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}

                            {field.type === '存储' && (
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'role']}
                                            label="存储节点角色"
                                            rules={[{ required: true, message: '请选择存储节点角色' }]}
                                        >
                                            <Select
                                                options={storageRoleOptions.filter(role => businessType === 'BLOCK' || role.value !== 'VBS')}
                                                placeholder="请选择"
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'count']}
                                            label="节点数量"
                                            rules={[{ required: true, message: '请输入节点数量' }]}
                                        >
                                            <InputNumber min={1} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}

                            <Form.Item
                                {...field}
                                name={[field.name, 'image']}
                                label="镜像"
                                rules={[{ required: true, message: '请选择镜像' }]}
                            >
                                <Select
                                    options={imageOptions}
                                    placeholder="请选择"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Button
                                danger
                                onClick={() => remove(field.name)}
                                style={{ float: 'right' }}
                            >
                                删除节点
                            </Button>
                        </div>
                    ))}

                    <Button
                        type="dashed"
                        onClick={() => add({ type: undefined, count: 1, services: [], role: '', image: '' })}
                        block
                        icon={<PlusOutlined />}
                    >
                        + 添加节点
                    </Button>
                </>
            )}
        </Form.List>
    );
};

export default NodeForm;