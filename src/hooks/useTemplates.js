import TemplatePanel from "../components/EnvironmentForm/TemplatePanel";

export const TEMPLATES = {
    '3NODE_1Client': {
        description: '3节点存储集群配置...',
        config: {
            clusterInfo: [{
                clusterName: '3节点存储集群',
                businessType: 'nas',
                nodeInfo: [
                    { nodeType: 'storage', nodeRole: 'fsm', nodeCount: 2 },
                    { nodeType: 'storage', nodeRole: 'fsa', nodeCount: 1 },
                    { nodeType: 'client', nodeCount: 1 }
                ]
            }]
        }
    },
    // 其他模板...
};
export default TemplatePanel()