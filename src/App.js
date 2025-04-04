import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Select, Row, Col, message, Space, InputNumber, Checkbox, Card, Upload, Modal } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, StarOutlined, StarFilled, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const EnvironmentCreateForm = () => {
    const [form] = Form.useForm();
    const [clusterCount, setClusterCount] = useState(0);
    const [favoriteConfigs, setFavoriteConfigs] = useState([]);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [nodeStats, setNodeStats] = useState([]);
    const [isFavoriteModalVisible, setIsFavoriteModalVisible] = useState(false);
    const [favoriteName, setFavoriteName] = useState('');

    // 初始化默认展示一个集群
    useEffect(() => {
        form.setFieldsValue({
            clusterInfo: [{
                clusterName: '',
                businessType: undefined,
                platform: undefined,
                storageImage: undefined,
                clientImage: undefined,
                nodeInfo: [{
                    nodeType: undefined
                }]
            }]
        });
        setClusterCount(1);
        setNodeStats([{ storageCount: 0, clientCount: 0 }]);

        // 加载本地收藏的配置
        const savedFavorites = localStorage.getItem('favoriteConfigs');
        if (savedFavorites) {
            setFavoriteConfigs(JSON.parse(savedFavorites));
        }
    }, [form]);

    // 计算节点统计信息
    const calculateNodeStats = (allValues) => {
        if (!allValues.clusterInfo) return [];

        return allValues.clusterInfo.map(cluster => {
            const nodeInfo = cluster.nodeInfo || [];
            const storageCount = nodeInfo
                .filter(node => node?.nodeType === 'storage')
                .reduce((sum, node) => sum + (node.nodeCount || 0), 0);

            const clientCount = nodeInfo
                .filter(node => node?.nodeType === 'client')
                .reduce((sum, node) => sum + (node.nodeCount || 0), 0);

            return { storageCount, clientCount };
        });
    };

    const onFinish = (values) => {
        console.log('Received values of form: ', values);
        message.success('环境创建成功！');
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('请检查表单填写是否正确！');
    };

    const handleClusterChange = (changedValues, allValues) => {
        const count = allValues.clusterInfo?.length || 0;
        setClusterCount(count);
        setNodeStats(calculateNodeStats(allValues));

        // 处理业务类型变化的情况
        if (changedValues.clusterInfo) {
            allValues.clusterInfo.forEach((cluster, clusterIndex) => {
                const currentBusinessType = changedValues.clusterInfo[clusterIndex]?.businessType;
                const prevBusinessType = form.getFieldValue(['clusterInfo', clusterIndex, 'businessType']);

                if (currentBusinessType && currentBusinessType !== prevBusinessType) {
                    const nodeInfo = form.getFieldValue(['clusterInfo', clusterIndex, 'nodeInfo']) || [];
                    let nodesToRemove = [];

                    if (currentBusinessType === 'block') {
                        nodesToRemove = nodeInfo.filter(node => node?.nodeType === 'client');
                    } else if (currentBusinessType === 'dme') {
                        nodesToRemove = nodeInfo.filter(node => node?.nodeType === 'storage');
                    }

                    if (nodesToRemove.length > 0) {
                        Modal.confirm({
                            title: '确认切换业务类型?',
                            content: `切换为${currentBusinessType.toUpperCase()}将移除${nodesToRemove.length}个不兼容的节点`,
                            okText: '确认',
                            cancelText: '取消',
                            onOk: () => {
                                const updatedNodeInfo = nodeInfo.filter(node =>
                                    !nodesToRemove.includes(node)
                                );
                                form.setFieldsValue({
                                    clusterInfo: {
                                        [clusterIndex]: {
                                            nodeInfo: updatedNodeInfo,
                                            businessType: currentBusinessType
                                        }
                                    }
                                });
                                message.warning(
                                    `已自动移除${nodesToRemove.length}个${currentBusinessType === 'block' ? '客户端' : '存储'}节点`
                                );
                            },
                            onCancel: () => {
                                // 取消则恢复原来的业务类型
                                form.setFieldsValue({
                                    clusterInfo: {
                                        [clusterIndex]: {
                                            businessType: prevBusinessType
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        // 没有需要移除的节点，直接更新业务类型
                        form.setFieldsValue({
                            clusterInfo: {
                                [clusterIndex]: {
                                    businessType: currentBusinessType
                                }
                            }
                        });
                    }
                }
            });
        }
    };

    const getNodeTypeOptions = (businessType) => {
        switch(businessType) {
            case 'block':
                return [<Option key="storage" value="storage">存储</Option>];
            case 'dme':
                return [<Option key="client" value="client">客户端</Option>];
            default: // NAS或其他
                return [
                    <Option key="storage" value="storage">存储</Option>,
                    <Option key="client" value="client">客户端</Option>
                ];
        }
    };

    const getStorageImageOptions = (businessType) => {
        if (businessType === 'dme') {
            return [<Option key="euler12" value="euler12">Euler 12</Option>];
        }
        return [
            <Option key="euler8" value="euler8">Euler 8</Option>,
            <Option key="euler9" value="euler9">Euler 9</Option>
        ];
    };

    const getClientImageOptions = (businessType) => {
        if (businessType === 'dme') {
            return [<Option key="euler12" value="euler12">Euler 12</Option>];
        }
        return [
            <Option key="ubuntu" value="ubuntu">Ubuntu</Option>,
            <Option key="centos77" value="centos77">CentOS 7.7</Option>
        ];
    };

    const applyTemplate = (template, config) => {
        if (config) {
            form.setFieldsValue(config.configData);
            setNodeStats(calculateNodeStats(config.configData));
            message.success(`已应用自定义配置: ${config.configName}`);
            setActiveTemplate(`custom_${config.configName}`);
        } else {
            let values = {
                clusterInfo: [],
                combinedEnvName: `${template}配置`
            };

            switch(template) {
                case '3NODE_1Client':
                    values.clusterInfo = [{
                        clusterName: '3节点存储集群',
                        businessType: 'nas',
                        platform: 'x86',
                        storageImage: 'euler8',
                        clientImage: 'ubuntu',
                        nodeInfo: [
                            { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2 },
                            { nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1 },
                            { nodeType: 'client', clientServices: ['nfs'], nodeCount: 1 }
                        ],
                        diskInfo: [
                            { diskType: 'ssd', diskSize: 512, diskCount: 10 }
                        ],
                        networkInfo: {
                            nicCount: 4,
                            nicType: 'tcp',
                            ipCount: 5
                        }
                    }];
                    break;
                case 'BLOCK_Template':
                    values.clusterInfo = [{
                        clusterName: 'BLOCK集群',
                        businessType: 'block',
                        platform: 'x86',
                        storageImage: 'euler8',
                        nodeInfo: [
                            { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3 }
                        ],
                        diskInfo: [
                            { diskType: 'ssd', diskSize: 512, diskCount: 12 }
                        ],
                        networkInfo: {
                            nicCount: 4,
                            nicType: 'tcp',
                            ipCount: 5
                        }
                    }];
                    break;
                case 'DME_Template':
                    values.clusterInfo = [{
                        clusterName: 'DME集群',
                        businessType: 'dme',
                        platform: 'x86',
                        clientImage: 'euler12',
                        nodeInfo: [
                            { nodeType: 'client', clientServices: ['nfs'], nodeCount: 2 }
                        ]
                    }];
                    break;
            }

            form.setFieldsValue(values);
            setNodeStats(calculateNodeStats(values));
            message.success(`已应用${template}配置模板`);
            setActiveTemplate(template);
        }
    };

    const exportConfig = () => {
        const values = form.getFieldsValue();
        const blob = new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `集群配置_${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importConfig = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                form.setFieldsValue(config);
                setNodeStats(calculateNodeStats(config));
                message.success('配置导入成功');
            } catch (error) {
                message.error('配置文件格式错误');
            }
        };
        reader.readAsText(file);
        return false;
    };

    const saveAsFavorite = () => {
        setIsFavoriteModalVisible(true);
    };

    const handleFavoriteOk = () => {
        if (!favoriteName.trim()) {
            message.warning('请输入配置名称!');
            return;
        }

        const values = form.getFieldsValue();
        const newFavorite = {
            configName: favoriteName,
            configData: values,
            isFavorite: true,
            timestamp: new Date().toISOString()
        };

        const updatedFavorites = [...favoriteConfigs, newFavorite];
        setFavoriteConfigs(updatedFavorites);
        localStorage.setItem('favoriteConfigs', JSON.stringify(updatedFavorites));
        message.success('配置已收藏');
        setFavoriteName('');
        setIsFavoriteModalVisible(false);
    };

    const handleFavoriteCancel = () => {
        setIsFavoriteModalVisible(false);
        setFavoriteName('');
    };

    const removeFavorite = (index) => {
        const updatedFavorites = [...favoriteConfigs];
        updatedFavorites.splice(index, 1);
        setFavoriteConfigs(updatedFavorites);
        localStorage.setItem('favoriteConfigs', JSON.stringify(updatedFavorites));
        message.success('配置已移除收藏');
    };

    const toggleFavorite = (index) => {
        const updatedFavorites = [...favoriteConfigs];
        updatedFavorites[index].isFavorite = !updatedFavorites[index].isFavorite;
        setFavoriteConfigs(updatedFavorites);
        localStorage.setItem('favoriteConfigs', JSON.stringify(updatedFavorites));
    };

    const templateButtons = [
        '3NODE_1Client', '3NODE_3Client', '3NODE_1DPC', '3NODE_3DPC',
        '6NODE_1Client', '9NODE_1Client', '9000纳管',
        '3NODE_1FI', '3NODE_HDFS_FI', '3NODE_CONVERGE_FI', '3NODE_CONVERGE_HDFS_FI',
        '2DC', '3DC', '2GFS', '3GFS', 'BLOCK_Template', 'DME_Template'
    ];

    const ClusterHeader = ({ clusterIndex, stats, onRemove }) => (
        <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: '#f0f0f0',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12
        }}>
            <span style={{ marginRight: 8 }}>集群 #{clusterIndex}</span>
            <span style={{ marginRight: 8 }}>存储: {stats.storageCount}</span>
            <span>客户端: {stats.clientCount}</span>
            {onRemove && (
                <MinusCircleOutlined
                    style={{ fontSize: 14, color: '#ff4d4f', marginLeft: 8 }}
                    onClick={onRemove}
                />
            )}
        </div>
    );

    const StorageNodeConfig = ({ nodeName, nodeRestField }) => (
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                    {...nodeRestField}
                    label="节点角色"
                    name={[nodeName, 'nodeRole']}
                    rules={[{ required: true, message: '请选择节点角色!' }]}
                >
                    <Select placeholder="选择节点角色">
                        <Option value="fsm">FSM</Option>
                        <Option value="fsa">FSA</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    {...nodeRestField}
                    label="节点数量"
                    name={[nodeName, 'nodeCount']}
                    rules={[{ required: true, message: '请输入节点数量!', type: 'number', min: 1, max: 100 }]}
                >
                    <InputNumber placeholder="输入节点数量" style={{ width: '100%' }} min={1} max={100} />
                </Form.Item>
            </Col>
        </Row>
    );

    const ClientNodeConfig = ({ nodeName, nodeRestField }) => (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        {...nodeRestField}
                        label="业务服务"
                        name={[nodeName, 'clientServices']}
                        rules={[{ required: true, message: '请至少选择一项业务服务!', type: 'array', min: 1 }]}
                    >
                        <Checkbox.Group>
                            <Row gutter={8}>
                                <Col span={6}><Checkbox value="nfs">NFS</Checkbox></Col>
                                <Col span={6}><Checkbox value="obs">OBS</Checkbox></Col>
                                <Col span={6}><Checkbox value="dpc">DPC</Checkbox></Col>
                                <Col span={6}><Checkbox value="fi">FI</Checkbox></Col>
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        {...nodeRestField}
                        label="节点数量"
                        name={[nodeName, 'nodeCount']}
                        rules={[{ required: true, message: '请输入节点数量!', type: 'number', min: 1, max: 100 }]}
                    >
                        <InputNumber placeholder="输入节点数量" style={{ width: '100%' }} min={1} max={100} />
                    </Form.Item>
                </Col>
            </Row>
        </>
    );

    const NodeItem = ({ nodeName, nodeRestField, nodeTypeOptions, businessType, form, clusterName, onRemove }) => {
        const nodeType = Form.useWatch(['clusterInfo', clusterName, 'nodeInfo', nodeName, 'nodeType'], form);

        const resetNodeFields = () => {
            form.setFieldsValue({
                clusterInfo: {
                    [clusterName]: {
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
        };

        return (
            <div style={{ marginBottom: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Space align="baseline" style={{ marginBottom: 4 }}>
                        <Form.Item
                            {...nodeRestField}
                            name={[nodeName, 'nodeType']}
                            rules={[{ required: true, message: '请选择节点大类!' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Select
                                placeholder="选择节点大类"
                                style={{ width: 200 }}
                                onChange={resetNodeFields}
                            >
                                {nodeTypeOptions}
                            </Select>
                        </Form.Item>
                        <MinusCircleOutlined
                            style={{ fontSize: 14, color: '#ff4d4f' }}
                            onClick={onRemove}
                        />
                    </Space>

                    {nodeType === 'storage' && <StorageNodeConfig nodeName={nodeName} nodeRestField={nodeRestField} />}
                    {nodeType === 'client' && <ClientNodeConfig nodeName={nodeName} nodeRestField={nodeRestField} />}
                </Space>
            </div>
        );
    };

    const DiskItem = ({ diskName, diskRestField, onRemove }) => (
        <div style={{ marginBottom: 8, padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        {...diskRestField}
                        label="硬盘类型"
                        name={[diskName, 'diskType']}
                        rules={[{ required: true, message: '请选择硬盘类型!' }]}
                    >
                        <Select placeholder="选择硬盘类型">
                            <Option value="ssd">SSD</Option>
                            <Option value="hdd">HDD</Option>
                            <Option value="nvme">NVMe</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        {...diskRestField}
                        label="硬盘容量(GB)"
                        name={[diskName, 'diskSize']}
                        rules={[{ required: true, message: '请输入硬盘容量!', type: 'number', min: 1, max: 32768 }]}
                    >
                        <InputNumber placeholder="输入容量" style={{ width: '100%' }} min={1} max={32768} />
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item
                        {...diskRestField}
                        label="硬盘数量"
                        name={[diskName, 'diskCount']}
                        rules={[{ required: true, message: '请输入硬盘数量!', type: 'number', min: 1, max: 100 }]}
                    >
                        <InputNumber placeholder="输入数量" style={{ width: '100%' }} min={1} max={100} />
                    </Form.Item>
                </Col>
                <Col span={1}>
                    <MinusCircleOutlined
                        style={{ marginTop: 24, fontSize: 14, color: '#ff4d4f' }}
                        onClick={onRemove}
                    />
                </Col>
            </Row>
        </div>
    );

    const ClusterBasicInfo = ({ name, restField }) => (
        <>
            <Row gutter={16} style={{ marginBottom: 8 }}>
                <Col span={24}>
                    <Form.Item
                        {...restField}
                        label="集群名称"
                        name={[name, 'clusterName']}
                        rules={[{ required: true, message: '请输入集群名称!' }]}
                        style={{ marginBottom: 8 }}
                    >
                        <Input placeholder="请输入集群名称" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 8 }}>
                <Col span={12}>
                    <Form.Item
                        {...restField}
                        label="业务大类"
                        name={[name, 'businessType']}
                        rules={[{ required: true, message: '请选择业务大类!' }]}
                        style={{ marginBottom: 8 }}
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
                        rules={[{ required: true, message: '请选择平台!' }]}
                        style={{ marginBottom: 8 }}
                    >
                        <Select placeholder="请选择平台">
                            <Option value="x86">x86</Option>
                            <Option value="arm">ARM</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
        </>
    );

    const ClusterImageConfig = ({ name, restField, businessType, hasStorageNode }) => (
        <Row gutter={16} style={{ marginBottom: 8 }}>
            {hasStorageNode && (
                <Col span={12}>
                    <Form.Item
                        {...restField}
                        label="存储镜像"
                        name={[name, 'storageImage']}
                        rules={[{ required: true, message: '请选择存储镜像!' }]}
                        style={{ marginBottom: 8 }}
                    >
                        <Select placeholder="选择存储镜像版本">
                            {getStorageImageOptions(businessType)}
                        </Select>
                    </Form.Item>
                </Col>
            )}
            <Col span={hasStorageNode ? 12 : 24}>
                <Form.Item
                    {...restField}
                    label="客户端镜像"
                    name={[name, 'clientImage']}
                    rules={[{ required: true, message: '请选择客户端镜像!' }]}
                    style={{ marginBottom: 8 }}
                >
                    <Select placeholder="选择客户端镜像版本">
                        {getClientImageOptions(businessType)}
                    </Select>
                </Form.Item>
            </Col>
        </Row>
    );

    const NodeInfoSection = ({ name, restField, businessType, form }) => {
        const nodeTypeOptions = getNodeTypeOptions(businessType);

        return (
            <Form.Item label="节点信息" style={{ marginBottom: 8 }}>
                <Form.List name={[name, 'nodeInfo']}>
                    {(nodeFields, nodeOperations) => (
                        <>
                            {nodeFields.map(({ key: nodeKey, name: nodeName, ...nodeRestField }) => (
                                <NodeItem
                                    key={nodeKey}
                                    nodeName={nodeName}
                                    nodeRestField={nodeRestField}
                                    nodeTypeOptions={nodeTypeOptions}
                                    businessType={businessType}
                                    form={form}
                                    clusterName={name}
                                    onRemove={() => nodeOperations.remove(nodeName)}
                                />
                            ))}
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="dashed"
                                    onClick={() => nodeOperations.add({ nodeType: businessType === 'dme' ? 'client' : 'storage' })}
                                    icon={<PlusOutlined />}
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
        );
    };

    const StorageDiskInfo = ({ name, restField, hasStorageNode }) => {
        if (!hasStorageNode) return null;

        return (
            <Form.Item label="存储硬盘信息" style={{ marginBottom: 8 }}>
                <Form.List name={[name, 'diskInfo']}>
                    {(diskFields, diskOperations) => (
                        <>
                            {diskFields.map(({ key: diskKey, name: diskName, ...diskRestField }) => (
                                <DiskItem
                                    key={diskKey}
                                    diskName={diskName}
                                    diskRestField={diskRestField}
                                    onRemove={() => diskOperations.remove(diskName)}
                                />
                            ))}
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="dashed"
                                    onClick={() => diskOperations.add({
                                        diskType: undefined,
                                        diskSize: undefined,
                                        diskCount: undefined
                                    })}
                                    icon={<PlusOutlined />}
                                    block
                                >
                                    添加硬盘
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form.Item>
        );
    };

    const StorageNetworkInfo = ({ name, restField, hasStorageNode }) => {
        if (!hasStorageNode) return null;

        return (
            <Form.Item label="存储网卡信息" style={{
                background: '#f9f9f9',
                padding: 12,
                borderRadius: 4,
                marginBottom: 8
            }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            {...restField}
                            label="网卡数量"
                            name={[name, 'networkInfo', 'nicCount']}
                            initialValue={4}
                            rules={[{ required: true, message: '请输入网卡数量!', type: 'number', min: 1, max: 4 }]}
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber placeholder="1-4" style={{ width: '100%' }} min={1} max={4} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            {...restField}
                            label="网卡类型"
                            name={[name, 'networkInfo', 'nicType']}
                            initialValue="tcp"
                            rules={[{ required: true, message: '请选择网卡类型!' }]}
                            style={{ marginBottom: 0 }}
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
                            rules={[{ required: true, message: '请输入IP数量!', type: 'number', min: 3, max: 8 }]}
                            style={{ marginBottom: 0 }}
                        >
                            <InputNumber placeholder="3-8" style={{ width: '100%' }} min={3} max={8} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form.Item>
        );
    };

    const ClusterCard = ({ name, restField, form, nodeStats, onRemoveCluster }) => {
        const businessType = Form.useWatch(['clusterInfo', name, 'businessType'], form);
        const hasStorageNode = useCallback(() => {
            const nodeInfo = form.getFieldValue(['clusterInfo', name, 'nodeInfo']);
            return nodeInfo?.some(node => node?.nodeType === 'storage');
        }, [form, name]);

        return (
            <div style={{
                marginBottom: 12,
                border: '1px solid #d9d9d9',
                padding: 12,
                borderRadius: 4,
                position: 'relative'
            }}>
                <ClusterHeader
                    clusterIndex={name + 1}
                    stats={nodeStats[name] || { storageCount: 0, clientCount: 0 }}
                    onRemove={onRemoveCluster}
                />

                <ClusterBasicInfo name={name} restField={restField} />
                <ClusterImageConfig
                    name={name}
                    restField={restField}
                    businessType={businessType}
                    hasStorageNode={hasStorageNode()}
                />
                <NodeInfoSection
                    name={name}
                    restField={restField}
                    businessType={businessType}
                    form={form}
                />
                <StorageDiskInfo
                    name={name}
                    restField={restField}
                    hasStorageNode={hasStorageNode()}
                />
                <StorageNetworkInfo
                    name={name}
                    restField={restField}
                    hasStorageNode={hasStorageNode()}
                />
            </div>
        );
    };

    const TemplatePanel = ({
                               templateButtons,
                               activeTemplate,
                               applyTemplate,
                               favoriteConfigs,
                               saveAsFavorite,
                               importConfig,
                               exportConfig,
                               toggleFavorite,
                               removeFavorite
                           }) => {
        return (
            <>
                <Card title="典型配置" style={{ marginBottom: 12 }} bodyStyle={{ padding: 12 }}>
                    <Row gutter={[8, 8]}>
                        {templateButtons.map(template => (
                            <Col span={12} key={template}>
                                <Button
                                    style={{ width: '100%' }}
                                    onClick={() => applyTemplate(template)}
                                    type={activeTemplate === template ? 'primary' : 'default'}
                                    size="small"
                                >
                                    {template}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                </Card>

                <Card
                    title="用户收藏配置"
                    style={{ marginBottom: 0 }}
                    bodyStyle={{ padding: 12 }}
                    extra={
                        <Space size="small">
                            <Button
                                icon={<StarOutlined />}
                                onClick={saveAsFavorite}
                                size="small"
                            >
                                收藏
                            </Button>
                            <Upload
                                beforeUpload={importConfig}
                                showUploadList={false}
                                accept=".json"
                            >
                                <Button icon={<UploadOutlined />} size="small">导入</Button>
                            </Upload>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={exportConfig}
                                size="small"
                            >
                                导出
                            </Button>
                        </Space>
                    }
                >
                    {favoriteConfigs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 8, color: '#999', fontSize: 12 }}>
                            暂无收藏配置
                        </div>
                    ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {favoriteConfigs.map((config, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: 8,
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 4,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: 12
                                    }}
                                >
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {config.configName}
                                    </span>
                                    <Space size="small">
                                        <Button
                                            type="text"
                                            icon={config.isFavorite ? <StarFilled style={{ color: '#faad14', fontSize: 12 }} /> : <StarOutlined style={{ fontSize: 12 }} />}
                                            onClick={() => toggleFavorite(index)}
                                            size="small"
                                        />
                                        <Button
                                            type="link"
                                            onClick={() => applyTemplate(null, config)}
                                            size="small"
                                            style={{ padding: 0 }}
                                        >
                                            应用
                                        </Button>
                                        <Button
                                            type="text"
                                            danger
                                            onClick={() => removeFavorite(index)}
                                            size="small"
                                            style={{ padding: 0 }}
                                        >
                                            删除
                                        </Button>
                                    </Space>
                                </div>
                            ))}
                        </Space>
                    )}
                </Card>
            </>
        );
    };

    return (
        <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 3 }}>
                <Form
                    form={form}
                    name="createEnvironment"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    onValuesChange={handleClusterChange}
                >
                    <h2 style={{ marginBottom: 12 }}>创建新环境</h2>
                    <Form.List name="clusterInfo">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <ClusterCard
                                        key={key}
                                        name={name}
                                        restField={restField}
                                        form={form}
                                        nodeStats={nodeStats}
                                        onRemoveCluster={fields.length > 1 ? () => remove(name) : null}
                                    />
                                ))}
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button
                                        type="dashed"
                                        onClick={() => {
                                            add({
                                                clusterName: '',
                                                businessType: undefined,
                                                platform: undefined,
                                                storageImage: undefined,
                                                clientImage: undefined,
                                                nodeInfo: [{ nodeType: undefined }]
                                            });
                                            setNodeStats([...nodeStats, { storageCount: 0, clientCount: 0 }]);
                                        }}
                                        block
                                        icon={<PlusOutlined />}
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
                            rules={[{ required: true, message: '请输入合一环境名称!' }]}
                            style={{ marginBottom: 12 }}
                        >
                            <Input placeholder="请输入多个集群合并后的环境名称" />
                        </Form.Item>
                    )}

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                提交
                            </Button>
                            <Button htmlType="button" onClick={() => form.resetFields()}>
                                重置
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <div style={{ flex: 1 }}>
                <TemplatePanel
                    templateButtons={templateButtons}
                    activeTemplate={activeTemplate}
                    applyTemplate={applyTemplate}
                    favoriteConfigs={favoriteConfigs}
                    saveAsFavorite={saveAsFavorite}
                    importConfig={importConfig}
                    exportConfig={exportConfig}
                    toggleFavorite={toggleFavorite}
                    removeFavorite={removeFavorite}
                />
            </div>

            {/* 收藏配置的Modal */}
            <Modal
                title="收藏当前配置"
                open={isFavoriteModalVisible}
                onOk={handleFavoriteOk}
                onCancel={handleFavoriteCancel}
                centered
                okText="保存"
                cancelText="取消"
            >
                <Input
                    placeholder="请输入配置名称"
                    value={favoriteName}
                    onChange={(e) => setFavoriteName(e.target.value)}
                    onPressEnter={handleFavoriteOk}
                />
            </Modal>
        </div>
    );
};

export default EnvironmentCreateForm;