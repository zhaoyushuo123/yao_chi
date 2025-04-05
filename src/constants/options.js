

export const diskTypeOptions = [
    { label: 'SSD', value: 'SSD' },
    { label: 'HDD', value: 'HDD' }
];


// 根据业务类型和增值服务计算最小磁盘数
export const minDiskCount = (businessType, services) => {
    if (businessType === 'NAS') {
        if (services.includes('开启元数据服务') && services.includes('开启复制集群服务')) {
            return 6;
        }
        if (services.includes('开启元数据服务') || services.includes('开启复制集群服务')) {
            return 5;
        }
        return 4;
    }
    return 1; // 其他业务类型默认1块
};

// 业务大类选项
export const BUSINESS_TYPE_OPTIONS = [
    { label: 'NAS', value: 'NAS' },
    { label: 'BLOCK', value: 'BLOCK' },
    { label: 'DME', value: 'DME' }
];

// 平台选项
export const PLATFORM_OPTIONS = [
    { label: 'x86', value: 'x86' },
    { label: 'arm', value: 'arm' }
];
export const nicTypeOptions = [
    { label: 'TCP (通用网络)', value: 'TPC' },
    { label: 'RoCE (高性能网络)', value: 'ROCE' }
];

// 根据业务大类获取节点类型选项
export const NODE_TYPE_OPTIONS = (businessType) => {
    const options = [];
    if (businessType !== 'DME') {
        options.push({ label: '存储', value: '存储' });
    }
    if (businessType !== 'BLOCK') {
        options.push({ label: '客户端', value: '客户端' });
    }
    return options;
};

// 存储节点角色选项
export const STORAGE_ROLE_OPTIONS = (businessType) => {
    const options = [
        { label: 'FSM', value: 'FSM' },
        { label: 'FSA', value: 'FSA' }
    ];
    if (businessType === 'BLOCK') {
        options.push({ label: 'VBS', value: 'VBS' });
    }
    return options;
};

// 业务服务选项
export const BUSINESS_SERVICE_OPTIONS = [
    { label: 'NFS', value: 'NFS' },
    { label: 'OBS', value: 'OBS' },
    { label: 'DPC', value: 'DPC' },
    { label: 'FI', value: 'FI' },
    { label: 'HDFS_FI', value: 'HDFS_FI' }
];

// 客户端镜像选项
export const CLIENT_IMAGE_OPTIONS = [
    { label: 'centos77', value: 'centos77' },
    { label: 'ubuntu', value: 'ubuntu' },
    { label: 'euler9', value: 'euler9' }
];

// 存储镜像选项
export const STORAGE_IMAGE_OPTIONS = [
    { label: 'euler9', value: 'euler9' },
    { label: 'euler10', value: 'euler10' },
    { label: 'euler11', value: 'euler11' }
];

// 硬盘类型选项
export const DISK_TYPE_OPTIONS = [
    { label: 'SSD', value: 'SSD' },
    { label: 'HDD', value: 'HDD' }
];

// 网卡类型选项
export const NIC_TYPE_OPTIONS = [
    { label: 'TPC', value: 'TPC' },
    { label: 'ROCE', value: 'ROCE' }
];

// 集群角色选项 (需要根据业务类型动态获取)
export const getClusterRoleOptions = (businessType) => {
    switch (businessType) {
        case 'NAS':
            return [
                { label: '默认集群', value: '默认集群' },
                { label: '复制集群', value: '复制集群' },
                { label: '9000纳管本端集群', value: '9000纳管本端集群' },
                { label: '9000纳管远端集群', value: '9000纳管远端集群' }
            ];
        case 'BLOCK':
            return [
                { label: '默认集群', value: '默认集群' },
                { label: '复制集群', value: '复制集群' },
                { label: 'cps集群', value: 'cps集群' }
            ];
        case 'DME':
            return [
                { label: '默认集群', value: '默认集群' }
            ];
        default:
            return [];
    }
};

// 增值服务选项 (需要根据业务类型动态获取)
export const getValueAddedServicesOptions = (businessType) => {
    switch (businessType) {
        case 'NAS':
            return [
                { label: '开启元数据服务', value: '开启元数据服务' },
                { label: '开启复制集群服务', value: '开启复制集群服务' },
                { label: '开启分级服务', value: '开启分级服务' },
                { label: '开启dpc docker多集群服务', value: '开启dpc docker多集群服务' }
            ];
        case 'BLOCK':
            return [
                { label: '普通部署', value: '普通部署' },
                { label: 'VBS分离部署', value: 'VBS分离部署' }
            ];
        case 'DME':
            return [
                { label: 'DME集群部署', value: 'DME集群部署' },
                { label: '单DME', value: '单DME' }
            ];
        default:
            return [];
    }
};

// constants/options.js

// 节点类型选项
export const nodeTypeOptions = [
    { label: '存储', value: '存储' },
    { label: '客户端', value: '客户端' }
];

// 客户端业务服务选项
export const clientServiceOptions = [
    { label: 'NFS', value: 'NFS' },
    { label: 'OBS', value: 'OBS' },
    { label: 'DPC', value: 'DPC' },
    { label: 'FI', value: 'FI' },
    { label: 'HDFS_FI', value: 'HDFS_FI' }
];

// 存储节点角色选项
export const storageRoleOptions = [
    { label: 'FSM', value: 'FSM' },
    { label: 'FSA', value: 'FSA' },
    { label: 'VBS', value: 'VBS' }
];

// 镜像选项
export const imageOptions = [
    { label: 'centos77', value: 'centos77' },
    { label: 'ubuntu', value: 'ubuntu' },
    { label: 'euler9', value: 'euler9' },
    { label: 'euler10', value: 'euler10' },
    { label: 'euler11', value: 'euler11' }
];



// 根据业务大类返回增值服务选项
export const getAddedServiceOptions = (businessType) => {
    switch (businessType) {
        case 'NAS':
            return [
                { label: '开启元数据服务', value: 'metadata' },
                { label: '开启复制集群服务', value: 'replication' },
                { label: '开启分级服务', value: 'tiering' },
                { label: '开启dpc docker多集群服务', value: 'dpc' }
            ];
        case 'BLOCK':
            return [
                { label: 'VBS分离部署', value: 'vbs_separate' },
                { label: '普通部署', value: 'normal' }
            ];
        case 'DME':
            return [
                { label: 'DME集群部署', value: 'dme_cluster' },
                { label: '单DME', value: 'single_dme' }
            ];
        default:
            return [];
    }
};