// src/types/cluster.ts

export interface ClusterNode {
    nodeType: 'storage' | 'client';
    count: number;
    // 其他节点字段...
}

export interface ClusterDisk {
    diskType: 'SSD' | 'HDD';
    size: number;
    count: number;
}

export interface Cluster {
    id: number;
    name?: string;
    businessType?: 'NAS' | 'BLOCK' | 'DME';
    nodes?: ClusterNode[];
    disks?: ClusterDisk[];
    // 其他集群字段...
}