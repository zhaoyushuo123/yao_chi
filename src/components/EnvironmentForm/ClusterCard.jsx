import React, { useMemo } from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Space,
    Row,
    Col,
    InputNumber,
    Checkbox,
    Radio,
    Tooltip,
    message
} from 'antd';
import {
    MinusCircleOutlined,
    PlusOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import NodeItem from './NodeItem'; // 导入独立的NodeItem组件

const { Option } = Select;

const ClusterCard = ({
                         name,
                         form,
                         onRemove,
                         showClientImage,
                         nodeStats
                     }) => {
    const businessType = Form.useWatch(['clusterInfo', name, 'businessType'], form);
    const vbsSeparateDeploy = Form.useWatch(['clusterInfo', name, 'vbsSeparateDeploy'], form);
    const enableMetadata = Form.useWatch(['clusterInfo', name, 'enableMetadata'], form);
    const enableReplication = Form.useWatch(['clusterInfo', name, 'enableReplication'], form);

    // 确保选项生成正确（在ClusterCard组件内）
    const nodeTypeOptions = useMemo(() => {
        return [
            { value: 'storage', label: '存储节点', disabled: businessType === 'dme' },
            { value: 'client', label: '客户端', disabled: businessType === 'block' }
        ].filter(opt => !opt.disabled);
    }, [businessType]);

    const nodeRoleOptions = useMemo(() => {
        const baseRoles = [
            { value: 'fsm', label: 'FSM' },
            { value: 'fsa', label: 'FSA' }
        ];

        if (businessType === 'block') {
            baseRoles.push({ value: 'vbs', label: 'VBS' });
            if (vbsSeparateDeploy) {
                baseRoles.push({ value: 'vbs_separate', label: 'VBS分离' });
            }
        }

        return baseRoles;
    }, [businessType, vbsSeparateDeploy]);

    // 验证VBS节点数量
    const validateVBSNodes = () => {
        if (!vbsSeparateDeploy) return;

        const nodeInfo = form.getFieldValue(['clusterInfo', name, 'nodeInfo']) || [];
        const vbsNodes = nodeInfo
            .filter(node => node?.nodeType === 'storage' && node?.nodeRole === 'vbs')
            .reduce((sum, node) => sum + (node.nodeCount || 0), 0);

        if (vbsNodes < 6) {
            message.warning('VBS分离部署需要至少6个VBS节点');
        }
    };

    return (
        <div style={{
            marginBottom: 16,
            border: '1px solid #d9d9d9',
            padding: 16,
            borderRadius: 4,
            position: 'relative',
            backgroundColor: '#fff'
        }}>
            {/* 集群头部 */}
            <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
            }}>
                <div style={{
                    background: '#f0f0f0',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12
                }}>
                    存储: {nodeStats?.storageCount || 0} | 客户端: {nodeStats?.clientCount || 0}
                </div>
                <Button
                    danger
                    onClick={onRemove}
                    icon={<MinusCircleOutlined />}
                    size="small"
                >
                    删除集群
                </Button>
            </div>

            {/* 集群基本信息 */}
            <Form.Item
                name={[name, 'clusterName']}
                label="集群名称"
                rules={[{ required: true, message: '请输入集群名称!' }]}
            >
                <Input placeholder="例如: 生产集群A" />
            </Form.Item>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name={[name, 'businessType']}
                        label="业务类型"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="选择业务类型">
                            <Option value="block">块存储</Option>
                            <Option value="nas">文件存储</Option>
                            <Option value="dme">数据管理</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={[name, 'platform']}
                        label="平台类型"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="选择平台">
                            <Option value="x86">x86</Option>
                            <Option value="arm">ARM</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={[name, 'clusterRole']}
                        label="集群角色"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="选择角色">
                            <Option value="默认集群">默认集群</Option>
                            <Option value="9000纳管本端集群">9000纳管本端集群</Option>
                            <Option value="9000纳管远端集群">9000纳管远端集群</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            {/* 高级选项 */}
            {businessType === 'block' && (
                <Form.Item name={[name, 'vbsSeparateDeploy']}>
                    <Radio.Group onChange={validateVBSNodes}>
                        <Radio value={true}>
                            VBS分离部署
                            <Tooltip title="需要至少6个VBS节点">
                                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                        </Radio>
                        <Radio value={false}>普通部署</Radio>
                    </Radio.Group>
                </Form.Item>
            )}

            {businessType === 'nas' && (
                <Space>
                    <Form.Item name={[name, 'enableMetadata']} valuePropName="checked">
                        <Checkbox>
                            元数据服务
                            <Tooltip title="需要额外存储资源">
                                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                        </Checkbox>
                    </Form.Item>
                    <Form.Item name={[name, 'enableReplication']} valuePropName="checked">
                        <Checkbox>
                            数据复制
                            <Tooltip title="需要额外存储资源">
                                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                        </Checkbox>
                    </Form.Item>
                </Space>
            )}

            {/* 节点配置 - 使用独立的NodeItem组件 */}
            <Form.Item label="节点配置">
                <Form.List name={[name, 'nodeInfo']}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name: nodeName, ...restField }) => (
                                <NodeItem
                                    key={key}
                                    name={nodeName}
                                    restField={restField}
                                    form={form} // 确保传递form实例
                                    clusterName={name}
                                    nodeTypeOptions={nodeTypeOptions}
                                    nodeRoleOptions={nodeRoleOptions}
                                    businessType={businessType}
                                    vbsSeparateDeploy={vbsSeparateDeploy}
                                    onRemove={() => remove(nodeName)}
                                />
                            ))}

                            <Button
                                type="dashed"
                                onClick={() => add({
                                    nodeType: businessType === 'dme' ? 'client' : 'storage',
                                    nodeCount: 1,
                                    ...(businessType === 'dme' ? { clientServices: ['nfs'] } : {})
                                })}
                                icon={<PlusOutlined />}
                                block
                                disabled={businessType === 'dme' &&
                                    form.getFieldValue(['clusterInfo', name, 'nodeInfo'])?.length >= 1}
                            >
                                添加节点
                            </Button>
                        </>
                    )}
                </Form.List>
            </Form.Item>

            {/* 镜像配置 */}
            <Row gutter={16}>
                {businessType !== 'dme' && (
                    <Col span={12}>
                        <Form.Item
                            name={[name, 'storageImage']}
                            label="存储镜像"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Option value="euler8">Euler 8</Option>
                                <Option value="euler9">Euler 9</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                )}
                {showClientImage && (
                    <Col span={12}>
                        <Form.Item
                            name={[name, 'clientImage']}
                            label="客户端镜像"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Option value="ubuntu">Ubuntu</Option>
                                <Option value="centos77">CentOS 7.7</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                )}
            </Row>

            {/* 磁盘配置 */}
            {businessType !== 'dme' && (
                <Form.Item label="磁盘配置">
                    <Form.List name={[name, 'diskInfo']}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name: diskName, ...restField }) => (
                                    <Row gutter={16} key={key} style={{ marginBottom: 8 }}>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[diskName, 'diskType']}
                                                rules={[{ required: true }]}
                                            >
                                                <Select>
                                                    <Option value="ssd">SSD</Option>
                                                    <Option value="hdd">HDD</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[diskName, 'diskSize']}
                                                rules={[{ required: true }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    style={{ width: '100%' }}
                                                    placeholder="容量(GB)"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[diskName, 'diskCount']}
                                                rules={[
                                                    { required: true },
                                                    {
                                                        min: enableMetadata && enableReplication ? 6 :
                                                            enableMetadata || enableReplication ? 5 : 4,
                                                        message: enableMetadata && enableReplication ? '至少需要6块磁盘' :
                                                            enableMetadata ? '至少需要5块磁盘' : '至少需要4块磁盘'
                                                    }
                                                ]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    style={{ width: '100%' }}
                                                    placeholder="数量"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            <Button
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(diskName)}
                                            />
                                        </Col>
                                    </Row>
                                ))}

                                <Button
                                    type="dashed"
                                    onClick={() => add({
                                        diskType: 'ssd',
                                        diskSize: 80,
                                        diskCount: enableMetadata && enableReplication ? 6 :
                                            enableMetadata || enableReplication ? 5 : 4
                                    })}
                                    icon={<PlusOutlined />}
                                    block
                                >
                                    添加磁盘
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Form.Item>
            )}

            {/* 网络配置 */}
            {businessType !== 'dme' && (
                <Form.Item label="网络配置">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name={[name, 'networkInfo', 'nicCount']}
                                label="网卡数量"
                                initialValue={4}
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={1} max={4} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={[name, 'networkInfo', 'nicType']}
                                label="网卡类型"
                                initialValue="tcp"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="tcp">TCP</Option>
                                    <Option value="roce">ROCE</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={[name, 'networkInfo', 'ipCount']}
                                label="IP数量"
                                initialValue={5}
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={3} max={8} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
            )}
        </div>
    );
};

export default React.memo(ClusterCard);