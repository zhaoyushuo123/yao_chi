// 获取默认集群配置
export const getDefaultCluster = () => ({
    clusterName: '',
    businessType: undefined,
    nodeInfo: [{ nodeType: undefined }],
    diskInfo: [{ diskType: 'ssd', diskSize: 80, diskCount: 4 }]
});

// 验证VBS节点
export const validateVBSNodes = (form, name) => {
    const nodeInfo = form.getFieldValue(['clusterInfo', name, 'nodeInfo']) || [];
    const vbsNodes = nodeInfo
        .filter(node => node?.nodeType === 'storage' && node?.nodeRole === 'vbs')
        .reduce((sum, node) => sum + (node.nodeCount || 0), 0);

    return vbsNodes >= 6;
};