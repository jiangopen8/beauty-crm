const express = require('express');
const router = express.Router();
const { User, USER_STATUS } = require('../models/User');
const bcrypt = require('bcrypt');

/**
 * 获取当前用户信息
 * GET /api/users/current
 */
router.get('/current', async (req, res) => {
    try {
        // TODO: 从session/token获取当前用户ID
        // 暂时使用固定ID演示
        const userId = 1;

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: '用户不存在'
                }
            });
        }

        // 移除敏感信息
        delete user.password_hash;

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('获取当前用户信息失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取用户信息失败'
            }
        });
    }
});

/**
 * 获取用户列表
 * GET /api/users?page=1&pageSize=10&org_id=1&status=active&keyword=xxx
 */
router.get('/', async (req, res) => {
    try {
        const { page, pageSize, org_id, status, keyword } = req.query;

        const result = await User.getList({
            page: parseInt(page) || 1,
            pageSize: parseInt(pageSize) || 10,
            org_id: org_id ? parseInt(org_id) : null,
            status,
            keyword
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取用户列表失败'
            }
        });
    }
});

/**
 * 获取用户统计信息
 * GET /api/users/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const { org_id } = req.query;
        const stats = await User.getStats(org_id ? parseInt(org_id) : null);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('获取用户统计失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取统计信息失败'
            }
        });
    }
});

/**
 * 根据ID获取用户详情
 * GET /api/users/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(parseInt(id));

        if (!user) {
            return res.json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: '用户不存在'
                }
            });
        }

        // 移除敏感信息
        delete user.password_hash;

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('获取用户详情失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取用户详情失败'
            }
        });
    }
});

/**
 * 创建用户
 * POST /api/users
 */
router.post('/', async (req, res) => {
    try {
        const { username, password, real_name, org_id, phone, email, gender, position } = req.body;

        // 验证必填字段
        if (!username || !password || !real_name || !org_id) {
            return res.json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '缺少必填字段'
                }
            });
        }

        // 检查用户名是否已存在
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.json({
                success: false,
                error: {
                    code: 'USERNAME_EXISTS',
                    message: '用户名已存在'
                }
            });
        }

        // 密码加密
        const password_hash = await bcrypt.hash(password, 10);

        const userId = await User.create({
            username,
            password_hash,
            real_name,
            org_id: parseInt(org_id),
            phone,
            email,
            gender,
            position,
            created_by: 1 // TODO: 从session获取当前用户ID
        });

        res.json({
            success: true,
            data: {
                id: userId,
                message: '用户创建成功'
            }
        });
    } catch (error) {
        console.error('创建用户失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '创建用户失败'
            }
        });
    }
});

/**
 * 更新用户信息
 * PUT /api/users/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const success = await User.update(parseInt(id), updateData);

        if (!success) {
            return res.json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: '用户更新失败'
                }
            });
        }

        // 返回更新后的用户信息
        const user = await User.findById(parseInt(id));
        delete user.password_hash;

        res.json({
            success: true,
            data: user,
            message: '用户信息更新成功'
        });
    } catch (error) {
        console.error('更新用户失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '更新用户失败'
            }
        });
    }
});

/**
 * 更新用户状态
 * PATCH /api/users/:id/status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(USER_STATUS).includes(status)) {
            return res.json({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: '无效的状态值'
                }
            });
        }

        const success = await User.updateStatus(parseInt(id), status);

        if (!success) {
            return res.json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: '状态更新失败'
                }
            });
        }

        res.json({
            success: true,
            message: '状态更新成功'
        });
    } catch (error) {
        console.error('更新用户状态失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '更新用户状态失败'
            }
        });
    }
});

/**
 * 更新密码
 * PATCH /api/users/:id/password
 */
router.patch('/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '缺少必填字段'
                }
            });
        }

        // 获取用户信息（包含密码哈希）
        const user = await User.findByIdWithPassword(parseInt(id));
        if (!user) {
            return res.json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: '用户不存在'
                }
            });
        }

        // 验证旧密码
        const isValidPassword = await bcrypt.compare(old_password, user.password_hash);
        if (!isValidPassword) {
            return res.json({
                success: false,
                error: {
                    code: 'INVALID_PASSWORD',
                    message: '原密码错误'
                }
            });
        }

        // 加密新密码
        const password_hash = await bcrypt.hash(new_password, 10);
        const success = await User.updatePassword(parseInt(id), password_hash);

        if (!success) {
            return res.json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: '密码更新失败'
                }
            });
        }

        res.json({
            success: true,
            message: '密码更新成功'
        });
    } catch (error) {
        console.error('更新密码失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '更新密码失败'
            }
        });
    }
});

/**
 * 管理员重置用户密码
 * POST /api/users/:id/reset-password
 */
router.post('/:id/reset-password', async (req, res) => {
    try {
        const { id } = req.params;

        // 获取用户信息
        const user = await User.findById(parseInt(id));
        if (!user) {
            return res.json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: '用户不存在'
                }
            });
        }

        // 重置为默认密码 "123456"
        const defaultPassword = '123456';
        const password_hash = await bcrypt.hash(defaultPassword, 10);
        const success = await User.updatePassword(parseInt(id), password_hash);

        if (!success) {
            return res.json({
                success: false,
                error: {
                    code: 'RESET_FAILED',
                    message: '密码重置失败'
                }
            });
        }

        res.json({
            success: true,
            message: '密码已重置为默认密码'
        });
    } catch (error) {
        console.error('重置密码失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '重置密码失败'
            }
        });
    }
});

/**
 * 删除用户
 * DELETE /api/users/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await User.delete(parseInt(id));

        if (!success) {
            return res.json({
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: '删除失败'
                }
            });
        }

        res.json({
            success: true,
            message: '用户删除成功'
        });
    } catch (error) {
        console.error('删除用户失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '删除用户失败'
            }
        });
    }
});

module.exports = router;
