import { Card, Button, Descriptions, Tag, message } from 'antd';
import { TEMPLATE_CONFIGS } from '../../constants/templates';
import {useState} from "react";

const TemplatePanel = ({ form }) => {
    const [activeTemplate, setActiveTemplate] = useState(null);

    // 应用模板配置
    const applyTemplate = (templateKey) => {
        const template = TEMPLATE_CONFIGS[templateKey];
        if (!template) return;

        form.setFieldsValue(template.config);
        setActiveTemplate(templateKey);
        message.success(`已应用模板: ${templateKey}`);
    };

    return (
        <Card title="典型配置" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.keys(TEMPLATE_CONFIGS).map(key => (
                    <Button
                        key={key}
                        type={activeTemplate === key ? 'primary' : 'default'}
                        onClick={() => applyTemplate(key)}
                        style={{ flex: '1 1 calc(50% - 8px)', minWidth: 120 }}
                    >
                        {key}
                    </Button>
                ))}
            </div>

            {activeTemplate && (
                <Descriptions
                    column={1}
                    size="small"
                    style={{ marginTop: 16 }}
                >
                    <Descriptions.Item label="模板描述">
                        {TEMPLATE_CONFIGS[activeTemplate].description}
                    </Descriptions.Item>
                    <Descriptions.Item label="业务类型">
                        <Tag color="blue">
                            {TEMPLATE_CONFIGS[activeTemplate].config.clusters[0].businessType}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="节点组成">
                        {TEMPLATE_CONFIGS[activeTemplate].config.clusters[0].nodes
                            .map(n => `${n.nodeType}x${n.nodeCount}`)
                            .join(' + ')}
                    </Descriptions.Item>
                </Descriptions>
            )}
        </Card>
    );
};

export default TemplatePanel;