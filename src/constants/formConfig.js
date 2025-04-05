/**
 * 表单配置常量
 * 包含默认值、选项列表和验证规则
 */

// 业务类型选项
export const BUSINESS_TYPE_OPTIONS = [
    { value: 'block', label: '块存储 (Block)' },
    { value: 'nas', label: '文件存储 (NAS)' },
    { value: 'dme', label: '数据管理引擎 (DME)' }
];

// 平台类型选项
export const PLATFORM_OPTIONS = [
    { value: 'x86', label: 'x86 架构' },
    { value: 'arm', label: 'ARM 架构' }
];

// 集群角色选项
export const CLUSTER_ROLE_OPTIONS = [
    { value: 'default', label: '默认集群' },
    { value: 'local', label: '9000纳管本端集群' },
    { value: 'remote', label: '9000纳管远端集群' },
    { value: 'cps', label: 'CPS本端集群' }
];

// 存储镜像选项
export const STORAGE_IMAGE_OPTIONS = [
    { value: 'euler8', label: 'EulerOS 8' },
    { value: 'euler9', label: 'EulerOS 9' },
    { value: 'centos7', label: 'CentOS 7.9' }
];

// 客户端镜像选项
export const CLIENT_IMAGE_OPTIONS = [
    { value: 'ubuntu20', label: 'Ubuntu 20.04' },
    { value: 'centos77', label: 'CentOS 7.7' },
    { value: 'euler12', label: 'EulerOS 12' }
];

// 磁盘类型选项
export const DISK_TYPE_OPTIONS = [
    { value: 'ssd', label: 'SSD' },
    { value: 'hdd', label: 'HDD' },
    { value: 'nvme', label: 'NVMe' }
];

// 网络类型选项
export const NETWORK_TYPE_OPTIONS = [
    { value: 'tcp', label: 'TCP' },
    { value: 'roce', label: 'RoCE' },
    { value: 'ib', label: 'InfiniBand' }
];

// 客户端服务选项
export const CLIENT_SERVICE_OPTIONS = [
    { value: 'nfs', label: 'NFS' },
    { value: 'obs', label: 'OBS' },
    { value: 'dpc', label: 'DPC' },
    { value: 'fi', label: 'FI' },
    { value: 'hdfs', label: 'HDFS' }
];

// 默认集群配置
export const DEFAULT_CLUSTER_CONFIG = {
    clusterName: '',
    businessType: undefined,
    platform: 'x86',
    clusterRole: 'default',
    storageImage: 'euler8',
    clientImage: 'ubuntu20',
    vbsSeparateDeploy: false,
    enableMetadata: false,
    enableReplication: false,
    enableTiering: false,
    nodeInfo: [{
        nodeType: undefined,
        nodeRole: undefined,
        nodeCount: 1,
        clientServices: ['nfs']
    }],
    diskInfo: [{
        diskType: 'ssd',
        diskSize: 80,
        diskCount: 4
    }],
    networkInfo: {
        nicCount: 4,
        nicType: 'tcp',
        ipCount: 5
    }
};

// 表单验证规则
export const VALIDATION_RULES = {
    clusterName: [
        { required: true, message: '请输入集群名称' },
        { max: 32, message: '名称不超过32个字符' }
    ],
    businessType: [
        { required: true, message: '请选择业务类型' }
    ],
    nodeCount: [
        { required: true, message: '请输入节点数量' },
        { type: 'number', min: 1, max: 100, message: '数量范围1-100' }
    ],
    diskSize: [
        { required: true, message: '请输入磁盘容量' },
        { type: 'number', min: 10, max: 32768, message: '容量范围10-32768GB' }
    ],
    nicCount: [
        { required: true, message: '请输入网卡数量' },
        { type: 'number', min: 1, max: 8, message: '数量范围1-8' }
    ]
};

// 业务类型特定配置
export const BUSINESS_TYPE_CONFIG = {
    block: {
        requiredNodeRoles: ['fsm', 'fsa', 'vbs'],
        minVBSNodes: 6,
        diskRequirements: {
            minCount: 6,
            recommendedSize: 200
        }
    },
    nas: {
        requiredNodeRoles: ['fsm', 'fsa'],
        diskRequirements: {
            minCount: 4,
            recommendedSize: 80
        }
    },
    dme: {
        requiredNodeRoles: [],
        diskRequirements: null
    }
};

// 获取业务类型配置
export const getBusinessConfig = (businessType) => {
    return BUSINESS_TYPE_CONFIG[businessType] || BUSINESS_TYPE_CONFIG.nas;
};

// 根据配置生成磁盘默认值
export const getDefaultDisks = (businessType, hasMetadata = false) => {
    const config = getBusinessConfig(businessType);
    if (!config.diskRequirements) return [];

    const minCount = hasMetadata ?
        config.diskRequirements.minCount + 1 :
        config.diskRequirements.minCount;

    return [{
        diskType: 'ssd',
        diskSize: config.diskRequirements.recommendedSize,
        diskCount: minCount
    }];
};