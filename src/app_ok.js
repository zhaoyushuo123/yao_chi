import React, {useState, useEffect} from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Row,
    Col,
    Card,
    Divider,
    Checkbox,
    InputNumber,
    Radio,
    message,
    Collapse, Modal
} from 'antd';
import {PlusOutlined, MinusOutlined, StarOutlined, StarFilled, DeleteOutlined} from '@ant-design/icons';

const {Panel} = Collapse;

// 典型配置数据
const TEMPLATE_CONFIGS = {
    '3NODE_1Client': {
        description: '3个存储节点 + 1个客户端节点',
        config: {
            clusters: [{
                clusterName: 'cluster1',
                businessType: 'NAS',
                platform: 'x86',
                clusterRole: '默认集群',
                valueAddedServices: ['开启元数据服务'],
                nodes: [
                    {nodeType: '存储', storageRole: 'FSM', nodeCount: 3, storageImage: 'euler9'},
                    {nodeType: '客户端', businessServices: ['NFS'], nodeCount: 1, clientImage: 'centos77'}
                ],
                disks: [
                    {diskType: 'SSD', diskSize: 80, diskCount: 6}
                ],
                network: {
                    nicCount: 4,
                    nicType: 'TPC',
                    ipCount: 5
                }
            }]
        }
    },
    // 其他典型配置...
};

