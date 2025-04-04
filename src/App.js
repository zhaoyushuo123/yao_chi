import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Form, Input, Button, Select, Row, Col, message, Space, InputNumber, Checkbox, Card, Upload, Modal, Tooltip, Radio } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, StarOutlined, StarFilled, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

// 自定义防抖Hook
const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

const EnvironmentCreateForm = () => {
    const [form] = Form.useForm();
    const [clusterCount, setClusterCount] = useState(0);
    const [favoriteConfigs, setFavoriteConfigs] = useState([]);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [nodeStats, setNodeStats] = useState([]);
    const [isFavoriteModalVisible, setIsFavoriteModalVisible] = useState(false);
    const [favoriteName, setFavoriteName] = useState('');
    const [showClientImage, setShowClientImage] = useState(false);
    const [templateDescription, setTemplateDescription] = useState('');
    const inputTimerRef = useRef(null);

    // 模板描述信息
    const templateDescriptions = {
        '3NODE_1Client': '3节点存储集群配置，包含2个FSM节点和1个FSA节点，以及1个客户端节点，适合基础NAS场景',
        'BLOCK_Template': '块存储集群配置，包含3个FSM节点，适合块存储业务场景',
        'DME_Template': 'DME集群配置，包含2个客户端节点，适合数据管理引擎场景',
        '6NODE_VBS_Sperate': '6节点VBS分离部署配置，包含2个FSM节点、1个FSA节点和3个VBS节点，适合高性能块存储场景',
        '2DC': '双数据中心配置，包含2个集群，每个集群3个FSM节点和1个客户端节点，支持数据复制',
        '3DC': '三数据中心配置，包含3个集群，每个集群3个FSM节点和1个客户端节点，支持数据复制',
        '2GFS': '双GFS集群配置，包含2个集群，每个集群3个FSM节点和1个客户端节点',
        '3GFS': '三GFS集群配置，包含3个集群，每个集群3个FSM节点和1个客户端节点'
    };

    // 初始化默认展示一个集群
    useEffect(() => {
        form.setFieldsValue({
            clusterInfo: [{
                clusterName: '',
                businessType: undefined,
                platform: undefined,
                clusterRole: '默认集群',
                storageImage: undefined,
                clientImage: undefined,
                nodeInfo: [{
                    nodeType: undefined
                }],
                vbsSeparateDeploy: false,
                enableMetadata: false,
                enableReplication: false,
                enableTiering: false
            }]
        });
        setClusterCount(1);
        setNodeStats([{ storageCount: 0, clientCount: 0 }]);

        // 加载本地收藏的配置
        const savedFavorites = localStorage.getItem('favoriteConfigs');
        if (savedFavorites) {
            setFavoriteConfigs(JSON.parse(savedFavorites));
        }

        return () => {
            clearTimeout(inputTimerRef.current);
        };
    }, [form]);

    // 计算节点统计信息
    const calculateNodeStats = useCallback((allValues) => {
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
    }, []);

    // 使用自定义防抖Hook处理集群变化
    const handleClusterChange = useCallback((changedValues, allValues) => {
        const count = allValues.clusterInfo?.length || 0;
        setClusterCount(count);

        const newStats = calculateNodeStats(allValues);
        setNodeStats(newStats);

        const hasClientNodes = allValues.clusterInfo?.some(cluster =>
            cluster.nodeInfo?.some(node => node?.nodeType === 'client')
        );
        setShowClientImage(hasClientNodes);

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
                                form.setFieldsValue({
                                    clusterInfo: {
                                        [clusterIndex]: {
                                            businessType: prevBusinessType
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    }, [calculateNodeStats, form]);

    const debouncedHandleClusterChange = useDebounce(handleClusterChange, 300);

    const onFinish = (values) => {
        console.log('Received values of form: ', values);
        message.success('环境创建成功！');
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('请检查表单填写是否正确！');
    };

    // 获取节点类型选项
    const getNodeTypeOptions = useCallback((businessType) => {
        switch(businessType) {
            case 'block':
                return [<Option key="storage" value="storage">存储</Option>];
            case 'dme':
                return [<Option key="client" value="client">客户端</Option>];
            default:
                return [
                    <Option key="storage" value="storage">存储</Option>,
                    <Option key="client" value="client">客户端</Option>
                ];
        }
    }, []);

    // 获取存储镜像选项
    const getStorageImageOptions = useCallback((businessType) => {
        if (businessType === 'dme') {
            return [<Option key="euler12" value="euler12">Euler 12</Option>];
        }
        return [
            <Option key="euler8" value="euler8">Euler 8</Option>,
            <Option key="euler9" value="euler9">Euler 9</Option>
        ];
    }, []);

    // 获取客户端镜像选项
    const getClientImageOptions = useCallback((businessType) => {
        if (businessType === 'dme') {
            return [<Option key="euler12" value="euler12">Euler 12</Option>];
        }
        return [
            <Option key="ubuntu" value="ubuntu">Ubuntu</Option>,
            <Option key="centos77" value="centos77">CentOS 7.7</Option>
        ];
    }, []);

    // 获取节点角色选项
    const getNodeRoleOptions = useCallback((businessType, vbsSeparateDeploy) => {
        const options = [];

        if (businessType === 'block') {
            options.push(<Option key="fsm" value="fsm">FSM</Option>);
            options.push(<Option key="fsa" value="fsa">FSA</Option>);
            options.push(<Option key="vbs" value="vbs">VBS</Option>);

            if (vbsSeparateDeploy) {
                options.push(<Option key="vbs_separate" value="vbs_separate">VBS分离</Option>);
            }
        } else {
            options.push(<Option key="fsm" value="fsm">FSM</Option>);
            options.push(<Option key="fsa" value="fsa">FSA</Option>);
        }

        return options;
    }, []);

    // 应用模板配置
    const applyTemplate = useCallback((template, config) => {
        if (config) {
            form.setFieldsValue(config.configData);
            setNodeStats(calculateNodeStats(config.configData));
            message.success(`已应用自定义配置: ${config.configName}`);
            setActiveTemplate(`custom_${config.configName}`);
            setTemplateDescription('');
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
                        clusterRole: '默认集群',
                        storageImage: 'euler8',
                        clientImage: 'ubuntu',
                        nodeInfo: [
                            { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2 },
                            { nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1 },
                            { nodeType: 'client', clientServices: ['nfs'], nodeCount: 1 }
                        ],
                        diskInfo: [
                            { diskType: 'ssd', diskSize: 80, diskCount: 5 }
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
                        clusterRole: '默认集群',
                        storageImage: 'euler8',
                        nodeInfo: [
                            { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3 }
                        ],
                        diskInfo: [
                            { diskType: 'ssd', diskSize: 80, diskCount: 5 }
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
                        clusterRole: '默认集群',
                        clientImage: 'euler12',
                        nodeInfo: [
                            { nodeType: 'client', clientServices: ['nfs'], nodeCount: 2 }
                        ]
                    }];
                    break;
                case '6NODE_VBS_Sperate':
                    values.clusterInfo = [{
                        clusterName: '6节点VBS分离集群',
                        businessType: 'block',
                        platform: 'x86',
                        clusterRole: '默认集群',
                        storageImage: 'euler8',
                        vbsSeparateDeploy: true,
                        nodeInfo: [
                            { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2 },
                            { nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1 },
                            { nodeType: 'storage', nodeRole: 'vbs', nodeCount: 3 }
                        ],
                        diskInfo: [
                            { diskType: 'ssd', diskSize: 80, diskCount: 5 }
                        ],
                        networkInfo: {
                            nicCount: 4,
                            nicType: 'tcp',
                            ipCount: 5
                        }
                    }];
                    break;
                case '2DC':
                    values.clusterInfo = Array(2).fill().map((_, i) => ({
                        clusterName: `2DC集群${i+1}`,
                        businessType: 'nas',
                        platform: 'x86',
                        clusterRole: i === 0 ? '9000纳管本端集群' : '9000纳管远端集群',
                        storageImage: 'euler8',
                        clientImage: 'ubuntu',
                        enableReplication: true,
                        enableTiering: true,
                        nodeInfo: [
                            { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3 },
                            { nodeType: 'client', clientServices: i === 0 ? ['nfs', 'obs', 'dpc', 'fi'] : ['nfs', 'obs', 'dpc'], nodeCount: 1 }
                        ],
                        diskInfo: [
                            { diskType: 'ssd', diskSize: 80, diskCount: 5 }
                        ],
                        networkInfo: {
                            nicCount: 4,
                            nicType: 'tcp',
                            ipCount: 5
                        }
                    }));
                    break;
                case '3DC':
                    values.clusterInfo = Array(3).fill().map((_, i) => ({
                        clusterName: `3DC集群${i+1}`,
                        businessType: 'nas',
                        platform: 'x86',
                        clusterRole: i === 0 ? '9000纳管本端集群' : '9000纳管远端集群',
                        storageImage: 'euler8',
                        clientImage: 'ubuntu',
                        enableReplication: true,
                        enableTiering: true,
                        nodeInfo: [
                            { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3 },
                            { nodeType: 'client', clientServices: i === 0 ? ['nfs', 'obs', 'dpc', 'fi'] : ['nfs', 'obs', 'dpc'], nodeCount: 1 }
                        ],
                        diskInfo: [
                            { diskType: 'ssd', diskSize: 80, diskCount: 5 }
                        ],
                        networkInfo: {
                            nicCount: 4,
                            nicType: 'tcp',
                            ipCount: 5
                        }
                    }));
                    break;
                case '2GFS':
                    values.clusterInfo = Array(2).fill().map((_, i) => ({
                        clusterName: `2GFS集群${i+1}`,
                        businessType: 'nas',
                        platform: 'x86',
                        clusterRole: i === 0 ? 'cps本端集群' : '9000纳管远端集群',
                        storageImage: 'euler8',
                        clientImage: 'ubuntu',
                        enableReplication: true,
                        enableTiering: true,
                        nodeInfo: [
                            { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3 },
                            { nodeType: 'client', clientServices: i === 0 ? ['nfs', 'obs', 'dpc', 'fi'] : ['nfs', 'obs', 'dpc'], nodeCount: 1 }
                        ],
                        diskInfo: [
                            { diskType: 'ssd', diskSize: 80, diskCount: 5 }
                        ],
                        networkInfo: {
                            nicCount: 4,
                            nicType: 'tcp',
                            ipCount: 5
                        }
                    }));
                    break;
                case '3GFS':
                    values.clusterInfo = Array(3).fill().map((_, i) => ({
                        clusterName: `3GFS集群${i+1}`,
                        businessType: 'nas',
                        platform: 'x86',
                        clusterRole: i === 0 ? 'cps本端集群' : '9000纳管远端集群',
                        storageImage: 'euler8',
                        clientImage: 'ubuntu',
                        enableReplication: true,
                        enableTiering: true,
                        nodeInfo: [
                            { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3 },
                            { nodeType: 'client', clientServices: i === 0 ? ['nfs', 'obs', 'dpc', 'fi'] : ['nfs', 'obs', 'dpc'], nodeCount: 1 }
                        ],
                        diskInfo: [
                            { diskType: 'ssd', diskSize: 80, diskCount: 5 }
                        ],
                        networkInfo: {
                            nicCount: 4,
                            nicType: 'tcp',
                            ipCount: 5
                        }
                    }));
                    break;
                default:
                    break;
            }

            form.setFieldsValue(values);
            setNodeStats(calculateNodeStats(values));
            message.success(`已应用${template}配置模板`);
            setActiveTemplate(template);
            setTemplateDescription(templateDescriptions[template] || '');
        }
    }, [calculateNodeStats, form]);

    // 导出配置
    const exportConfig = useCallback(() => {
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
    }, [form]);

    // 导入配置
    const importConfig = useCallback((file) => {
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
    }, [calculateNodeStats, form]);

    // 保存为收藏配置
    const saveAsFavorite = useCallback(() => {
        setIsFavoriteModalVisible(true);
    }, []);

    const handleFavoriteOk = useCallback(() => {
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
    }, [favoriteConfigs, favoriteName, form]);

    const handleFavoriteCancel = useCallback(() => {
        setIsFavoriteModalVisible(false);
        setFavoriteName('');
    }, []);

    // 移除收藏配置
    const removeFavorite = useCallback((index) => {
        const updatedFavorites = [...favoriteConfigs];
        updatedFavorites.splice(index, 1);
        setFavoriteConfigs(updatedFavorites);
        localStorage.setItem('favoriteConfigs', JSON.stringify(updatedFavorites));
        message.success('配置已移除收藏');
    }, [favoriteConfigs]);

    // 切换收藏状态
    const toggleFavorite = useCallback((index) => {
        const updatedFavorites = [...favoriteConfigs];
        updatedFavorites[index].isFavorite = !updatedFavorites[index].isFavorite;
        setFavoriteConfigs(updatedFavorites);
        localStorage.setItem('favoriteConfigs', JSON.stringify(updatedFavorites));
    }, [favoriteConfigs]);

    const templateButtons = [
        '3NODE_1Client', '3NODE_3Client', '3NODE_1DPC', '3NODE_3DPC',
        '6NODE_1Client', '9NODE_1Client', '9000纳管',
        '3NODE_1FI', '3NODE_HDFS_FI', '3NODE_CONVERGE_FI', '3NODE_CONVERGE_HDFS_FI',
        '2DC', '3DC', '2GFS', '3GFS', 'BLOCK_Template', 'DME_Template', '6NODE_VBS_Sperate'
    ];

    // 优化后的集群头部组件
    const ClusterHeader = React.memo(({ clusterIndex, stats, onRemove }) => (
        <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: '#f0f0f0',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center'
        }}>
            <span style={{ marginRight: 8 }}>集群 #{clusterIndex}</span>
            <span style={{ marginRight: 8 }}>存储: {stats.storageCount}</span>
            <span style={{ marginRight: 8 }}>客户端: {stats.clientCount}</span>
            <Button
                type="primary"
                danger
                icon={<MinusCircleOutlined />}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                size="small"
                style={{ padding: '0 4px', height: 'auto' }}
            >
                删除集群
            </Button>
        </div>
    ));

    // 存储节点配置组件
    const StorageNodeConfig = React.memo(({ nodeName, nodeRestField, businessType, vbsSeparateDeploy, form, clusterName }) => {
        const validateVBSNodes = useCallback(() => {
            if (!vbsSeparateDeploy) return;

            const nodeInfo = form.getFieldValue(['clusterInfo', clusterName, 'nodeInfo']) || [];
            const vbsNodes = nodeInfo.filter(node =>
                node?.nodeType === 'storage' && node?.nodeRole === 'vbs'
            ).reduce((sum, node) => sum + (node.nodeCount || 0), 0);

            if (vbsNodes < 6) {
                message.warning('VBS分离部署需要至少6个VBS节点');
            }
        }, [vbsSeparateDeploy, form, clusterName]);

        return (
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        {...nodeRestField}
                        label="节点角色"
                        name={[nodeName, 'nodeRole']}
                        rules={[{ required: true, message: '请选择节点角色!' }]}
                    >
                        <Select
                            placeholder="选择节点角色"
                            onChange={validateVBSNodes}
                        >
                            {getNodeRoleOptions(businessType, vbsSeparateDeploy)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        {...nodeRestField}
                        label="节点数量"
                        name={[nodeName, 'nodeCount']}
                        rules={[
                            { required: true, message: '请输入节点数量!', type: 'number', min: 1, max: 100 },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || value < 1) {
                                        return Promise.reject(new Error('请输入有效节点数量'));
                                    }
                                    const nodeRole = getFieldValue(['clusterInfo', clusterName, 'nodeInfo', nodeName, 'nodeRole']);
                                    const vbsSeparate = getFieldValue(['clusterInfo', clusterName, 'vbsSeparateDeploy']);

                                    if (nodeRole === 'vbs' && vbsSeparate && value < 6) {
                                        return Promise.reject(new Error('VBS分离部署需要至少6个节点'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <InputNumber
                            placeholder="输入节点数量"
                            style={{ width: '100%' }}
                            min={1}
                            max={100}
                            onChange={validateVBSNodes}
                        />
                    </Form.Item>
                </Col>
            </Row>
        );
    });

    // 客户端节点配置组件
    const ClientNodeConfig = React.memo(({ nodeName, nodeRestField }) => (
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
    ));

    // 节点项组件
    // 节点项组件
    const NodeItem = React.memo(({ nodeName, nodeRestField, nodeTypeOptions, businessType, form, clusterName, onRemove, vbsSeparateDeploy }) => {
        const nodeType = Form.useWatch(['clusterInfo', clusterName, 'nodeInfo', nodeName, 'nodeType'], form);

        const resetNodeFields = useCallback(() => {
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
        }, [clusterName, form, nodeName]);

        return (
            <div style={{ marginBottom: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                <Row gutter={16} align="middle">
                    {/* 节点大类 */}
                    <Col span={4}>
                        <Form.Item
                            {...nodeRestField}
                            name={[nodeName, 'nodeType']}
                            rules={[{ required: true, message: '请选择节点大类!' }]}
                            label="节点大类"
                            labelCol={{ span: 24 }}
                            style={{ marginBottom: 0 }}
                        >
                            <Select placeholder="选择节点大类" style={{ width: '100%' }}>
                                {nodeTypeOptions}
                            </Select>
                        </Form.Item>
                    </Col>

                    {nodeType === 'storage' && (
                        <>
                            {/* 存储节点角色 - 12列 */}
                            <Col span={12}>
                                <Form.Item
                                    {...nodeRestField}
                                    name={[nodeName, 'nodeRole']}
                                    rules={[{ required: true, message: '请选择节点角色!' }]}
                                    label="节点角色"
                                    labelCol={{ span: 24 }}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Select placeholder="选择节点角色" style={{ width: '100%' }}>
                                        {getNodeRoleOptions(businessType, vbsSeparateDeploy)}
                                    </Select>
                                </Form.Item>
                            </Col>
                            {/* 存储节点数量 - 精确右对齐 */}
                            <Col span={6}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    paddingRight: 8
                                }}>
                                    <Form.Item
                                        {...nodeRestField}
                                        name={[nodeName, 'nodeCount']}
                                        rules={[{ required: true, message: '请输入节点数量!' }]}
                                        label="节点数量"
                                        labelCol={{ span: 24 }}
                                        style={{ marginBottom: 0, width: '100%' }}
                                    >
                                        <InputNumber
                                            placeholder="数量"
                                            style={{
                                                width: '100%',
                                                textAlign: 'right'
                                            }}
                                            min={1}
                                            max={100}
                                        />
                                    </Form.Item>
                                </div>
                            </Col>
                        </>
                    )}

                    {nodeType === 'client' && (
                        <>
                            {/* 客户端业务服务 - 12列 */}
                            <Col span={12}>
                                <Form.Item
                                    {...nodeRestField}
                                    name={[nodeName, 'clientServices']}
                                    rules={[{ required: true, message: '请选择业务服务!' }]}
                                    label="业务服务"
                                    labelCol={{ span: 24 }}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Space size={8} style={{ display: 'flex', alignItems: 'center' }}>
                                        <Checkbox value="nfs">NFS</Checkbox>
                                        <Checkbox value="obs">OBS</Checkbox>
                                        <Checkbox value="dpc">DPC</Checkbox>
                                        <Checkbox value="fi">FI</Checkbox>
                                        <Checkbox value="hdfs_fi">
                                            <Space size={4}>
                                                HDFS_FI
                                                <Tooltip title="HDFS_FI部署时，即使勾选了NFS OBS或DPC，也只有第三个FI客户端提供NFS OBS DPC协议">
                                                    <QuestionCircleOutlined />
                                                </Tooltip>
                                            </Space>
                                        </Checkbox>
                                    </Space>
                                </Form.Item>
                            </Col>
                            {/* 客户端节点数量 - 精确右对齐 */}
                            <Col span={6}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    paddingRight: 8
                                }}>
                                    <Form.Item
                                        {...nodeRestField}
                                        name={[nodeName, 'nodeCount']}
                                        rules={[{ required: true, message: '请输入节点数量!' }]}
                                        label="节点数量"
                                        labelCol={{ span: 24 }}
                                        style={{ marginBottom: 0, width: '100%' }}
                                    >
                                        <InputNumber
                                            placeholder="数量"
                                            style={{
                                                width: '100%',
                                                textAlign: 'right'
                                            }}
                                            min={1}
                                            max={100}
                                        />
                                    </Form.Item>
                                </div>
                            </Col>
                        </>
                    )}

                    {/* 删除按钮 */}
                    <Col span={2}>
                        <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            size="small"
                            style={{ marginTop: 24 }}
                        />
                    </Col>
                </Row>
            </div>
        );
    });

    // 硬盘项组件
    const DiskItem = React.memo(({ diskName, diskRestField, onRemove, enableMetadata, enableReplication }) => {
        const getDefaultDiskSize = useCallback(() => {
            if (enableMetadata || enableReplication) return 200;
            return 80;
        }, [enableMetadata, enableReplication]);

        const getDefaultDiskCount = useCallback(() => {
            if (enableMetadata && enableReplication) return 6;
            if (enableMetadata || enableReplication) return 5;
            return 4;
        }, [enableMetadata, enableReplication]);

        return (
            <div style={{ marginBottom: 8, padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            {...diskRestField}
                            label="硬盘类型"
                            name={[diskName, 'diskType']}
                            initialValue="ssd"
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
                            initialValue={getDefaultDiskSize()}
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
                            initialValue={getDefaultDiskCount()}
                            rules={[
                                { required: true, message: '请输入硬盘数量!', type: 'number', min: 1, max: 100 },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const minDisks = enableMetadata && enableReplication ? 6 :
                                            enableMetadata || enableReplication ? 5 : 4;
                                        if (value < minDisks) {
                                            return Promise.reject(new Error(
                                                enableMetadata && enableReplication ? '至少需要6块硬盘' :
                                                    enableMetadata ? '元数据服务至少需要5块硬盘' :
                                                        '复制集群服务至少需要5块硬盘'
                                            ));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber placeholder="输入数量" style={{ width: '100%' }} min={1} max={100} />
                        </Form.Item>
                    </Col>
                    <Col span={1}>
                        <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            size="small"
                            style={{ padding: '0 4px', height: 'auto', marginTop: 24 }}
                        />
                    </Col>
                </Row>
            </div>
        );
    });

    // 集群基本信息组件
    const ClusterBasicInfo = React.memo(({ name, restField, businessType }) => {
        const [vbsSeparateDeploy, setVbsSeparateDeploy] = useState(false);

        const handleVbsSeparateChange = useCallback((e) => {
            const value = e.target.value;
            setVbsSeparateDeploy(value);
            form.setFieldsValue({
                clusterInfo: {
                    [name]: {
                        vbsSeparateDeploy: value
                    }
                }
            });

            if (value) {
                const nodeInfo = form.getFieldValue(['clusterInfo', name, 'nodeInfo']) || [];
                const vbsNodes = nodeInfo.filter(node =>
                    node?.nodeType === 'storage' && node?.nodeRole === 'vbs'
                ).reduce((sum, node) => sum + (node.nodeCount || 0), 0);

                if (vbsNodes < 6) {
                    message.warning('VBS分离部署需要至少6个VBS节点');
                }
            }
        }, [form, name]);

        return (
            <>
                <Row gutter={16} style={{ marginBottom: 8 }}>
                    {businessType === 'block' && (
                        <Col span={12}>
                            <Form.Item
                                {...restField}
                                name={[name, 'vbsSeparateDeploy']}
                                style={{ marginBottom: 8 }}
                            >
                                <Radio.Group onChange={handleVbsSeparateChange} value={vbsSeparateDeploy}>
                                    <Radio value={true}>
                                        VBS分离部署
                                        <Tooltip title="VBS分离部署需要至少6个VBS节点">
                                            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                        </Tooltip>
                                    </Radio>
                                    <Radio value={false}>普通部署</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    )}
                    {businessType === 'nas' && (
                        <>
                            <Col span={6}>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'enableMetadata']}
                                    style={{ marginBottom: 8 }}
                                    valuePropName="checked"
                                >
                                    <Checkbox>
                                        开启元数据服务
                                        <Tooltip title="开启元数据服务需要更大的存储容量">
                                            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                        </Tooltip>
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'enableReplication']}
                                    style={{ marginBottom: 8 }}
                                    valuePropName="checked"
                                >
                                    <Checkbox>
                                        开启复制集群服务
                                        <Tooltip title="开启复制集群服务需要更大的存储容量">
                                            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                        </Tooltip>
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'enableTiering']}
                                    style={{ marginBottom: 8 }}
                                    valuePropName="checked"
                                >
                                    <Checkbox>
                                        开启分级服务
                                        <Tooltip title="开启分级服务需要额外的存储空间">
                                            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                                        </Tooltip>
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                        </>
                    )}
                </Row>

                <Row gutter={16} style={{ marginBottom: 8 }}>
                    <Col span={8}>
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
                    <Col span={8}>
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
                    <Col span={8}>
                        <Form.Item
                            {...restField}
                            label="集群角色"
                            name={[name, 'clusterRole']}
                            rules={[{ required: true, message: '请选择集群角色!' }]}
                            style={{ marginBottom: 8 }}
                        >
                            <Select placeholder="请选择集群角色">
                                <Option value="默认集群">默认集群</Option>
                                <Option value="9000纳管本端集群">9000纳管本端集群</Option>
                                <Option value="9000纳管远端集群">9000纳管远端集群</Option>
                                <Option value="cps本端集群">cps本端集群</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </>
        );
    });

    // 集群镜像配置组件
    const ClusterImageConfig = React.memo(({ name, restField, businessType, hasStorageNode, showClientImage }) => (
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
            {showClientImage && (
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
            )}
        </Row>
    ));

    // 节点信息部分组件
    const NodeInfoSection = React.memo(({ name, restField, businessType, form, vbsSeparateDeploy }) => {
        const nodeTypeOptions = useMemo(() => getNodeTypeOptions(businessType), [businessType]);

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
                                    vbsSeparateDeploy={vbsSeparateDeploy}
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
    });

    // 存储硬盘信息组件
    const StorageDiskInfo = React.memo(({ name, restField, hasStorageNode, enableMetadata, enableReplication }) => {
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
                                    enableMetadata={enableMetadata}
                                    enableReplication={enableReplication}
                                />
                            ))}
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="dashed"
                                    onClick={() => diskOperations.add({
                                        diskType: 'ssd',
                                        diskSize: enableMetadata || enableReplication ? 200 : 80,
                                        diskCount: enableMetadata && enableReplication ? 6 :
                                            (enableMetadata || enableReplication ? 5 : 4)
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
    });

    // 存储网络信息组件
    const StorageNetworkInfo = React.memo(({ name, restField, hasStorageNode }) => {
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
    });

    // 集群卡片组件
    const ClusterCard = React.memo(({ name, restField, form, nodeStats, onRemoveCluster }) => {
        const businessType = Form.useWatch(['clusterInfo', name, 'businessType'], form);
        const vbsSeparateDeploy = Form.useWatch(['clusterInfo', name, 'vbsSeparateDeploy'], form);
        const enableMetadata = Form.useWatch(['clusterInfo', name, 'enableMetadata'], form);
        const enableReplication = Form.useWatch(['clusterInfo', name, 'enableReplication'], form);
        const enableTiering = Form.useWatch(['clusterInfo', name, 'enableTiering'], form);

        const hasStorageNode = useMemo(() => {
            const nodeInfo = form.getFieldValue(['clusterInfo', name, 'nodeInfo']);
            return nodeInfo?.some(node => node?.nodeType === 'storage');
        }, [form, name]);

        return (
            <div style={{
                marginBottom: 16,
                border: '1px solid #d9d9d9',
                padding: 16,
                borderRadius: 4,
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
            }}>
                <ClusterHeader
                    clusterIndex={name + 1}
                    stats={nodeStats[name] || { storageCount: 0, clientCount: 0 }}
                    onRemove={onRemoveCluster}
                />

                <ClusterBasicInfo name={name} restField={restField} businessType={businessType} />
                <ClusterImageConfig
                    name={name}
                    restField={restField}
                    businessType={businessType}
                    hasStorageNode={hasStorageNode}
                    showClientImage={showClientImage}
                />
                <NodeInfoSection
                    name={name}
                    restField={restField}
                    businessType={businessType}
                    form={form}
                    vbsSeparateDeploy={vbsSeparateDeploy}
                />
                <StorageDiskInfo
                    name={name}
                    restField={restField}
                    hasStorageNode={hasStorageNode}
                    enableMetadata={enableMetadata}
                    enableReplication={enableReplication}
                />
                <StorageNetworkInfo
                    name={name}
                    restField={restField}
                    hasStorageNode={hasStorageNode}
                />
            </div>
        );
    });

    // 模板面板组件
    const TemplatePanel = React.memo(({
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Card title="典型配置" bodyStyle={{ padding: 12 }}>
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

                <Card title="配置描述" bodyStyle={{ padding: 12 }}>
                    <div style={{ minHeight: 100, padding: 8, background: '#f9f9f9', borderRadius: 4 }}>
                        {templateDescription || '请选择典型配置查看详细描述'}
                    </div>
                </Card>
            </div>
        );
    });

    return (
        <div style={{ display: 'flex', gap: 16, padding: 16, backgroundColor: '#bfe1e4' }}>
            <div style={{ flex: 3 }}>
                <Form
                    form={form}
                    name="createEnvironment"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    onValuesChange={debouncedHandleClusterChange}
                >
                    <h2 style={{ marginBottom: 16 }}>创建新环境</h2>

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
                                        onRemoveCluster={() => {
                                            remove(name);
                                            setClusterCount(clusterCount - 1);
                                        }}
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
                                                clusterRole: '默认集群',
                                                storageImage: undefined,
                                                clientImage: undefined,
                                                nodeInfo: [{ nodeType: undefined }],
                                                vbsSeparateDeploy: false,
                                                enableMetadata: false,
                                                enableReplication: false,
                                                enableTiering: false
                                            });
                                            setClusterCount(clusterCount + 1);
                                        }}
                                        block
                                        icon={<PlusOutlined />}
                                        style={{ marginTop: 8 }}
                                    >
                                        添加集群信息
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Card
                        title="环境名称"
                        style={{ marginTop: 16 }}
                        bodyStyle={{ padding: 16 }}
                    >
                        <Form.List name="clusterInfo">
                            {(fields) => (
                                <>
                                    {fields.map(({ key, name }) => (
                                        <Form.Item
                                            key={key}
                                            label={`集群${name + 1}名称`}
                                            name={[name, 'clusterName']}
                                            rules={[{ required: true, message: `请输入集群${name + 1}名称!` }]}
                                            style={{ marginBottom: 16 }}
                                        >
                                            <Input placeholder={`请输入集群${name + 1}名称`} />
                                        </Form.Item>
                                    ))}
                                </>
                            )}
                        </Form.List>

                        {clusterCount >= 2 && (
                            <Form.Item
                                label="合一环境名称"
                                name="combinedEnvName"
                                rules={[{ required: true, message: '请输入合一环境名称!' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input placeholder="请输入多个集群合并后的环境名称" />
                            </Form.Item>
                        )}
                    </Card>

                    <Form.Item style={{ marginTop: 16 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" size="large">
                                提交
                            </Button>
                            <Button htmlType="button" onClick={() => form.resetFields()} size="large">
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