export const TEMPLATE_CONFIGS = {
    '3NODE_1Client': {
        description: '3个存储节点 + 1个客户端节点',
        config: {
            clusters: [{
                clusterName: 'cluster-prod',
                businessType: 'NAS',
                platform: 'x86',
                nodes: [
                    { nodeType: '存储', storageRole: 'FSM', nodeCount: 3 },
                    { nodeType: '客户端', businessServices: ['NFS'], nodeCount: 1 }
                ],
                disks: [
                    { diskType: 'SSD', diskSize: 100, diskCount: 6 }
                ]
            }]
        }
    },
    '2NODE_HA': {
        description: '2节点高可用配置',
        config: {
            clusters: [{
                clusterName: 'cluster-ha',
                businessType: 'BLOCK',
                platform: 'arm',
                nodes: [
                    { nodeType: '存储', storageRole: 'VBS', nodeCount: 2 }
                ],
                disks: [
                    { diskType: 'SSD', diskSize: 200, diskCount: 4 }
                ]
            }]
        }
    }
};