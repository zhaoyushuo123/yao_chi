import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * 自定义防抖Hook
 * @param {Function} callback - 需要防抖的函数
 * @param {number} delay - 防抖延迟时间(毫秒)
 * @param {boolean} [immediate=false] - 是否立即执行第一次调用
 * @returns {Function} 防抖后的函数
 *
 * @example
 * // 标准防抖(延迟执行)
 * const debouncedSearch = useDebounce(searchAPI, 300);
 *
 * // 立即执行防抖(第一次立即执行，后续防抖)
 * const debouncedSubmit = useDebounce(handleSubmit, 500, true);
 */
function useDebounce(callback, delay, immediate = false) {
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);
    const shouldExecuteRef = useRef(immediate);

    // 更新callback引用
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // 清除定时器
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // 防抖函数实现
    const debouncedFunction = useCallback((...args) => {
        if (shouldExecuteRef.current) {
            // 立即执行模式
            callbackRef.current(...args);
            shouldExecuteRef.current = false;
        } else {
            // 标准防抖模式
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
                if (immediate) {
                    shouldExecuteRef.current = true;
                }
            }, delay);
        }
    }, [delay, immediate]);

    // 手动取消防抖
    const cancelDebounce = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        shouldExecuteRef.current = immediate;
    }, [immediate]);

    return [debouncedFunction, cancelDebounce];
}

// PropTypes 类型检查
useDebounce.propTypes = {
    callback: PropTypes.func.isRequired,
    delay: PropTypes.number.isRequired,
    immediate: PropTypes.bool
};

export default useDebounce;