export const TEMPLATES = {
    '3NODE_1Client': {
        description: '3节点存储集群+1客户端',
        config: {
            clusterInfo: [{
                clusterName: '3节点集群',
                businessType: 'nas',
                platform: 'x86',
                nodeInfo: [
                    { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2 },
                    { nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1 },
                    { nodeType: 'client', nodeCount: 1 }
                ],
                diskInfo: [
                    { diskType: 'ssd', diskSize: 80, diskCount: 5 }
                ]
            }]
        }
    },
    'BLOCK_Template': {
        description: '块存储基础模板',
        config: {
            clusterInfo: [{
                clusterName: '块存储集群',
                businessType: 'block',
                platform: 'x86',
                nodeInfo: [
                    { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 3 }
                ],
                diskInfo: [
                    { diskType: 'ssd', diskSize: 80, diskCount: 6 }
                ]
            }]
        }
    }
};