const PacificEnvForm = () => {
    const [form] = Form.useForm();
    const [clusters, setClusters] = useState([{id: 1}]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateDescription, setTemplateDescription] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [activeBusinessType, setActiveBusinessType] = useState('NAS');

    // 业务大类选项
    const businessTypeOptions = [
        {label: 'NAS', value: 'NAS'},
        {label: 'BLOCK', value: 'BLOCK'},
        {label: 'DME', value: 'DME'}
    ];

    // 平台选项
    const platformOptions = [
        {label: 'x86', value: 'x86'},
        {label: 'arm', value: 'arm'}
    ];

    // 根据业务大类获取集群角色选项
    const getClusterRoleOptions = (type) => {
        switch (type) {
            case 'NAS':
                return [
                    {label: '默认集群', value: '默认集群'},
                    {label: '复制集群', value: '复制集群'},
                    {label: '9000纳管本端集群', value: '9000纳管本端集群'},
                    {label: '9000纳管远端集群', value: '9000纳管远端集群'}
                ];
            case 'BLOCK':
                return [
                    {label: '默认集群', value: '默认集群'},
                    {label: '复制集群', value: '复制集群'},
                    {label: 'cps集群', value: 'cps集群'}
                ];
            case 'DME':
                return [
                    {label: '默认集群', value: '默认集群'}
                ];
            default:
                return [];
        }
    };

    // 根据业务大类获取增值服务选项
    const getValueAddedServicesOptions = (type) => {
        switch (type) {
            case 'NAS':
                return [
                    {label: '开启元数据服务', value: '开启元数据服务'},
                    {label: '开启复制集群服务', value: '开启复制集群服务'},
                    {label: '开启分级服务', value: '开启分级服务'},
                    {label: '开启dpc docker多集群服务', value: '开启dpc docker多集群服务'}
                ];
            case 'BLOCK':
                return [
                    {label: '普通部署', value: '普通部署'},
                    {label: 'VBS分离部署', value: 'VBS分离部署'}
                ];
            case 'DME':
                return [
                    {label: 'DME集群部署', value: 'DME集群部署'},
                    {label: '单DME', value: '单DME'}
                ];
            default:
                return [];
        }
    };

    // 节点类型选项
    const nodeTypeOptions = (businessType) => {
        const options = [];
        if (businessType !== 'DME') {
            options.push({label: '存储', value: '存储'});
        }
        if (businessType !== 'BLOCK') {
            options.push({label: '客户端', value: '客户端'});
        }
        return options;
    };

    // 存储节点角色选项
    const storageRoleOptions = (businessType) => {
        const options = [
            {label: 'FSM', value: 'FSM'},
            {label: 'FSA', value: 'FSA'}
        ];
        if (businessType === 'BLOCK') {
            options.push({label: 'VBS', value: 'VBS'});
        }
        return options;
    };

    // 业务服务选项
    const businessServiceOptions = [
        {label: 'NFS', value: 'NFS'},
        {label: 'OBS', value: 'OBS'},
        {label: 'DPC', value: 'DPC'},
        {label: 'FI', value: 'FI'},
        {label: 'HDFS_FI', value: 'HDFS_FI'}
    ];

    // 客户端镜像选项
    const clientImageOptions = [
        {label: 'centos77', value: 'centos77'},
        {label: 'ubuntu', value: 'ubuntu'},
        {label: 'euler9', value: 'euler9'}
    ];

    // 存储镜像选项
    const storageImageOptions = [
        {label: 'euler9', value: 'euler9'},
        {label: 'euler10', value: 'euler10'},
        {label: 'euler11', value: 'euler11'}
    ];

    // 硬盘类型选项
    const diskTypeOptions = [
        {label: 'SSD', value: 'SSD'},
        {label: 'HDD', value: 'HDD'}
    ];

    // 网卡类型选项
    const nicTypeOptions = [
        {label: 'TPC', value: 'TPC'},
        {label: 'ROCE', value: 'ROCE'}
    ];

    // 添加集群
    // 修改添加集群函数
    const addCluster = () => {
        const newId = clusters.length > 0 ? Math.max(...clusters.map(c => c.id)) + 1 : 1;

        // 获取当前表单值
        const formValues = form.getFieldsValue();
        const newCluster = {
            businessType: 'NAS',
            platform: 'x86',
            clusterRole: '默认集群', // 明确设置默认值
            valueAddedServices: [],
            nodes: [],
            disks: [],
            network: {
                nicCount: 4,
                nicType: 'TPC',
                ipCount: 5
            }
        };

        // 更新表单
        form.setFieldsValue({
            clusters: [...(formValues.clusters || []), newCluster]
        });

        setClusters([...clusters, { id: newId }]);
    };

    // 删除集群
    // 修改删除集群函数
    const removeCluster = (id) => {
        if (clusters.length <= 1) {
            message.warning('至少需要保留一个集群');
            return;
        }

        // 获取当前表单值
        const formValues = form.getFieldsValue();

        // 过滤掉要删除的集群
        const newClusters = clusters.filter(c => c.id !== id);
        const newClustersValues = (formValues.clusters || []).filter((_, index) => {
            return clusters[index].id !== id;
        });

        // 更新状态和表单值
        setClusters(newClusters);
        form.setFieldsValue({
            clusters: newClustersValues
        });

        // 如果删除后只剩一个集群，清除合一环境名称
        if (newClusters.length === 1) {
            form.setFieldsValue({
                envName: undefined
            });
        }
    };

    // 应用典型配置
    const applyTemplate = (templateName) => {
        const template = TEMPLATE_CONFIGS[templateName];
        if (template) {
            setSelectedTemplate(templateName);
            setTemplateDescription(template.description);
            form.setFieldsValue(template.config);
            setClusters(template.config.clusters.map((c, i) => ({id: i + 1})));
        }
    };
    const [favoriteName, setFavoriteName] = useState('');
    const [isFavoriteModalVisible, setIsFavoriteModalVisible] = useState(false);
    // 收藏当前配置
    const saveAsFavorite = () => {
        form.validateFields().then(values => {
            setIsFavoriteModalVisible(true);
        }).catch(() => {
            message.error('表单验证失败，请检查输入');
        });
    };

    // 应用收藏配置
    const applyFavorite = (favorite) => {
        form.setFieldsValue(favorite.config);
        setClusters(favorite.config.clusters.map((c, i) => ({id: i + 1})));
        setSelectedTemplate(null);
        setTemplateDescription(`用户收藏: ${favorite.name}`);
    };

    // 导出配置
    const exportConfig = () => {
        form.validateFields().then(values => {
            const dataStr = JSON.stringify(values, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

            const exportFileDefaultName = 'pacific-config.json';

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        }).catch(() => {
            message.error('表单验证失败，请检查输入');
        });
    };

    // 导入配置
    const importConfig = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                form.setFieldsValue(config);
                setClusters(config.clusters.map((c, i) => ({id: i + 1})));
                setSelectedTemplate(null);
                setTemplateDescription('导入的配置');
                message.success('配置导入成功');
            } catch (error) {
                message.error('配置文件格式错误');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // 重置input，允许重复选择同一文件
    };

    const autoFillEmptyNames = (values) => {
        const filled = { ...values };

        // 填充合一环境名称
        if (filled.clusters.length > 1 && !filled.envName) {
            filled.envName = `pacific-${filled.clusters[0].businessType.toLowerCase()}`;
        }

        // 填充集群名称
        filled.clusters = filled.clusters.map((cluster, index) => ({
            ...cluster,
            clusterName: cluster.clusterName || `${cluster.businessType}-cluster-${index + 1}`,
        }));

        return filled;
    };

    // 提交表单
    const onFinish = (values) => {
        // 1. 自动填充未输入的字段（可选）
        const filledValues = autoFillEmptyNames(values);

        // 2. 严格校验命名规则
        const { isValid, errors } = validateNamingStrictly(filledValues);
        // 3. 如果校验失败，显示错误并阻止提交
        if (!isValid) {
            showNamingErrors(errors);
            return; // 阻止提交
        }
        // 4. 校验通过，继续提交
        submitForm(filledValues);
    };
    // 校验名称规则
    const validateNamingStrictly = (values) => {
        const errors = [];
        let isValid = true;

        // 规则1: 多集群必须填写合一环境名称
        if (values.clusters.length > 1 && !values.envName?.trim()) {
            errors.push('多集群环境必须填写"合一环境名称"');
            isValid = false;
        }

        // 规则2: 集群名称必须包含业务类型和角色
        values.clusters.forEach((cluster, index) => {
            if (!cluster.clusterName?.trim()) {
                errors.push(`集群 ${index + 1} 必须填写名称`);
                isValid = false;
            } else {
                if (!cluster.clusterName.includes(cluster.businessType)) {
                    errors.push(`集群 ${index + 1} 名称应包含业务类型（如 ${cluster.businessType}）`);
                    isValid = false;
                }
                if (!cluster.clusterName.includes(cluster.clusterRole.replace('集群', ''))) {
                    errors.push(`集群 ${index + 1} 名称应包含角色（如 ${cluster.clusterRole}）`);
                    isValid = false;
                }
            }
        });

        return { isValid, errors };
    };

    // 显示错误提示
    const showNamingErrors = (errors) => {
        Modal.error({
            title: '命名不符合规范',
            content: (
                <div>
                    <p>请修改以下问题：</p>
                    <ul style={{ color: 'red' }}>
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            ),
        });
    };

    // 实际提交逻辑
    const submitForm = (values) => {
        console.log('提交数据:', values);
        message.success('环境创建成功');
    };

    return (
        <Row gutter={16}>
            {/* 左侧表单 */}
            <Col span={16}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        clusters: [{
                            businessType: 'NAS',
                            platform: 'x86',
                            clusterRole: '默认集群',
                            valueAddedServices: [],
                            nodes: [],
                            disks: [],
                            network: {
                                nicCount: 4,
                                nicType: 'TPC',
                                ipCount: 5
                            }
                        }]
                    }}
                >
                    {clusters.map((cluster, clusterIndex) => (

                        <Card
                            key={cluster.id}
                            title={`集群 ${clusterIndex + 1}`}
                            extra={
                                <Button
                                    danger
                                    icon={<MinusOutlined/>}
                                    onClick={() => removeCluster(cluster.id)}
                                />
                            }
                            style={{marginBottom: 16}}
                        >
                            <Form.Item
                                name={['clusters', clusterIndex, 'clusterName']}
                                label="集群名称"
                                rules={[{required: true, message: '请输入集群名称'}]}
                            >
                                <Input placeholder="请输入集群名称"/>
                            </Form.Item>


                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name={['clusters', clusterIndex, 'businessType']}
                                        label="业务大类"
                                        rules={[{ required: true, message: '请选择业务大类' }]}
                                    >
                                        <Select
                                            options={businessTypeOptions}
                                            onChange={(value) => {
                                                const currentValues = form.getFieldsValue();
                                                const currentNodes = currentValues.clusters?.[clusterIndex]?.nodes || [];

                                                // 过滤不兼容的节点
                                                const filteredNodes = currentNodes.filter(node => {
                                                    if (value === 'BLOCK' && node.nodeType === '客户端') return false;
                                                    if (value === 'DME' && node.nodeType === '存储') return false;
                                                    return true;
                                                });

                                                // 根据业务类型设置默认增值服务
                                                let defaultServices = [];
                                                if (value === 'BLOCK') {
                                                    defaultServices = ['普通部署']; // 默认普通部署
                                                } else if (value === 'DME') {
                                                    defaultServices = ['DME集群部署']; // 默认DME集群部署
                                                } else if (value === 'NAS') {
                                                    defaultServices = []; // NAS默认无选中
                                                }

                                                // 创建新的集群数组
                                                const newClusters = [...(currentValues.clusters || [])];
                                                newClusters[clusterIndex] = {
                                                    ...newClusters[clusterIndex],
                                                    businessType: value,
                                                    nodes: filteredNodes,
                                                    clusterRole: '默认集群',
                                                    valueAddedServices: defaultServices
                                                };

                                                // 强制更新表单值
                                                form.setFieldsValue({
                                                    clusters: newClusters
                                                });

                                                // 更新活动业务类型状态（如果需要）
                                                setActiveBusinessType(value);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name={['clusters', clusterIndex, 'platform']}
                                        label="平台"
                                        rules={[{required: true, message: '请选择平台'}]}
                                    >
                                        <Select options={platformOptions}/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name={['clusters', clusterIndex, 'clusterRole']}
                                        label="集群角色"
                                        rules={[{ required: true, message: '请选择集群角色' }]}
                                    >
                                        <Select
                                            options={getClusterRoleOptions(
                                                form.getFieldValue(['clusters', clusterIndex, 'businessType']) || 'NAS' // 默认NAS
                                            )}
                                            placeholder="请选择集群角色"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name={['clusters', clusterIndex, 'valueAddedServices']}
                                label="增值服务"
                            >
                                {(() => {
                                    const currentBusinessType = form.getFieldValue(['clusters', clusterIndex, 'businessType']) || 'NAS';
                                    const options = getValueAddedServicesOptions(currentBusinessType);

                                    switch(currentBusinessType) {
                                        case 'NAS':
                                            return <Checkbox.Group options={options} />;
                                        case 'BLOCK':
                                        case 'DME':
                                            return (
                                                <Radio.Group
                                                    options={options}
                                                    optionType="button"
                                                    buttonStyle="solid"
                                                />
                                            );
                                        default:
                                            return null;
                                    }
                                })()}
                            </Form.Item>

                            <Form.List name={['clusters', clusterIndex, 'nodes']}>
                                {(fields, {add, remove}) => (
                                    <div>
                                        <Divider orientation="left">节点信息</Divider>
                                        {fields.map((field, index) => {
                                            const nodeType = form.getFieldValue(['clusters', clusterIndex, 'nodes', index, 'nodeType']);
                                            return (
                                                <div key={field.key} style={{
                                                    marginBottom: 16,
                                                    padding: 16,
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 4
                                                }}>
                                                    <Row gutter={16} align="middle">
                                                        {/* 节点大类选择 */}
                                                        <Col span={nodeType ? 3 : 16}>  {/* 未选择类型时占更多空间 */}
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'nodeType']}
                                                                label="节点大类"
                                                                rules={[{required: true, message: '请选择节点大类'}]}
                                                                style={{marginBottom: 0}}
                                                            >
                                                                <Select
                                                                    options={nodeTypeOptions(
                                                                        form.getFieldValue(['clusters', clusterIndex, 'businessType'])
                                                                    )}
                                                                    onChange={(value) => {
                                                                        const nodes = form.getFieldValue(['clusters', clusterIndex, 'nodes']);
                                                                        nodes[field.name] = {
                                                                            ...nodes[field.name],
                                                                            nodeType: value,
                                                                            ...(value === '存储' ? {
                                                                                businessServices: undefined,
                                                                                clientImage: undefined
                                                                            } : {
                                                                                storageRole: undefined,
                                                                                storageImage: undefined
                                                                            })
                                                                        };
                                                                        form.setFieldsValue({
                                                                            [`clusters.${clusterIndex}.nodes`]: nodes
                                                                        });
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        {/* 存储节点配置 */}
                                                        {nodeType === '存储' && (
                                                            <>
                                                                <Col span={10}>
                                                                    <Form.Item
                                                                        {...field}
                                                                        name={[field.name, 'storageRole']}
                                                                        label="存储节点角色"
                                                                        rules={[{
                                                                            required: true,
                                                                            message: '请选择存储节点角色'
                                                                        }]}
                                                                        style={{marginBottom: 0}}
                                                                    >
                                                                        <Select
                                                                            options={storageRoleOptions(
                                                                                form.getFieldValue(['clusters', clusterIndex, 'businessType'])
                                                                            )}
                                                                            style={{width: '100%'}}
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...field}
                                                                        name={[field.name, 'storageImage']}
                                                                        label="存储镜像"
                                                                        initialValue="euler9"
                                                                        style={{marginBottom: 0}}
                                                                    >
                                                                        <Select options={storageImageOptions}
                                                                                style={{width: '100%'}}/>
                                                                    </Form.Item>
                                                                </Col>
                                                            </>
                                                        )}

                                                        {/* 客户端节点配置 */}
                                                        {nodeType === '客户端' && (
                                                            <>
                                                                <Col span={10}>  {/* 从10调整为8，与存储节点角色一致 */}
                                                                    <Form.Item
                                                                        {...field}
                                                                        name={[field.name, 'businessServices']}
                                                                        label="业务服务"
                                                                        rules={[{ required: true, message: '请选择业务服务' }]}
                                                                        style={{ marginBottom: 0 }}
                                                                    >
                                                                        <Select
                                                                            mode="multiple"
                                                                            placeholder="请选择业务服务"
                                                                            style={{ width: '100%' }}
                                                                            options={businessServiceOptions}
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        {...field}
                                                                        name={[field.name, 'clientImage']}
                                                                        label="客户端镜像"
                                                                        initialValue="centos77"
                                                                        style={{ marginBottom: 0 }}
                                                                    >
                                                                        <Select
                                                                            options={clientImageOptions}
                                                                            style={{ width: '100%' }}
                                                                            placeholder="选择镜像"
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                            </>
                                                        )}

                                                        {/* 节点数量 (只在选择了节点大类后显示) */}
                                                        {nodeType && (
                                                            <Col span={3}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'nodeCount']}
                                                                    label="节点数量"
                                                                    rules={[{
                                                                        required: true,
                                                                        message: '请输入节点数量'
                                                                    }]}
                                                                    style={{marginBottom: 0}}
                                                                >
                                                                    <InputNumber
                                                                        min={1}
                                                                        style={{width: '100%'}}
                                                                        placeholder="数量"
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        )}

                                                        {/* 删除按钮 */}
                                                        <Col span={2}>
                                                            <Button
                                                                danger
                                                                icon={<MinusOutlined/>}
                                                                onClick={() => remove(field.name)}
                                                                style={{marginTop: nodeType ? 0 : 30}}
                                                            />
                                                        </Col>
                                                    </Row>


                                                </div>
                                            );
                                        })}

                                        <Button
                                            type="dashed"
                                            onClick={() => add({})}
                                            icon={<PlusOutlined/>}
                                        >
                                            添加节点
                                        </Button>
                                    </div>
                                )}
                            </Form.List>

                            {/* 存储硬盘信息 */}
                            {form.getFieldValue(['clusters', clusterIndex, 'nodes'])?.some(
                                node => node?.nodeType === '存储'
                            ) && (
                                <Form.List name={['clusters', clusterIndex, 'disks']}>
                                    {(fields, {add, remove}) => (
                                        <div>
                                            <Divider orientation="left">存储硬盘信息</Divider>
                                            {fields.map((field, index) => (
                                                <div key={field.key} style={{
                                                    marginBottom: 16,
                                                    padding: 16,
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 4
                                                }}>
                                                    <Row gutter={16}>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'diskType']}
                                                                label="硬盘类型"
                                                                initialValue="SSD"
                                                            >
                                                                <Select options={diskTypeOptions}/>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'diskSize']}
                                                                label="硬盘容量(GB)"
                                                                initialValue={80}
                                                            >
                                                                <InputNumber min={1} style={{width: '100%'}}/>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'diskCount']}
                                                                label="硬盘数量"
                                                                initialValue={4}
                                                                rules={[
                                                                    {required: true, message: '请输入硬盘数量'},
                                                                    ({getFieldValue}) => ({
                                                                        validator(_, value) {
                                                                            const valueAddedServices = getFieldValue(['clusters', clusterIndex, 'valueAddedServices']) || [];
                                                                            const minCount =
                                                                                valueAddedServices.includes('开启元数据服务') &&
                                                                                valueAddedServices.includes('开启复制集群服务') ? 6 :
                                                                                    valueAddedServices.includes('开启元数据服务') ? 5 :
                                                                                        valueAddedServices.includes('开启复制集群服务') ? 5 : 4;

                                                                            if (value >= minCount) {
                                                                                return Promise.resolve();
                                                                            }
                                                                            return Promise.reject(new Error(`至少需要 ${minCount} 块硬盘`));
                                                                        },
                                                                    }),
                                                                ]}
                                                            >
                                                                <InputNumber min={1} style={{width: '100%'}}/>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Button
                                                        danger
                                                        icon={<MinusOutlined/>}
                                                        onClick={() => remove(field.name)}
                                                        style={{float: 'right'}}
                                                    />
                                                </div>
                                            ))}

                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                icon={<PlusOutlined/>}
                                            >
                                                添加硬盘组
                                            </Button>
                                        </div>
                                    )}
                                </Form.List>
                            )}

                            {/* 存储网卡信息 */}
                            {form.getFieldValue(['clusters', clusterIndex, 'nodes'])?.some(
                                node => node?.nodeType === '存储'
                            ) && (
                                <div>
                                    <Divider orientation="left">存储网卡信息</Divider>
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item
                                                name={['clusters', clusterIndex, 'network', 'nicCount']}
                                                label="网卡数量"
                                                initialValue={4}
                                            >
                                                <InputNumber min={1} max={4} style={{width: '100%'}}/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                name={['clusters', clusterIndex, 'network', 'nicType']}
                                                label="网卡类型"
                                                initialValue="TPC"
                                            >
                                                <Select options={nicTypeOptions}/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                name={['clusters', clusterIndex, 'network', 'ipCount']}
                                                label="业务网络IP数量"
                                                initialValue={5}
                                            >
                                                <InputNumber min={1} style={{width: '100%'}}/>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </Card>
                    ))}

                    <Button
                        type="dashed"
                        onClick={addCluster}
                        icon={<PlusOutlined/>}
                        style={{marginBottom: 16}}
                    >
                        添加集群
                    </Button>

                    {clusters.length > 1 && (
                        <Card style={{marginBottom: 16}}>
                            <Form.Item
                                name="envName"
                                label="合一环境名称"
                                rules={[{required: true, message: '请输入合一环境名称'}]}
                            >
                                <Input placeholder="请输入合一环境名称"/>
                            </Form.Item>
                        </Card>
                    )}

                    <div style={{textAlign: 'center', marginTop: 24}}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{marginRight: 16}}
                        >
                            提交
                        </Button>


                        <Button
                            onClick={exportConfig}
                            style={{marginRight: 16}}
                        >
                            导出配置
                        </Button>

                        {/* 修改这部分代码 */}
                        <Button style={{marginRight: 16}}>
                            <label htmlFor="file-upload" style={{cursor: 'pointer'}}>
                                导入配置
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".json"
                                onChange={importConfig}
                                style={{display: 'none'}}
                            />
                        </Button>
                    </div>
                </Form>
            </Col>

            {/* 右侧面板 */}
            <Col span={8}>
                <Card title="典型配置" style={{marginBottom: 16}}>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                        {Object.keys(TEMPLATE_CONFIGS).map(key => (
                            <Button
                                key={key}
                                type={selectedTemplate === key ? 'primary' : 'default'}
                                onClick={() => applyTemplate(key)}
                            >
                                {key}
                            </Button>
                        ))}
                    </div>
                </Card>

                <Card title="用户收藏配置" style={{marginBottom: 16}}>
                    {favorites.length === 0 ? (
                        <p>暂无收藏</p>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                            {favorites.map((fav, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 4
                                    }}
                                >
          <span
              onClick={() => applyFavorite(fav)}
              style={{
                  flex: 1,
                  cursor: 'pointer',
                  padding: '4px 0'
              }}
          >
            {fav.name}
          </span>
                                    <Button
                                        type="text"
                                        icon={<DeleteOutlined/>}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFavorites(favorites.filter((_, i) => i !== index));
                                            message.success('收藏已删除');
                                        }}
                                        danger
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <Button
                        icon={<StarOutlined/>}
                        onClick={saveAsFavorite}
                        style={{marginTop: 16}}
                    >
                        收藏当前配置
                    </Button>
                    <Modal
                        title="收藏当前配置"
                        visible={isFavoriteModalVisible}
                        onOk={() => {
                            if (favoriteName.trim()) {
                                setFavorites([...favorites, {
                                    name: favoriteName,
                                    config: form.getFieldsValue()
                                }]);
                                message.success('配置已收藏');
                                setFavoriteName('');
                                setIsFavoriteModalVisible(false);
                            } else {
                                message.error('请输入收藏名称');
                            }
                        }}
                        onCancel={() => setIsFavoriteModalVisible(false)}
                    >
                        <Input
                            placeholder="请输入收藏名称"
                            value={favoriteName}
                            onChange={(e) => setFavoriteName(e.target.value)}
                        />
                    </Modal>
                </Card>

                <Card title="典型配置描述">
                    {templateDescription ? (
                        <p>{templateDescription}</p>
                    ) : (
                        <p>请选择一个典型配置查看描述</p>
                    )}
                </Card>
            </Col>
        </Row>
    );
};

export default PacificEnvForm;