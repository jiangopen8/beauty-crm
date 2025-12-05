const express = require('express');
const router = express.Router();
const { Role, ROLE_STATUS, DATA_SCOPE } = require('../models/Role');

/**
 * 获取角色列表
 * GET /api/roles?page=1&pageSize=20&status=active&keyword=xxx
 */
router.get('/', async (req, res) => {
    try {
        const { page, pageSize, status, keyword } = req.query;

        const result = await Role.getList({
            page: parseInt(page) || 1,
            pageSize: parseInt(pageSize) || 20,
            status,
            keyword
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('获取角色列表失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取角色列表失败',
                details: error.message
            }
        });
    }
});

/**
 * 获取角色统计信息
 * GET /api/roles/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await Role.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('获取角色统计失败:', error);
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
 * 获取角色详情
 * GET /api/roles/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(parseInt(id));

        if (!role) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ROLE_NOT_FOUND',
                    message: '角色不存在'
                }
            });
        }

        res.json({
            success: true,
            data: role
        });
    } catch (error) {
        console.error('获取角色详情失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取角色详情失败',
                details: error.message
            }
        });
    }
});

/**
 * 创建角色
 * POST /api/roles
 * Body: { role_code, role_name, description, data_scope, status, permissions }
 */
router.post('/', async (req, res) => {
    try {
        const { role_code, role_name, description, data_scope, status, permissions } = req.body;

        // 验证必填字段
        if (!role_code || !role_name) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '角色代码和角色名称为必填项'
                }
            });
        }

        // TODO: 从session/token获取当前用户ID
        const created_by = 1;

        // 创建角色
        const roleId = await Role.create({
            role_code: role_code.trim(),
            role_name: role_name.trim(),
            description: description ? description.trim() : null,
            data_scope: data_scope || DATA_SCOPE.SELF,
            status: status || ROLE_STATUS.ACTIVE,
            created_by
        });

        // 如果提供了权限列表，设置权限
        if (permissions && Array.isArray(permissions) && permissions.length > 0) {
            await Role.setPermissions(roleId, permissions, created_by);
        }

        // 获取完整的角色信息
        const newRole = await Role.findById(roleId);

        res.status(201).json({
            success: true,
            data: newRole,
            message: '角色创建成功'
        });
    } catch (error) {
        console.error('创建角色失败:', error);

        // 如果是角色代码已存在的错误
        if (error.message && error.message.includes('已存在')) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'ROLE_CODE_EXISTS',
                    message: error.message
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '创建角色失败',
                details: error.message
            }
        });
    }
});

/**
 * 更新角色
 * PUT /api/roles/:id
 * Body: { role_name, description, data_scope, status }
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role_name, description, data_scope, status, permissions } = req.body;

        // 检查角色是否存在
        const existingRole = await Role.findById(parseInt(id));
        if (!existingRole) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ROLE_NOT_FOUND',
                    message: '角色不存在'
                }
            });
        }

        // 不允许修改超级管理员角色的某些字段
        if (existingRole.role_code === 'super_admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'CANNOT_MODIFY_SUPER_ADMIN',
                    message: '不能修改超级管理员角色'
                }
            });
        }

        // 更新角色基本信息
        const updateData = {};
        if (role_name !== undefined) updateData.role_name = role_name.trim();
        if (description !== undefined) updateData.description = description ? description.trim() : null;
        if (data_scope !== undefined) updateData.data_scope = data_scope;
        if (status !== undefined) updateData.status = status;

        if (Object.keys(updateData).length > 0) {
            await Role.update(parseInt(id), updateData);
        }

        // 如果提供了权限列表，更新权限
        if (permissions !== undefined && Array.isArray(permissions)) {
            // TODO: 从session/token获取当前用户ID
            const created_by = 1;
            await Role.setPermissions(parseInt(id), permissions, created_by);
        }

        // 获取更新后的角色信息
        const updatedRole = await Role.findById(parseInt(id));

        res.json({
            success: true,
            data: updatedRole,
            message: '角色更新成功'
        });
    } catch (error) {
        console.error('更新角色失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '更新角色失败',
                details: error.message
            }
        });
    }
});

/**
 * 删除角色
 * DELETE /api/roles/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 检查角色是否存在
        const role = await Role.findById(parseInt(id));
        if (!role) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ROLE_NOT_FOUND',
                    message: '角色不存在'
                }
            });
        }

        // 不允许删除超级管理员角色
        if (role.role_code === 'super_admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'CANNOT_DELETE_SUPER_ADMIN',
                    message: '不能删除超级管理员角色'
                }
            });
        }

        // 删除角色
        await Role.delete(parseInt(id));

        res.json({
            success: true,
            message: '角色删除成功'
        });
    } catch (error) {
        console.error('删除角色失败:', error);

        // 如果是有用户关联的错误
        if (error.message && error.message.includes('用户关联')) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'ROLE_HAS_USERS',
                    message: error.message
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '删除角色失败',
                details: error.message
            }
        });
    }
});

/**
 * 为用户分配角色
 * POST /api/roles/assign-user
 * Body: { user_id, role_ids: [1, 2, 3] }
 */
router.post('/assign-user', async (req, res) => {
    try {
        const { user_id, role_ids } = req.body;

        if (!user_id || !Array.isArray(role_ids)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '用户ID和角色ID列表为必填项'
                }
            });
        }

        // TODO: 从session/token获取当前用户ID
        const created_by = 1;

        await Role.assignToUser(parseInt(user_id), role_ids, created_by);

        res.json({
            success: true,
            message: '角色分配成功'
        });
    } catch (error) {
        console.error('分配角色失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '分配角色失败',
                details: error.message
            }
        });
    }
});

/**
 * 获取用户的角色列表
 * GET /api/roles/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const roles = await Role.getUserRoles(parseInt(userId));

        res.json({
            success: true,
            data: roles
        });
    } catch (error) {
        console.error('获取用户角色失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取用户角色失败',
                details: error.message
            }
        });
    }
});

module.exports = router;
