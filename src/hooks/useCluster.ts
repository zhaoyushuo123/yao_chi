// src/hooks/useCluster.ts
import { useState, useEffect } from 'react';
import { FormInstance } from 'antd/es/form';
import { Cluster, ClusterNode, ClusterDisk } from '../types/cluster';

interface UseClusterOptions {
    form?: FormInstance;
    maxClusters?: number;
    minClusters?: number;
}

interface UseClusterResult {
    clusters: Cluster[];
    addCluster: () => void;
    removeCluster: (id: number) => boolean;
    updateCluster: (id: number, updates: Partial<Cluster>) => void;
    resetClusters: () => void;
}

const useCluster = (options: UseClusterOptions = {}): UseClusterResult => {
    const { form, maxClusters = 5, minClusters = 1 } = options;

    // 初始化状态
    const [clusters, setClusters] = useState<Cluster[]>([
        {
            id: 1,
            name: 'cluster-1',
            businessType: 'NAS',
            nodes: [{ nodeType: 'storage', count: 1 }],
            disks: [{ diskType: 'SSD', size: 100, count: 3 }]
        }
    ]);

    // 数据同步
    useEffect(() => {
        try {
            // 同步到 Antd Form
            form?.setFieldsValue({ clusters });

            // 持久化到 localStorage（按需启用）
            // localStorage.setItem('cluster-config', JSON.stringify(clusters));
        } catch (error) {
            console.error('集群状态同步失败:', error);
        }
    }, [clusters, form]);

    // 操作方法
    const addCluster = () => {
        if (clusters.length >= maxClusters) {
            console.warn(`最多允许 ${maxClusters} 个集群`);
            return;
        }

        const newId = Math.max(...clusters.map(c => c.id), 0) + 1;
        const newCluster: Cluster = {
            id: newId,
            name: `cluster-${newId}`,
            businessType: 'NAS',
            nodes: [],
            disks: []
        };

        setClusters([...clusters, newCluster]);
    };

    const removeCluster = (id: number): boolean => {
        if (clusters.length <= minClusters) {
            console.warn(`至少需要保留 ${minClusters} 个集群`);
            return false;
        }
        setClusters(clusters.filter(c => c.id !== id));
        return true;
    };

    const updateCluster = (id: number, updates: Partial<Cluster>) => {
        setClusters(clusters.map(c =>
            c.id === id ? { ...c, ...updates } : c
        ));
    };

    const resetClusters = () => {
        setClusters([
            {
                id: 1,
                name: 'cluster-1',
                businessType: 'NAS',
                nodes: [],
                disks: []
            }
        ]);
    };

    return {
        clusters,
        addCluster,
        removeCluster,
        updateCluster,
        resetClusters
    };
};

export default useCluster;