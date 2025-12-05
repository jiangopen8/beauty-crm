/**
 * 认证中间件
 * 用于验证JWT Token和用户权限
 */

const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');

/**
 * JWT验证中间件
 * 验证请求头中的Token是否有效
 */
function authenticate(req, res, next) {
    try {
        // 从请求头提取Token
        const token = extractTokenFromHeader(req);

        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json(
                unauthorized('缺少认证Token')
            );
        }

        // 验证Token
        const decoded = verifyToken(token);

        // 将用户信息挂载到req对象上
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            orgId: decoded.orgId
        };

        next();
    } catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
            unauthorized(error.message)
        );
    }
}

/**
 * 可选认证中间件
 * Token存在时验证，不存在时也放行
 */
function optionalAuthenticate(req, res, next) {
    try {
        const token = extractTokenFromHeader(req);

        if (token) {
            const decoded = verifyToken(token);
            req.user = {
                userId: decoded.userId,
                username: decoded.username,
                orgId: decoded.orgId
            };
        }

        next();
    } catch (error) {
        // Token无效时也放行，但不设置req.user
        next();
    }
}

/**
 * 权限检查中间件工厂
 * 检查用户是否有指定权限
 * @param {string|Array} requiredPermissions - 需要的权限
 */
function authorize(...requiredPermissions) {
    return async (req, res, next) => {
        try {
            // 确保用户已认证
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json(
                    unauthorized('请先登录')
                );
            }

            // TODO: 从数据库查询用户权限
            // 这里先简单通过，后续实现完整的权限系统
            // const userPermissions = await getUserPermissions(req.user.userId);

            // 暂时放行所有已认证用户
            next();

            // 完整实现示例：
            /*
            const hasPermission = requiredPermissions.some(permission =>
                userPermissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(HTTP_STATUS.FORBIDDEN).json(
                    forbidden('没有权限访问此资源')
                );
            }

            next();
            */
        } catch (error) {
            next(error);
        }
    };
}

/**
 * 机构权限检查中间件
 * 确保用户只能访问自己机构的数据
 * @param {string} orgIdField - 请求参数中机构ID的字段名
 */
function checkOrgPermission(orgIdField = 'orgId') {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json(
                    unauthorized('请先登录')
                );
            }

            // 从路径参数、查询参数或请求体中获取机构ID
            const requestedOrgId = req.params[orgIdField] ||
                                  req.query[orgIdField] ||
                                  req.body[orgIdField];

            // 超级管理员可以访问所有机构数据
            // TODO: 从数据库查询用户角色
            // if (req.user.role === 'super_admin') {
            //     return next();
            // }

            // 检查机构权限
            if (requestedOrgId && requestedOrgId !== req.user.orgId.toString()) {
                return res.status(HTTP_STATUS.FORBIDDEN).json(
                    forbidden('无权访问其他机构的数据')
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = {
    authenticate,
    optionalAuthenticate,
    authorize,
    checkOrgPermission
};
