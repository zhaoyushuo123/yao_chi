// src/components/EnvironmentForm/index.jsx
import React from 'react';
import { Form } from 'antd';
import ClusterCard from './ClusterCard';
import TemplatePanel from './TemplatePanel';

const EnvironmentForm = () => {
    const [form] = Form.useForm();

    return (
        <div className="environment-form">
            <Form form={form}>
                {/* 表单内容 */}
                <ClusterCard />
                <TemplatePanel />
            </Form>
        </div>
    );
};

export default EnvironmentForm;