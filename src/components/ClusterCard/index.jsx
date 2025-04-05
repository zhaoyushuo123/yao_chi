import React from 'react';
import { Card, Button, Form, Row, Col, Input, Select, Space } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import NodeForm from './NodeForm';
import DiskForm from './DiskForm';
import NetworkForm from './NetworkForm';
import {
    BUSINESS_TYPE_OPTIONS,
    PLATFORM_OPTIONS,
    getClusterRoleOptions,
    getAddedServiceOptions
} from '../../constants/options';

const ClusterCard = ({
                         index,
                         onRemove,
                         form,
                         businessType = 'NAS',
                         onBusinessTypeChange
                     }) => {
    // 确保 nodes 是一个数组
    const nodes = Form.useWatch(['clusters', index, 'nodes'], form) || [];

    const hasStorageNodes = nodes.some(node => node?.nodeType === '存储');

    React.useEffect(() => {
        const clusterRoleField = form.getFieldValue(['clusters', index, 'clusterRole']);
        const validRoles = getClusterRoleOptions(businessType).map(option => option.value);

        if (!validRoles.includes(clusterRoleField)) {
            const clusters = form.getFieldValue('clusters') || [];
            form.setFieldsValue({
                ['clusters']: clusters.map((cluster, idx) => {
                    if (idx === index) {
                        return { ...cluster, clusterRole: undefined };
                    }
                    return cluster;
                })
            });
        }
    }, [businessType, form, index]);

    return (
        <Card
            title={`集群 ${index + 1}`}
            extra={
                <Button
                    danger
                    icon={<MinusOutlined />}
                    onClick={onRemove}
                />
            }
            style={{ marginBottom: 16 }}
        >
            <Form.Item
                name={['clusters', index, 'clusterName']}
                label="集群名称"
                rules={[{ required: true, message: '请输入集群名称' }]}
            >
                <Input placeholder="例如: NAS-生产集群-01" />
            </Form.Item>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name={['clusters', index, 'businessType']}
                        label="业务大类"
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={BUSINESS_TYPE_OPTIONS}
                            onChange={(value) => {
                                onBusinessTypeChange(value);
                                form.setFieldsValue({
                                    ['clusters']: form.getFieldValue('clusters').map((cluster, idx) => {
                                        if (idx === index) {
                                            return { ...cluster, clusterRole: undefined };
                                        }
                                        return cluster;
                                    })
                                });
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={['clusters', index, 'platform']}
                        label="平台"
                        rules={[{ required: true }]}
                    >
                        <Select options={PLATFORM_OPTIONS} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={['clusters', index, 'clusterRole']}
                        label="集群角色"
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={getClusterRoleOptions(businessType)}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name={['clusters', index, 'addedServices']}
                label="增值服务"
                rules={[{ required: true }]}
            >
                <Select
                    mode="multiple"
                    options={getAddedServiceOptions(businessType)}
                />
            </Form.Item>

            <Form.List name={['clusters', index, 'nodes']}>
                {(fields, { add, remove }) => (
                    <div>
                        {fields.map((field, nodeIndex) => (
                            <NodeForm
                                key={field.key}
                                field={field}
                                nodeIndex={nodeIndex}
                                remove={remove}
                                form={form}
                                index={index}
                                businessType={businessType}
                            />
                        ))}
                        <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            style={{ marginTop: 16 }}
                        >
                            + 添加节点
                        </Button>
                    </div>
                )}
            </Form.List>

            {hasStorageNodes && (
                <>
                    <DiskForm form={form} clusterIndex={index} />
                    <NetworkForm form={form} clusterIndex={index} />
                </>
            )}
        </Card>
    );
};

export default React.memo(ClusterCard);