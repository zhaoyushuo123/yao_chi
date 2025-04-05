import React from 'react';
import { Typography, Form, Input, Button } from 'antd';

const { Title } = Typography;

const OtherProduct = () => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        console.log('Form values:', values);
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>其他产品表单</Title>
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    name="productName"
                    label="产品名称"
                    rules={[{ required: true, message: '请输入产品名称' }]}
                >
                    <Input placeholder="请输入产品名称" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        提交
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default OtherProduct;