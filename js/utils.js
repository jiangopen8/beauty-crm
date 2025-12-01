/**
 * 美业客户洞察 CRM - 工具函数库
 * 提供通用的工具函数和数据管理功能
 */

// ==================== LocalStorage 管理 ====================

const StorageManager = {
    // 存储键前缀
    prefix: 'beauty_crm_',

    /**
     * 设置数据
     */
    set(key, value) {
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, data);
            return true;
        } catch (error) {
            console.error('存储数据失败:', error);
            return false;
        }
    },

    /**
     * 获取数据
     */
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    },

    /**
     * 删除数据
     */
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    },

    /**
     * 清空所有数据
     */
    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
};

// ==================== 日期时间工具 ====================

const DateUtils = {
    /**
     * 格式化日期
     */
    format(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        const second = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hour)
            .replace('mm', minute)
            .replace('ss', second);
    },

    /**
     * 获取相对时间描述
     */
    fromNow(date) {
        const now = new Date();
        const target = new Date(date);
        const diff = now - target;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        if (days < 30) return `${Math.floor(days / 7)}周前`;
        if (days < 365) return `${Math.floor(days / 30)}个月前`;
        return `${Math.floor(days / 365)}年前`;
    },

    /**
     * 计算两个日期之间的天数
     */
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diff = Math.abs(d2 - d1);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    },

    /**
     * 获取今天的日期字符串
     */
    today() {
        return this.format(new Date(), 'YYYY-MM-DD');
    },

    /**
     * 获取当前时间字符串
     */
    now() {
        return this.format(new Date());
    }
};

// ==================== 数字格式化工具 ====================

