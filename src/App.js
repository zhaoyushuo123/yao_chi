import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Row, Col, message, Space, InputNumber, Checkbox, Card, Upload } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, StarOutlined, StarFilled, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const EnvironmentCreateForm = () => {
    const [form] = Form.useForm();
    const [clusterCount, setClusterCount] = useState(0);
    const [favoriteConfigs, setFavoriteConfigs] = useState([]);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [nodeStats, setNodeStats] = useState([]);

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

    const handleClusterChange = (_, allValues) => {
        const count = allValues.clusterInfo?.length || 0;
        setClusterCount(count);
        setNodeStats(calculateNodeStats(allValues));
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

    // 应用配置模板
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

            // 模板配置逻辑保持不变
            switch(template) {
                case '3NODE_1Client':
                    values.clusterInfo = [{
                        clusterName: '3节点存储集群',
                        businessType: 'nas',
                        platform: 'x86',
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
                // 其他模板配置...
            }

            form.setFieldsValue(values);
            setNodeStats(calculateNodeStats(values));
            message.success(`已应用${template}配置模板`);
            setActiveTemplate(template);
        }
    };

    // 导出当前配置
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

    // 导入配置
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

    // 收藏当前配置
    const saveAsFavorite = () => {
        const values = form.getFieldsValue();
        const configName = prompt('请输入配置名称:');
        if (configName) {
            const newFavorite = {
                configName,
                configData: values,
                isFavorite: true,
                timestamp: new Date().toISOString()
            };

            const updatedFavorites = [...favoriteConfigs, newFavorite];
            setFavoriteConfigs(updatedFavorites);
            localStorage.setItem('favoriteConfigs', JSON.stringify(updatedFavorites));
            message.success('配置已收藏');
        }
    };

    // 移除收藏
    const removeFavorite = (index) => {
        const updatedFavorites = [...favoriteConfigs];
        updatedFavorites.splice(index, 1);
        setFavoriteConfigs(updatedFavorites);
        localStorage.setItem('favoriteConfigs', JSON.stringify(updatedFavorites));
        message.success('配置已移除收藏');
    };

    // 切换收藏状态
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
        '2DC', '3DC', '2GFS', '3GFS'
    ];

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
                    <h2>创建新环境</h2>
                    <Form.List name="clusterInfo">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => {
                                    const businessType = form.getFieldValue(['clusterInfo', name, 'businessType']);
                                    const showDiskInfo = hasStorageNode(name);
                                    const nodeTypeOptions = getNodeTypeOptions(businessType);
                                    const showNetworkInfo = hasStorageNode(name);
                                    const currentStats = nodeStats[name] || { storageCount: 0, clientCount: 0 };

                                    return (
                                        <div key={key} style={{ marginBottom: 16, border: '1px solid #d9d9d9', padding: 16, borderRadius: 4, position: 'relative' }}>
                                            {/* 集群计数和实时节点统计信息 */}
                                            <div style={{ position: 'absolute', top: 16, right: 16, background: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>
                                                <span style={{ marginRight: 8 }}>集群 #{name + 1}</span>
                                                <span style={{ marginRight: 8 }}>存储: {currentStats.storageCount}</span>
                                                <span>客户端: {currentStats.clientCount}</span>
                                            </div>

                                            <Row gutter={16}>
                                                <Col span={24}>
                                                    <Form.Item
                                                        {...restField}
                                                        label="集群名称"
                                                        name={[name, 'clusterName']}
                                                        rules={[{ required: true, message: '请输入集群名称!' }]}
                                                    >
                                                        <Input placeholder="请输入集群名称" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        label="业务大类"
                                                        name={[name, 'businessType']}
                                                        rules={[{ required: true, message: '请选择业务大类!' }]}
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
                                                    >
                                                        <Select placeholder="请选择平台">
                                                            <Option value="x86">x86</Option>
                                                            <Option value="arm">ARM</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            {/* 节点信息动态表单 */}
                                            <Form.Item label="节点信息">
                                                <Form.List name={[name, 'nodeInfo']}>
                                                    {(nodeFields, nodeOperations) => (
                                                        <>
                                                            {nodeFields.map(({ key: nodeKey, name: nodeName, ...nodeRestField }) => {
                                                                const nodeType = form.getFieldValue(['clusterInfo', name, 'nodeInfo', nodeName, 'nodeType']);

                                                                return (
                                                                    <div key={nodeKey} style={{ marginBottom: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                                                                        <Space direction="vertical" style={{ width: '100%' }}>
                                                                            <Space align="baseline">
                                                                                <Form.Item
                                                                                    {...nodeRestField}
                                                                                    name={[nodeName, 'nodeType']}
                                                                                    rules={[{ required: true, message: '请选择节点大类!' }]}
                                                                                >
                                                                                    <Select
                                                                                        placeholder="选择节点大类"
                                                                                        style={{ width: 200 }}
                                                                                        onChange={() => {
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
                                                                                <MinusCircleOutlined onClick={() => nodeOperations.remove(nodeName)} />
                                                                            </Space>

                                                                            {nodeType === 'storage' && (
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
                                                                                                style={{ width: '100%' }}
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
                                                                                                    <Row gutter={16}>
                                                                                                        <Col span={6}>
                                                                                                            <Checkbox value="nfs">NFS</Checkbox>
                                                                                                        </Col>
                                                                                                        <Col span={6}>
                                                                                                            <Checkbox value="obs">OBS</Checkbox>
                                                                                                        </Col>
                                                                                                        <Col span={6}>
                                                                                                            <Checkbox value="dpc">DPC</Checkbox>
                                                                                                        </Col>
                                                                                                        <Col span={6}>
                                                                                                            <Checkbox value="fi">FI</Checkbox>
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
                                                                                                    style={{ width: '100%' }}
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
                                                                    onClick={() => nodeOperations.add({ nodeType: undefined })}
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

                                            {/* 硬盘信息 */}
                                            {showDiskInfo && (
                                                <Form.Item label="硬盘信息">
                                                    <Form.List name={[name, 'diskInfo']}>
                                                        {(diskFields, diskOperations) => (
                                                            <>
                                                                {diskFields.map(({ key: diskKey, name: diskName, ...diskRestField }) => (
                                                                    <div key={diskKey} style={{ marginBottom: 16, padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
                                                                        <Space direction="vertical" style={{ width: '100%' }}>
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
                                                                                            style={{ width: '100%' }}
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
                                                                                            style={{ width: '100%' }}
                                                                                            min={1}
                                                                                            max={100}
                                                                                        />
                                                                                    </Form.Item>
                                                                                </Col>
                                                                                <Col span={1}>
                                                                                    <MinusCircleOutlined
                                                                                        style={{ marginTop: 30 }}
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
                                            )}

                                            {/* 网卡信息 */}
                                            {showNetworkInfo && (
                                                <Form.Item label="网卡信息" style={{ background: '#f9f9f9', padding: 16, borderRadius: 4 }}>
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
                                                                    style={{ width: '100%' }}
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
                                                                rules={[{ required: true, message: '请选择网卡类型!' }]}
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
                                                                    style={{ width: '100%' }}
                                                                    min={3}
                                                                    max={8}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Form.Item>
                                            )}

                                            {fields.length > 1 && (
                                                <MinusCircleOutlined
                                                    style={{ fontSize: 16, color: '#ff4d4f' }}
                                                    onClick={() => remove(name)}
                                                />
                                            )}
                                        </div>
                                    );
                                })}

                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => {
                                            add({
                                                clusterName: '',
                                                businessType: undefined,
                                                platform: undefined,
                                                nodeInfo: [{
                                                    nodeType: undefined
                                                }]
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
                        >
                            <Input placeholder="请输入多个集群合并后的环境名称" />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ marginRight: 16 }}>
                            提交
                        </Button>
                        <Button htmlType="button" onClick={() => form.resetFields()}>
                            重置
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div style={{ flex: 1 }}>
                <Card title="典型配置" style={{ marginBottom: 16 }}>
                    <Row gutter={[16, 16]}>
                        {templateButtons.map(template => (
                            <Col span={12} key={template}>
                                <Button
                                    style={{ width: '100%' }}
                                    onClick={() => applyTemplate(template)}
                                    type={activeTemplate === template ? 'primary' : 'default'}
                                >
                                    {template}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                </Card>

                <Card title="用户收藏配置" extra={
                    <Space>
                        <Button
                            icon={<StarOutlined />}
                            onClick={saveAsFavorite}
                        >
                            收藏当前配置
                        </Button>
                        <Upload
                            beforeUpload={importConfig}
                            showUploadList={false}
                            accept=".json"
                        >
                            <Button icon={<UploadOutlined />}>导入配置</Button>
                        </Upload>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={exportConfig}
                        >
                            导出配置
                        </Button>
                    </Space>
                }>
                    {favoriteConfigs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
                            暂无收藏配置
                        </div>
                    ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {favoriteConfigs.map((config, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: 12,
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 4,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>{config.configName}</span>
                                    <Space>
                                        <Button
                                            type="text"
                                            icon={config.isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                                            onClick={() => toggleFavorite(index)}
                                        />
                                        <Button
                                            type="link"
                                            onClick={() => applyTemplate(null, config)}
                                        >
                                            应用
                                        </Button>
                                        <Button
                                            type="text"
                                            danger
                                            onClick={() => removeFavorite(index)}
                                        >
                                            删除
                                        </Button>
                                    </Space>
                                </div>
                            ))}
                        </Space>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default EnvironmentCreateForm;