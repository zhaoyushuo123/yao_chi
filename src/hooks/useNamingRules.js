// src/hooks/useNamingRules.js
import { useState, useEffect } from 'react';

const useNamingRules = () => {
    const [isValid, setIsValid] = useState(true);

    const validateName = (name) => {
        // 示例校验规则：名称必须以字母开头，长度在 3 到 20 个字符之间
        const regex = /^[A-Za-z][A-Za-z0-9_]{2,19}$/;
        setIsValid(regex.test(name));
    };

    useEffect(() => {
        // 初始化校验逻辑
    }, []);

    return { isValid, validateName };
};

export default useNamingRules;