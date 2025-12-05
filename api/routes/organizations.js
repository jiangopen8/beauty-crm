/**
 * 组织管理路由
 * GET    /api/organizations          - 获取组织列表
 * GET    /api/organizations/tree     - 获取树形组织结构
 * GET    /api/organizations/stats    - 获取统计信息
 * GET    /api/organizations/:id      - 获取单个组织详情
 * POST   /api/organizations          - 创建组织
 * PUT    /api/organizations/:id      - 更新组织信息
 * PATCH  /api/organizations/:id/status - 更新组织状态
 * DELETE /api/organizations/:id      - 删除组织
 */

const express = require('express');
const router = express.Router();
const { Organization, ORG_STATUS } = require('../models/Organization');

/**
 * 获取组织列表
 * GET /api/organizations?page=1&pageSize=10&org_type=franchisee&status=active&level=2&parent_id=1&keyword=xxx
 */
router.get('/', async (req, res) => {
    try {
        const { page, pageSize, org_type, status, level, parent_id, keyword } = req.query;

        const result = await Organization.getList({
            page: parseInt(page) || 1,
            pageSize: parseInt(pageSize) || 100,  // 默认100条，获取所有组织
            org_type,
            status,
            level,
            parent_id,
            keyword
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('获取组织列表失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取组织列表失败'
            }
        });
    }
});

/**
 * 获取树形组织结构
 * GET /api/organizations/tree
 */
router.get('/tree', async (req, res) => {
    try {
        const tree = await Organization.getTree();

        res.json({
            success: true,
            data: tree
        });
    } catch (error) {
        console.error('获取组织树失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取组织树失败'
            }
        });
    }
});

/**
 * 获取统计信息
 * GET /api/organizations/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await Organization.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('获取统计信息失败:', error);
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
 * 根据ID获取组织详情
 * GET /api/organizations/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const org = await Organization.findById(parseInt(id));

        if (!org) {
            return res.json({
                success: false,
                error: {
                    code: 'ORG_NOT_FOUND',
                    message: '组织不存在'
                }
            });
        }

        res.json({
            success: true,
            data: org
        });
    } catch (error) {
        console.error('获取组织详情失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取组织详情失败'
            }
        });
    }
});

/**
 * 创建组织
 * POST /api/organizations
 */
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        // 验证必填字段
        if (!data.org_code || !data.org_name || !data.org_type) {
            return res.json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '缺少必填字段'
                }
            });
        }

        const orgId = await Organization.create(data);

        res.json({
            success: true,
            data: {
                id: orgId,
                message: '组织创建成功'
            }
        });
    } catch (error) {
        console.error('创建组织失败:', error);
        res.json({
            success: false,
            error: {
                code: 'CREATE_FAILED',
                message: error.message || '创建组织失败'
            }
        });
    }
});

/**
 * 更新组织信息
 * PUT /api/organizations/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const org = await Organization.update(parseInt(id), data);

        res.json({
            success: true,
            data: org,
            message: '组织信息更新成功'
        });
    } catch (error) {
        console.error('更新组织失败:', error);
        res.json({
            success: false,
            error: {
                code: 'UPDATE_FAILED',
                message: error.message || '更新组织失败'
            }
        });
    }
});

/**
 * 更新组织状态
 * PATCH /api/organizations/:id/status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !Object.values(ORG_STATUS).includes(status)) {
            return res.json({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: '无效的状态值'
                }
            });
        }

        const org = await Organization.updateStatus(parseInt(id), status);

        res.json({
            success: true,
            data: org,
            message: '状态更新成功'
        });
    } catch (error) {
        console.error('更新状态失败:', error);
        res.json({
            success: false,
            error: {
                code: 'UPDATE_FAILED',
                message: error.message || '更新状态失败'
            }
        });
    }
});

/**
 * 删除组织
 * DELETE /api/organizations/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await Organization.delete(parseInt(id));

        res.json({
            success: true,
            message: '组织删除成功'
        });
    } catch (error) {
        console.error('删除组织失败:', error);
        res.json({
            success: false,
            error: {
                code: 'DELETE_FAILED',
                message: error.message || '删除组织失败'
            }
        });
    }
});

module.exports = router;
