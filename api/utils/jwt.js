/**
 * JWT工具函数
 * 用于生成和验证JWT Token
 */

const jwt = require('jsonwebtoken');

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 生成JWT Token
 * @param {object} payload - Token载荷数据
 * @param {string} expiresIn - 过期时间（可选）
 * @returns {string} JWT Token
 */
function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: expiresIn
        });
    } catch (error) {
        console.error('JWT生成失败:', error);
        throw new Error('Token生成失败');
    }
}

/**
 * 验证JWT Token
 * @param {string} token - JWT Token
 * @returns {object} 解码后的payload
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token已过期');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('无效的Token');
        } else {
            throw new Error('Token验证失败');
        }
    }
}

/**
 * 解码JWT Token（不验证签名）
 * @param {string} token - JWT Token
 * @returns {object} 解码后的数据
 */
function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('JWT解码失败:', error);
        return null;
    }
}

/**
 * 从请求头中提取Token
 * @param {object} req - Express请求对象
 * @returns {string|null} Token字符串
 */
function extractTokenFromHeader(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    // 支持 "Bearer token" 格式
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // 直接返回token
    return authHeader;
}

/**
 * 生成用户Token
 * @param {object} user - 用户信息
 * @returns {object} Token信息
 */
function generateUserToken(user) {
    const payload = {
        userId: user.id,
        username: user.username,
        orgId: user.org_id,
        type: 'access'
    };

    const token = generateToken(payload);

    return {
        token: token,
        type: 'Bearer',
        expiresIn: JWT_EXPIRES_IN
    };
}

/**
 * 刷新Token
 * @param {string} oldToken - 旧Token
 * @returns {string} 新Token
 */
function refreshToken(oldToken) {
    try {
        const decoded = verifyToken(oldToken);

        // 移除过期时间等JWT标准字段
        delete decoded.iat;
        delete decoded.exp;
        delete decoded.nbf;

        return generateToken(decoded);
    } catch (error) {
        throw new Error('Token刷新失败');
    }
}

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    extractTokenFromHeader,
    generateUserToken,
    refreshToken,
    JWT_SECRET,
    JWT_EXPIRES_IN
};
