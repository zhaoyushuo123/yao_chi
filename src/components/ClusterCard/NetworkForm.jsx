import React from 'react';
import { Divider, Form, Select, InputNumber, Row, Col, Typography } from 'antd';
import { nicTypeOptions } from '../../constants/options';

const { Text } = Typography;

const NetworkForm = ({ form, clusterIndex }) => {
    // 监听网卡数量变化，动态更新业务IP数量的最小值
    const nicCount = Form.useWatch(['clusters', clusterIndex, 'network', 'nicCount'], form) || 4;

    return (
        <>
            <Divider orientation="left">网络配置</Divider>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name={['clusters', clusterIndex, 'network', 'nicType']}
                        label="网卡类型"
                        rules={[{ required: true, message: '请选择网卡类型' }]}
                    >
                        <Select options={nicTypeOptions} />
                    </Form.Item>
                </Col>

                <Col span={8}>
                    <Form.Item
                        name={['clusters', clusterIndex, 'network', 'nicCount']}
                        label="网卡数量"
                        rules={[
                            { required: true, message: '请输入网卡数量' },
                            { type: 'number', min: 1, max: 8, message: '网卡数量必须在1到8之间' }
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={8}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Col>

                <Col span={8}>
                    <Form.Item
                        name={['clusters', clusterIndex, 'network', 'ipCount']}
                        label="业务IP数量"
                        rules={[
                            { required: true, message: '请输入业务IP数量' },
                            {
                                validator: (_, value) => {
                                    const minIPs = nicCount * 2; // 每个网卡至少2个IP
                                    if (value >= minIPs) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(`至少需要 ${minIPs} 个IP`));
                                }
                            }
                        ]}
                    >
                        <InputNumber
                            min={nicCount * 2}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                    {form.getFieldValue(['clusters', clusterIndex, 'network', 'nicType']) === 'TCP'
                        ? 'TCP协议网卡，建议用于通用场景'
                        : 'RoCE协议网卡，建议用于高性能场景'}
                </Text>
            </div>
        </>
    );
};

export default NetworkForm;