const NumberUtils = {
    /**
     * 格式化金额
     */
    formatMoney(value, prefix = '¥') {
        const num = parseFloat(value);
        if (isNaN(num)) return prefix + '0.00';

        const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return prefix + formatted;
    },

    /**
     * 格式化百分比
     */
    formatPercent(value, decimals = 2) {
        const num = parseFloat(value);
        if (isNaN(num)) return '0%';
        return num.toFixed(decimals) + '%';
    },

    /**
     * 格式化数字(千分位)
     */
    formatNumber(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * 生成随机数
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// ==================== 字符串工具 ====================

const StringUtils = {
    /**
     * 截断字符串
     */
    truncate(str, length = 50, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },

    /**
     * 生成随机字符串
     */
    random(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * 生成唯一ID
     */
    uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * 手机号脱敏
     */
    maskPhone(phone) {
        if (!phone) return '';
        return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
};

// ==================== 验证工具 ====================

const Validator = {
    /**
     * 验证手机号
     */
    isPhone(value) {
        return /^1[3-9]\d{9}$/.test(value);
    },

    /**
     * 验证邮箱
     */
    isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },

    /**
     * 验证身份证
     */
    isIdCard(value) {
        return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
    },

    /**
     * 验证是否为空
     */
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    /**
     * 验证数字
     */
    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
};

// ==================== UI 工具 ====================

const UIUtils = {
    /**
     * 显示通知
     */
    notify(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fade-in`;

        const iconMap = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        notification.innerHTML = `
            <i data-lucide="${iconMap[type]}" class="w-5 h-5"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // 初始化图标
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            notification.remove();
        }, duration);
    },

    /**
     * 显示确认对话框
     */
    confirm(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay fade-in';
        overlay.innerHTML = `
            <div class="modal slide-up" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="text-lg font-bold text-gray-900">确认操作</h3>
                </div>
                <div class="modal-body">
                    <p class="text-gray-600">${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove(); ${onCancel ? onCancel.toString() + '()' : ''}">
                        取消
                    </button>
                    <button class="btn btn-danger" onclick="this.closest('.modal-overlay').remove(); ${onConfirm.toString()}()">
                        确认
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // 点击遮罩层关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        });
    },

    /**
     * 显示加载状态
     */
    showLoading(container) {
        const loading = document.createElement('div');
        loading.className = 'flex items-center justify-center p-8';
        loading.innerHTML = '<div class="spinner"></div>';
        container.appendChild(loading);
        return loading;
    },

    /**
     * 隐藏加载状态
     */
    hideLoading(loadingElement) {
        if (loadingElement) {
            loadingElement.remove();
        }
    },

    /**
     * 显示空状态
     */
    showEmpty(container, message = '暂无数据', actionText, actionCallback) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `
            <div class="empty-state-icon">
                <i data-lucide="inbox" class="w-16 h-16"></i>
            </div>
            <div class="empty-state-title">${message}</div>
            ${actionText ? `
                <button class="btn btn-primary" onclick="${actionCallback.toString()}()">
                    ${actionText}
                </button>
            ` : ''}
        `;
        container.appendChild(empty);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};

// ==================== 数组工具 ====================

const ArrayUtils = {
    /**
     * 数组去重
     */
    unique(arr, key) {
        if (!key) {
            return [...new Set(arr)];
        }
        const seen = new Set();
        return arr.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },

    /**
     * 数组分组
     */
    groupBy(arr, key) {
        return arr.reduce((groups, item) => {
            const value = item[key];
            if (!groups[value]) {
                groups[value] = [];
            }
            groups[value].push(item);
            return groups;
        }, {});
    },

    /**
     * 数组排序
     */
    sortBy(arr, key, order = 'asc') {
        return [...arr].sort((a, b) => {
            const valueA = a[key];
            const valueB = b[key];

            if (order === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
    },

    /**
     * 数组分页
     */
    paginate(arr, page = 1, pageSize = 10) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
            data: arr.slice(start, end),
            total: arr.length,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(arr.length / pageSize)
        };
    }
};

// ==================== URL 工具 ====================

const URLUtils = {
    /**
     * 获取URL参数
     */
    getParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    /**
     * 设置URL参数
     */
    setParam(name, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    /**
     * 获取所有URL参数
     */
    getAllParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
};

// ==================== 防抖和节流 ====================

const PerformanceUtils = {
    /**
     * 防抖函数
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ==================== 导出工具 ====================

// 将工具函数挂载到全局对象
window.StorageManager = StorageManager;
window.DateUtils = DateUtils;
window.NumberUtils = NumberUtils;
window.StringUtils = StringUtils;
window.Validator = Validator;
window.UIUtils = UIUtils;
window.ArrayUtils = ArrayUtils;
window.URLUtils = URLUtils;
window.PerformanceUtils = PerformanceUtils;

// 初始化演示数据(如果不存在)
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已有数据
    const customers = StorageManager.get('customers', []);

    if (customers.length === 0) {
        console.log('初始化演示数据...');
        initDemoData();
    }
});

/**
 * 初始化演示数据
 */
function initDemoData() {
    // 演示客户数据
    const demoCustomers = [
        {
            id: StringUtils.uuid(),
            name: '张小姐',
            phone: '13800138001',
            gender: '女',
            age: 28,
            source: '朋友介绍',
            status: 'active',
            tags: ['减重', '护肤'],
            createdAt: DateUtils.now(),
            lastContact: DateUtils.now()
        },
        {
            id: StringUtils.uuid(),
            name: '王女士',
            phone: '13800138002',
            gender: '女',
            age: 35,
            source: '线上推广',
            status: 'active',
            tags: ['抗衰', '美白'],
            createdAt: DateUtils.format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            lastContact: DateUtils.format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
        },
        {
            id: StringUtils.uuid(),
            name: '李小姐',
            phone: '13800138003',
            gender: '女',
            age: 32,
            source: '自然到店',
            status: 'pending',
            tags: ['祛斑', '护肤'],
            createdAt: DateUtils.format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
            lastContact: DateUtils.format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
        }
    ];

    StorageManager.set('customers', demoCustomers);
    console.log('演示数据初始化完成');
}
