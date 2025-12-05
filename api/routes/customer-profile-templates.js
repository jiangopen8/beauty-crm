/**
 * 客户资料模板 API 路由
 */

const express = require('express');
const router = express.Router();
const CustomerProfileTemplate = require('../models/CustomerProfileTemplate');

/**
 * 获取模板列表
 * GET /api/customer-profile-templates
 * 查询参数：
 * - org_id: 机构ID
 * - scope: 共享范围 (global/org/private)
 * - apply_scene: 适用场景
 * - status: 状态
 * - search: 搜索关键词
 * - page: 页码
 * - pageSize: 每页数量
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            org_id: req.query.org_id,
            scope: req.query.scope,
            apply_scene: req.query.apply_scene,
            status: req.query.status,
            search: req.query.search,
            page: req.query.page,
            pageSize: req.query.pageSize
        };

        const result = await CustomerProfileTemplate.getList(filters);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('获取模板列表失败:', error);
        res.status(500).json({
            success: false,
            error: {
                message: '获取模板列表失败',
                details: error.message
            }
        });
    }
});

/**
 * 获取模板详情
 * GET /api/customer-profile-templates/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const template = await CustomerProfileTemplate.getById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                error: {
                    message: '模板不存在'
                }
            });
        }

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('获取模板详情失败:', error);
        res.status(500).json({
            success: false,
            error: {
                message: '获取模板详情失败',
                details: error.message
            }
        });
    }
});

/**
 * 创建模板
 * POST /api/customer-profile-templates
 */
router.post('/', async (req, res) => {
    try {
        const requiredFields = ['template_name', 'fields'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `缺少必填字段: ${missingFields.join(', ')}`
                }
            });
        }

        const template = await CustomerProfileTemplate.create(req.body);
        res.status(201).json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('创建模板失败:', error);
        res.status(500).json({
            success: false,
            error: {
                message: '创建模板失败',
                details: error.message
            }
        });
    }
});

/**
 * 更新模板
 * PUT /api/customer-profile-templates/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const template = await CustomerProfileTemplate.update(req.params.id, req.body);

        if (!template) {
            return res.status(404).json({
                success: false,
                error: {
                    message: '模板不存在'
                }
            });
        }

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('更新模板失败:', error);
        res.status(500).json({
            success: false,
            error: {
                message: '更新模板失败',
                details: error.message
            }
        });
    }
});

/**
 * 更新模板状态
 * PATCH /api/customer-profile-templates/:id/status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: {
                    message: '缺少状态参数'
                }
            });
        }

        const template = await CustomerProfileTemplate.updateStatus(req.params.id, status);

        if (!template) {
            return res.status(404).json({
                success: false,
                error: {
                    message: '模板不存在'
                }
            });
        }

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('更新模板状态失败:', error);
        res.status(500).json({
            success: false,
            error: {
                message: '更新模板状态失败',
                details: error.message
            }
        });
    }
});

/**
 * 删除模板
 * DELETE /api/customer-profile-templates/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        await CustomerProfileTemplate.delete(req.params.id);
        res.json({
            success: true,
            message: '模板已删除'
        });
    } catch (error) {
        console.error('删除模板失败:', error);
        res.status(500).json({
            success: false,
            error: {
                message: '删除模板失败',
                details: error.message
            }
        });
    }
});

/**
 * 增加模板使用次数
 * POST /api/customer-profile-templates/:id/increment-usage
 */
router.post('/:id/increment-usage', async (req, res) => {
    try {
        const template = await CustomerProfileTemplate.incrementUsageCount(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                error: {
                    message: '模板不存在'
                }
            });
        }

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('增加使用次数失败:', error);
        res.status(500).json({
            success: false,
            error: {
                message: '增加使用次数失败',
                details: error.message
            }
        });
    }
});

/**
 * 获取统计信息
 * GET /api/customer-profile-templates/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const orgId = req.query.org_id;
        const stats = await CustomerProfileTemplate.getStats(orgId);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({
            success: false,
            error: {
                message: '获取统计信息失败',
                details: error.message
            }
        });
    }
});

/**
 * 复制模板
 * POST /api/customer-profile-templates/:id/duplicate
 */
router.post('/:id/duplicate', async (req, res) => {
    try {
        const template = await CustomerProfileTemplate.duplicate(req.params.id, req.body);
        res.status(201).json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('复制模板失败:', error);
        res.status(500).json({
            success: false,
            error: {
                message: '复制模板失败',
                details: error.message
            }
        });
    }
});

module.exports = router;
