import React from 'react';
import { Button, Tooltip, Space } from 'antd';
import {
    PlusOutlined,
    MinusCircleOutlined,
    StarOutlined,
    StarFilled,
    DownloadOutlined,
    UploadOutlined,
    QuestionCircleOutlined,
    EditOutlined,
    CopyOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * 通用操作按钮组件
 * @param {object} props - 组件属性
 * @param {string} props.type - 按钮类型: 'add' | 'remove' | 'favorite' | 'download' | 'upload' | 'help' | 'edit' | 'copy' | 'delete'
 * @param {boolean} props.active - 是否激活状态（用于收藏等切换状态）
 * @param {string} [props.size='small'] - 按钮尺寸
 * @param {string} [props.tooltip] - 提示文字
 * @param {function} props.onClick - 点击回调
 * @param {ReactNode} [props.children] - 子元素
 */
const ActionButton = ({
                          type,
                          active,
                          size = 'small',
                          tooltip,
                          onClick,
                          children,
                          ...rest
                      }) => {
    // 按钮类型配置
    const buttonConfig = {
        add: {
            icon: <PlusOutlined />,
            text: '添加',
            props: { type: 'dashed' }
        },
        remove: {
            icon: <MinusCircleOutlined />,
            text: '删除',
            props: { danger: true }
        },
        favorite: {
            icon: active ? <StarFilled /> : <StarOutlined />,
            text: '收藏',
            props: {
                type: active ? 'primary' : 'text',
                style: { color: active ? '#faad14' : undefined }
            }
        },
        download: {
            icon: <DownloadOutlined />,
            text: '导出',
            props: { type: 'text' }
        },
        upload: {
            icon: <UploadOutlined />,
            text: '导入',
            props: { type: 'text' }
        },
        help: {
            icon: <QuestionCircleOutlined />,
            text: '帮助',
            props: { type: 'text' }
        },
        edit: {
            icon: <EditOutlined />,
            text: '编辑',
            props: { type: 'link' }
        },
        copy: {
            icon: <CopyOutlined />,
            text: '复制',
            props: { type: 'link' }
        },
        delete: {
            icon: <DeleteOutlined />,
            text: '删除',
            props: { danger: true, type: 'text' }
        }
    };

    const { icon, text, props: typeProps } = buttonConfig[type] || {};

    const button = (
        <Button
            size={size}
            icon={icon}
            onClick={onClick}
            {...typeProps}
            {...rest}
            style={{
                display: 'flex',
                alignItems: 'center',
                ...rest.style
            }}
        >
            {children || text}
        </Button>
    );

    return tooltip ? (
        <Tooltip title={tooltip}>
            {button}
        </Tooltip>
    ) : button;
};

// PropTypes 类型检查
ActionButton.propTypes = {
    type: PropTypes.oneOf([
        'add', 'remove', 'favorite', 'download',
        'upload', 'help', 'edit', 'copy', 'delete'
    ]).isRequired,
    active: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'middle', 'large']),
    tooltip: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.node
};

export default React.memo(ActionButton);