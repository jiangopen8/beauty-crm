/**
 * 业务常量定义
 */

// 机构类型
const ORG_TYPES = {
    PLATFORM: 'platform',      // 平台/总部
    FRANCHISEE: 'franchisee',  // 加盟商
    STORE: 'store'             // 门店
};

// 机构状态
const ORG_STATUS = {
    ACTIVE: 'active',          // 正常运营
    INACTIVE: 'inactive',      // 停用
    SUSPENDED: 'suspended'     // 暂停
};

// 加盟商等级
const FRANCHISEE_LEVELS = {
    FLAGSHIP: 'flagship',      // 旗舰店
    STANDARD: 'standard',      // 标准店
    COMMUNITY: 'community'     // 社区店
};

// 用户状态
const USER_STATUS = {
    ACTIVE: 'active',          // 正常
    INACTIVE: 'inactive',      // 停用
    LOCKED: 'locked'           // 锁定
};

// 客户状态
const CUSTOMER_STATUS = {
    POTENTIAL: 'potential',    // 潜在客户
    ACTIVE: 'active',          // 活跃客户
    INACTIVE: 'inactive',      // 不活跃
    LOST: 'lost'              // 流失客户
};

// 订单状态
const ORDER_STATUS = {
    PENDING: 'pending',        // 待确认
    CONFIRMED: 'confirmed',    // 已确认
    IN_PROGRESS: 'in_progress', // 进行中
    COMPLETED: 'completed',    // 已完成
    CANCELLED: 'cancelled'     // 已取消
};

// 任务状态
const TASK_STATUS = {
    PENDING: 'pending',        // 待处理
    IN_PROGRESS: 'in_progress', // 进行中
    COMPLETED: 'completed',    // 已完成
    CANCELLED: 'cancelled',    // 已取消
    OVERDUE: 'overdue'        // 已逾期
};

// 任务优先级
const TASK_PRIORITY = {
    LOW: 'low',               // 低
    MEDIUM: 'medium',         // 中
    HIGH: 'high',             // 高
    URGENT: 'urgent'          // 紧急
};

// 分页默认值
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
};

// HTTP状态码
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

// 错误码
const ERROR_CODES = {
    // 认证相关
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',

    // 资源相关
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    CONFLICT: 'CONFLICT',

    // 验证相关
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_PARAMETER: 'INVALID_PARAMETER',

    // 系统相关
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

module.exports = {
    ORG_TYPES,
    ORG_STATUS,
    FRANCHISEE_LEVELS,
    USER_STATUS,
    CUSTOMER_STATUS,
    ORDER_STATUS,
    TASK_STATUS,
    TASK_PRIORITY,
    PAGINATION,
    HTTP_STATUS,
    ERROR_CODES
};
