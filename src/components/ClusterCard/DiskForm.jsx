import React from 'react';
import { Divider, Form, Select, InputNumber, Button, Row, Col } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const DiskForm = ({ form, clusterIndex }) => {
    const hasMetadataService = Form.useWatch(['clusters', clusterIndex, 'addedServices'], form)?.includes('metadata');
    const hasReplicationService = Form.useWatch(['clusters', clusterIndex, 'addedServices'], form)?.includes('replication');

    const minDisks = React.useMemo(() => {
        if (hasMetadataService && hasReplicationService) {
            return 6;
        } else if (hasMetadataService || hasReplicationService) {
            return 5;
        }
        return 4;
    }, [hasMetadataService, hasReplicationService]);

    return (
        <Form.List name={['clusters', clusterIndex, 'storageDiskInfo']}>
            {(fields, { add, remove }) => (
                <>
                    <Divider orientation="left">存储硬盘信息</Divider>
                    {fields.map((field, diskIndex) => (
                        <div key={field.key} style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0' }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        {...field}
                                        name={[field.name, 'type']}
                                        label="硬盘类型"
                                        rules={[{ required: true, message: '请选择硬盘类型' }]}
                                    >
                                        <Select
                                            options={[
                                                { label: 'SSD', value: 'SSD' },
                                                { label: 'HDD', value: 'HDD' }
                                            ]}
                                            defaultValue="SSD"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        {...field}
                                        name={[field.name, 'capacity']}
                                        label="硬盘容量"
                                        rules={[{ required: true, message: '请输入硬盘容量' }]}
                                    >
                                        <InputNumber
                                            min={1}
                                            defaultValue={80}
                                            addonAfter="G"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        {...field}
                                        name={[field.name, 'count']}
                                        label="硬盘数量"
                                        rules={[
                                            { required: true, message: '请输入硬盘数量' },
                                            { type: 'number', min: minDisks, message: `硬盘数量至少为${minDisks}` }
                                        ]}
                                    >
                                        <InputNumber
                                            min={minDisks}
                                            defaultValue={4}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button
                                danger
                                onClick={() => remove(field.name)}
                                icon={<MinusOutlined />}
                                style={{ float: 'right' }}
                            >
                                删除硬盘组
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="dashed"
                        onClick={() => add({ type: 'SSD', capacity: 80, count: 4 })}
                        block
                        icon={<PlusOutlined />}
                    >
                        + 添加硬盘组
                    </Button>
                </>
            )}
        </Form.List>
    );
};

export default DiskForm;