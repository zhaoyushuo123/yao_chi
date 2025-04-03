import React, {useState, useEffect} from 'react';
import {Form, Input, Button, Select, Row, Col, message, Space, InputNumber, Checkbox, Card} from 'antd';
import {PlusOutlined, MinusCircleOutlined} from '@ant-design/icons';

const {Option} = Select;

const EnvironmentCreateForm = () => {
    const [form] = Form.useForm();
    const [clusterCount, setClusterCount] = useState(0);

    // 初始化默认展示一个集群
    useEffect(() => {
        form.setFieldsValue({
            clusterInfo: [{
                clusterName: '',
                businessType: undefined,
                platform: undefined,
                nodeInfo: [{
                    nodeType: undefined
                }]
            }]
        });
        setClusterCount(1);
    }, [form]);

    const onFinish = (values) => {
        console.log('Received values of form: ', values);
        message.success('环境创建成功！');
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('请检查表单填写是否正确！');
    };

    const handleClusterChange = (_, allValues) => {
        const count = allValues.clusterInfo?.length || 0;
        setClusterCount(count);
    };

    // 检查集群是否有存储节点
    const hasStorageNode = (clusterIndex) => {
        const nodeInfo = form.getFieldValue(['clusterInfo', clusterIndex, 'nodeInfo']);
        return nodeInfo?.some(node => node?.nodeType === 'storage');
    };

    // 获取节点类型选项
    const getNodeTypeOptions = (businessType) => {
        if (businessType === 'block') {
            return [<Option key="storage" value="storage">存储</Option>];
        } else if (businessType === 'dme') {
            return [<Option key="client" value="client">客户端</Option>];
        }
        return [
            <Option key="storage" value="storage">存储</Option>,
            <Option key="client" value="client">客户端</Option>
        ];
    };

    // 应用典型配置
    const applyTemplate = (template) => {
        let values = {
            clusterInfo: [],
            combinedEnvName: `${template}配置`
        };

        switch (template) {
            case '3NODE_1Client':
                values.clusterInfo = [{
                    clusterName: '3节点存储集群',
                    businessType: 'nas',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1},
                        {nodeType: 'client', clientServices: ['nfs'], nodeCount: 1}
                    ],
                    diskInfo: [
                        {diskType: 'ssd', diskSize: 512, diskCount: 10}
                    ]
                }];
                break;

            case '3NODE_3Client':
                values.clusterInfo = [{
                    clusterName: '3节点存储集群',
                    businessType: 'nas',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1},
                        {nodeType: 'client', clientServices: ['nfs'], nodeCount: 3}
                    ],
                    diskInfo: [
                        {diskType: 'ssd', diskSize: 512, diskCount: 10}
                    ]
                }];
                break;

            case '3NODE_1DPC':
                values.clusterInfo = [{
                    clusterName: '3节点存储集群',
                    businessType: 'nas',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1},
                        {nodeType: 'client', clientServices: ['dpc'], nodeCount: 1}
                    ],
                    diskInfo: [
                        {diskType: 'ssd', diskSize: 512, diskCount: 10}
                    ]
                }];
                break;

            case '3NODE_3DPC':
                values.clusterInfo = [{
                    clusterName: '3节点存储集群',
                    businessType: 'nas',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1},
                        {nodeType: 'client', clientServices: ['dpc'], nodeCount: 3}
                    ],
                    diskInfo: [
                        {diskType: 'ssd', diskSize: 512, diskCount: 10}
                    ]
                }];
                break;

            case '6NODE_1Client':
                values.clusterInfo = [{
                    clusterName: '6节点存储集群',
                    businessType: 'nas',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 4},
                        {nodeType: 'client', clientServices: ['nfs'], nodeCount: 1}
                    ],
                    diskInfo: [
                        {diskType: 'ssd', diskSize: 512, diskCount: 20}
                    ]
                }];
                break;

            case '9NODE_1Client':
                values.clusterInfo = [{
                    clusterName: '9节点存储集群',
                    businessType: 'nas',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 7},
                        {nodeType: 'client', clientServices: ['nfs'], nodeCount: 1}
                    ],
                    diskInfo: [
                        {diskType: 'ssd', diskSize: 512, diskCount: 30}
                    ]
                }];
                break;

            case '9000纳管':
                values.clusterInfo = [{
                    clusterName: '9000纳管集群',
                    businessType: 'block',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1}
                    ],
                    diskInfo: [
                        {diskType: 'hdd', diskSize: 4096, diskCount: 30}
                    ]
                }];
                break;

            case '3NODE_1FI':
                values.clusterInfo = [{
                    clusterName: '3节点FI集群',
                    businessType: 'nas',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1},
                        {nodeType: 'client', clientServices: ['fi'], nodeCount: 1}
                    ]
                }];
                break;


            case '3NODE_HDFS_FI':
                values.clusterInfo = [{
                    clusterName: '3节点HDFS_FI集群',
                    businessType: 'nas',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1},
                        {nodeType: 'client', clientServices: ['fi'], nodeCount: 3}
                    ]
                }];
                break;

            case '3NODE_CONVERGE_FI':
                values.clusterInfo = [{
                    clusterName: '3节点融合FI集群',
                    businessType: 'dme',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2},
                        {nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1},
                        {nodeType: 'client', clientServices: ['nfs','obs','dpc','fi'], nodeCount: 1}
                    ]
                }];
                break;

            case '3NODE_CONVERGE_HDFS_FI':
                values.clusterInfo = [{
                    clusterName: '3节点融合HDFS_FI集群',
                    businessType: 'dme',
                    platform: 'x86',
                    nodeInfo: [
                        {nodeType: 'client', clientServices: ['fi'], nodeCount: 3}
                    ]
                }];
                break;

            case '2DC':
                values.clusterInfo = [
                    {
                        clusterName: '数据中心A',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    },
                    {
                        clusterName: '数据中心B',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    }
                ];
                break;

            case '3DC':
                values.clusterInfo = [
                    {
                        clusterName: '数据中心A',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    },
                    {
                        clusterName: '数据中心B',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    },
                    {
                        clusterName: '数据中心C',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    }
                ];
                break;

            case '2GFS':
                values.clusterInfo = [
                    {
                        clusterName: 'GFS集群1',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    },
                    {
                        clusterName: 'GFS集群2',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    }
                ];
                break;

            case '3GFS':
                values.clusterInfo = [
                    {
                        clusterName: 'GFS集群1',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    },
                    {
                        clusterName: 'GFS集群2',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    },
                    {
                        clusterName: 'GFS集群3',
                        businessType: 'nas',
                        platform: 'x86',
                        nodeInfo: [
                            {nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3}
                        ],
                        diskInfo: [
                            {diskType: 'ssd', diskSize: 512, diskCount: 10}
                        ]
                    }
                ];
                break;
            // ... 其他模板配置保持不变 ...

            default:
                break;
        }

        form.setFieldsValue(values);
        message.success(`已应用${template}配置模板`);
    };

    const templateButtons = [
        '3NODE_1Client', '3NODE_3Client', '3NODE_1DPC', '3NODE_3DPC',
        '6NODE_1Client', '9NODE_1Client', '9000纳管',
        '3NODE_1FI', '3NODE_HDFS_FI', '3NODE_CONVERGE_FI', '3NODE_CONVERGE_HDFS_FI',
        '2DC', '3DC', '2GFS', '3GFS'
    ];

    return (
        <div style={{display: 'flex', gap: 16}}>
            <div style={{flex: 3}}>
                <Form
                    form={form}
                    name="createEnvironment"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    onValuesChange={handleClusterChange}
                >
                    <h2>创建新环境</h2>
                    <Form.List name="clusterInfo">
                        {(fields, {add, remove}) => (
                            <>
                                {fields.map(({key, name, ...restField}) => {
                                    const businessType = form.getFieldValue(['clusterInfo', name, 'businessType']);
                                    const showDiskInfo = hasStorageNode(name);
                                    const nodeTypeOptions = getNodeTypeOptions(businessType);
                                    const isNAS = businessType === 'nas';

                                    return (
                                        <div key={key} style={{
                                            marginBottom: 16,
                                            border: '1px solid #d9d9d9',
                                            padding: 16,
                                            borderRadius: 4
                                        }}>
                                            <Space direction="vertical" style={{width: '100%'}}>
                                                <Row gutter={16}>
                                                    <Col span={24}>
                                                        <Form.Item
                                                            {...restField}
                                                            label="集群名称"
                                                            name={[name, 'clusterName']}
                                                            rules={[{required: true, message: '请输入集群名称!'}]}
                                                        >
                                                            <Input placeholder="请输入集群名称"/>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                        <Form.Item
                                                            {...restField}
                                                            label="业务大类"
                                                            name={[name, 'businessType']}
                                                            rules={[{required: true, message: '请选择业务大类!'}]}
                                                        >
                                                            <Select placeholder="请选择业务大类">
                                                                <Option value="block">Block</Option>
                                                                <Option value="nas">NAS</Option>
                                                                <Option value="dme">DME</Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item
                                                            {...restField}
                                                            label="平台"
                                                            name={[name, 'platform']}
                                                            rules={[{required: true, message: '请选择平台!'}]}
                                                        >
                                                            <Select placeholder="请选择平台">
                                                                <Option value="x86">x86</Option>
                                                                <Option value="arm">ARM</Option>
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                {/* NAS业务显示网卡信息 */}
                                                {isNAS && (
                                                    <Form.Item label="网卡信息" style={{
                                                        background: '#f9f9f9',
                                                        padding: 16,
                                                        borderRadius: 4
                                                    }}>
                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    label="网卡数量"
                                                                    name={[name, 'networkInfo', 'nicCount']}
                                                                    initialValue={4}
                                                                    rules={[{
                                                                        required: true,
                                                                        message: '请输入网卡数量!',
                                                                        type: 'number',
                                                                        min: 1,
                                                                        max: 4,
                                                                    }]}
                                                                >
                                                                    <InputNumber
                                                                        placeholder="1-4"
                                                                        style={{width: '100%'}}
                                                                        min={1}
                                                                        max={4}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    label="网卡类型"
                                                                    name={[name, 'networkInfo', 'nicType']}
                                                                    initialValue="tcp"
                                                                    rules={[{
                                                                        required: true,
                                                                        message: '请选择网卡类型!'
                                                                    }]}
                                                                >
                                                                    <Select placeholder="选择网卡类型">
                                                                        <Option value="tcp">TCP</Option>
                                                                        <Option value="roce">ROCE</Option>
                                                                    </Select>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    label="业务网络IP数量"
                                                                    name={[name, 'networkInfo', 'ipCount']}
                                                                    initialValue={5}
                                                                    rules={[{
                                                                        required: true,
                                                                        message: '请输入IP数量!',
                                                                        type: 'number',
                                                                        min: 3,
                                                                        max: 8,
                                                                    }]}
                                                                >
                                                                    <InputNumber
                                                                        placeholder="3-8"
                                                                        style={{width: '100%'}}
                                                                        min={3}
                                                                        max={8}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    </Form.Item>
                                                )}

                                                {/* 节点信息动态表单 */}
                                                <Form.Item label="节点信息">
                                                    <Form.List name={[name, 'nodeInfo']}>
                                                        {(nodeFields, nodeOperations) => (
                                                            <>
                                                                {nodeFields.map(({
                                                                                     key: nodeKey,
                                                                                     name: nodeName,
                                                                                     ...nodeRestField
                                                                                 }) => {
                                                                    const nodeType = form.getFieldValue(['clusterInfo', name, 'nodeInfo', nodeName, 'nodeType']);

                                                                    return (
                                                                        <div key={nodeKey} style={{
                                                                            marginBottom: 16,
                                                                            padding: 8,
                                                                            background: '#f5f5f5',
                                                                            borderRadius: 4
                                                                        }}>
                                                                            <Space direction="vertical"
                                                                                   style={{width: '100%'}}>
                                                                                <Space align="baseline">
                                                                                    <Form.Item
                                                                                        {...nodeRestField}
                                                                                        name={[nodeName, 'nodeType']}
                                                                                        rules={[{
                                                                                            required: true,
                                                                                            message: '请选择节点大类!'
                                                                                        }]}
                                                                                    >
                                                                                        <Select
                                                                                            placeholder="选择节点大类"
                                                                                            style={{width: 200}}
                                                                                            onChange={() => {
                                                                                                // 清除相关字段当节点类型变化时
                                                                                                form.setFieldsValue({
                                                                                                    clusterInfo: {
                                                                                                        [name]: {
                                                                                                            nodeInfo: {
                                                                                                                [nodeName]: {
                                                                                                                    nodeRole: undefined,
                                                                                                                    nodeCount: undefined,
                                                                                                                    clientServices: []
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                });
                                                                                            }}
                                                                                        >
                                                                                            {nodeTypeOptions}
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <MinusCircleOutlined
                                                                                        onClick={() => nodeOperations.remove(nodeName)}/>
                                                                                </Space>

                                                                                {nodeType === 'storage' && (
                                                                                    <Row gutter={16}>
                                                                                        <Col span={12}>
                                                                                            <Form.Item
                                                                                                {...nodeRestField}
                                                                                                label="节点角色"
                                                                                                name={[nodeName, 'nodeRole']}
                                                                                                rules={[{
                                                                                                    required: true,
                                                                                                    message: '请选择节点角色!'
                                                                                                }]}
                                                                                            >
                                                                                                <Select
                                                                                                    placeholder="选择节点角色">
                                                                                                    <Option
                                                                                                        value="fsm">FSM</Option>
                                                                                                    <Option
                                                                                                        value="fsa">FSA</Option>
                                                                                                </Select>
                                                                                            </Form.Item>
                                                                                        </Col>
                                                                                        <Col span={12}>
                                                                                            <Form.Item
                                                                                                {...nodeRestField}
                                                                                                label="节点数量"
                                                                                                name={[nodeName, 'nodeCount']}
                                                                                                rules={[{
                                                                                                    required: true,
                                                                                                    message: '请输入节点数量!',
                                                                                                    type: 'number',
                                                                                                    min: 1,
                                                                                                    max: 100,
                                                                                                }]}
                                                                                            >
                                                                                                <InputNumber
                                                                                                    placeholder="输入节点数量"
                                                                                                    style={{width: '100%'}}
                                                                                                    min={1}
                                                                                                    max={100}
                                                                                                />
                                                                                            </Form.Item>
                                                                                        </Col>
                                                                                    </Row>
                                                                                )}

                                                                                {nodeType === 'client' && (
                                                                                    <>
                                                                                        <Row gutter={16}>
                                                                                            <Col span={12}>
                                                                                                <Form.Item
                                                                                                    {...nodeRestField}
                                                                                                    label="业务服务"
                                                                                                    name={[nodeName, 'clientServices']}
                                                                                                    rules={[{
                                                                                                        required: true,
                                                                                                        message: '请至少选择一项业务服务!',
                                                                                                        type: 'array',
                                                                                                        min: 1,
                                                                                                    }]}
                                                                                                >
                                                                                                    <Checkbox.Group>
                                                                                                        <Row
                                                                                                            gutter={16}>
                                                                                                            <Col
                                                                                                                span={6}>
                                                                                                                <Checkbox
                                                                                                                    value="nfs">NFS</Checkbox>
                                                                                                            </Col>
                                                                                                            <Col
                                                                                                                span={6}>
                                                                                                                <Checkbox
                                                                                                                    value="obs">OBS</Checkbox>
                                                                                                            </Col>
                                                                                                            <Col
                                                                                                                span={6}>
                                                                                                                <Checkbox
                                                                                                                    value="dpc">DPC</Checkbox>
                                                                                                            </Col>
                                                                                                            <Col
                                                                                                                span={6}>
                                                                                                                <Checkbox
                                                                                                                    value="fi">FI</Checkbox>
                                                                                                            </Col>
                                                                                                        </Row>
                                                                                                    </Checkbox.Group>
                                                                                                </Form.Item>
                                                                                            </Col>
                                                                                            <Col span={12}>
                                                                                                <Form.Item
                                                                                                    {...nodeRestField}
                                                                                                    label="节点数量"
                                                                                                    name={[nodeName, 'nodeCount']}
                                                                                                    rules={[{
                                                                                                        required: true,
                                                                                                        message: '请输入节点数量!',
                                                                                                        type: 'number',
                                                                                                        min: 1,
                                                                                                        max: 100,
                                                                                                    }]}
                                                                                                >
                                                                                                    <InputNumber
                                                                                                        placeholder="输入节点数量"
                                                                                                        style={{width: '100%'}}
                                                                                                        min={1}
                                                                                                        max={100}
                                                                                                    />
                                                                                                </Form.Item>
                                                                                            </Col>
                                                                                        </Row>
                                                                                    </>
                                                                                )}
                                                                            </Space>
                                                                        </div>
                                                                    );
                                                                })}
                                                                <Form.Item>
                                                                    <Button
                                                                        type="dashed"
                                                                        onClick={() => nodeOperations.add({nodeType: undefined})}
                                                                        icon={<PlusOutlined/>}
                                                                        block
                                                                        disabled={businessType === 'dme' &&
                                                                            form.getFieldValue(['clusterInfo', name, 'nodeInfo'])?.length > 0}
                                                                    >
                                                                        添加节点
                                                                    </Button>
                                                                </Form.Item>
                                                            </>
                                                        )}
                                                    </Form.List>
                                                </Form.Item>

                                                {/* 硬盘信息 */}
                                                {showDiskInfo && (
                                                    <Form.Item label="硬盘信息">
                                                        <Form.List name={[name, 'diskInfo']}>
                                                            {(diskFields, diskOperations) => (
                                                                <>
                                                                    {diskFields.map(({
                                                                                         key: diskKey,
                                                                                         name: diskName,
                                                                                         ...diskRestField
                                                                                     }) => (
                                                                        <div key={diskKey} style={{
                                                                            marginBottom: 16,
                                                                            padding: 8,
                                                                            background: '#f0f0f0',
                                                                            borderRadius: 4
                                                                        }}>
                                                                            <Space direction="vertical"
                                                                                   style={{width: '100%'}}>
                                                                                <Row gutter={16}>
                                                                                    <Col span={8}>
                                                                                        <Form.Item
                                                                                            {...diskRestField}
                                                                                            label="硬盘类型"
                                                                                            name={[diskName, 'diskType']}
                                                                                            rules={[{
                                                                                                required: true,
                                                                                                message: '请选择硬盘类型!'
                                                                                            }]}
                                                                                        >
                                                                                            <Select
                                                                                                placeholder="选择硬盘类型">
                                                                                                <Option
                                                                                                    value="ssd">SSD</Option>
                                                                                                <Option
                                                                                                    value="hdd">HDD</Option>
                                                                                                <Option
                                                                                                    value="nvme">NVMe</Option>
                                                                                            </Select>
                                                                                        </Form.Item>
                                                                                    </Col>
                                                                                    <Col span={8}>
                                                                                        <Form.Item
                                                                                            {...diskRestField}
                                                                                            label="硬盘容量(GB)"
                                                                                            name={[diskName, 'diskSize']}
                                                                                            rules={[{
                                                                                                required: true,
                                                                                                message: '请输入硬盘容量!',
                                                                                                type: 'number',
                                                                                                min: 1,
                                                                                                max: 32768,
                                                                                            }]}
                                                                                        >
                                                                                            <InputNumber
                                                                                                placeholder="输入容量"
                                                                                                style={{width: '100%'}}
                                                                                                min={1}
                                                                                                max={32768}
                                                                                            />
                                                                                        </Form.Item>
                                                                                    </Col>
                                                                                    <Col span={7}>
                                                                                        <Form.Item
                                                                                            {...diskRestField}
                                                                                            label="硬盘数量"
                                                                                            name={[diskName, 'diskCount']}
                                                                                            rules={[{
                                                                                                required: true,
                                                                                                message: '请输入硬盘数量!',
                                                                                                type: 'number',
                                                                                                min: 1,
                                                                                                max: 100,
                                                                                            }]}
                                                                                        >
                                                                                            <InputNumber
                                                                                                placeholder="输入数量"
                                                                                                style={{width: '100%'}}
                                                                                                min={1}
                                                                                                max={100}
                                                                                            />
                                                                                        </Form.Item>
                                                                                    </Col>
                                                                                    <Col span={1}>
                                                                                        <MinusCircleOutlined
                                                                                            style={{marginTop: 30}}
                                                                                            onClick={() => diskOperations.remove(diskName)}
                                                                                        />
                                                                                    </Col>
                                                                                </Row>
                                                                            </Space>
                                                                        </div>
                                                                    ))}
                                                                    <Form.Item>
                                                                        <Button
                                                                            type="dashed"
                                                                            onClick={() => diskOperations.add({
                                                                                diskType: undefined,
                                                                                diskSize: undefined,
                                                                                diskCount: undefined
                                                                            })}
                                                                            icon={<PlusOutlined/>}
                                                                            block
                                                                        >
                                                                            添加硬盘
                                                                        </Button>
                                                                    </Form.Item>
                                                                </>
                                                            )}
                                                        </Form.List>
                                                    </Form.Item>
                                                )}

                                                {fields.length > 1 && (
                                                    <MinusCircleOutlined
                                                        style={{fontSize: 16, color: '#ff4d4f'}}
                                                        onClick={() => remove(name)}
                                                    />
                                                )}
                                            </Space>
                                        </div>
                                    );
                                })}

                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add({
                                            clusterName: '',
                                            businessType: undefined,
                                            platform: undefined,
                                            nodeInfo: [{
                                                nodeType: undefined
                                            }]
                                        })}
                                        block
                                        icon={<PlusOutlined/>}
                                    >
                                        添加集群信息
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    {clusterCount >= 2 && (
                        <Form.Item
                            label="合一环境名称"
                            name="combinedEnvName"
                            rules={[{required: true, message: '请输入合一环境名称!'}]}
                        >
                            <Input placeholder="请输入多个集群合并后的环境名称"/>
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{marginRight: 16}}>
                            提交
                        </Button>
                        <Button htmlType="button" onClick={() => form.resetFields()}>
                            重置
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div style={{flex: 1}}>
                <Card title="典型配置" style={{position: 'sticky', top: 16}}>
                    <Space direction="vertical" style={{width: '100%'}}>
                        {templateButtons.map(template => (
                            <Button
                                key={template}
                                block
                                style={{textAlign: 'left'}}
                                onClick={() => applyTemplate(template)}
                            >
                                {template}
                            </Button>
                        ))}
                    </Space>
                </Card>
            </div>
        </div>
    );
};

export default EnvironmentCreateForm;