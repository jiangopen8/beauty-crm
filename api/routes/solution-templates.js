/**
 * 方案模板路由
 * RESTful API endpoints for solution templates
 */

const express = require('express');
const router = express.Router();
const SolutionTemplate = require('../models/SolutionTemplate');

/**
 * 获取模板列表
 * GET /api/solution-templates
 * Query params: org_id, category, scope, status, search, page, pageSize
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            org_id: req.query.org_id,
            category: req.query.category,
            scope: req.query.scope,
            status: req.query.status,
            search: req.query.search,
            page: req.query.page,
            pageSize: req.query.pageSize
        };

        const result = await SolutionTemplate.getList(filters);

        res.json({
            success: true,
            data: result,
            message: '获取模板列表成功'
        });
    } catch (error) {
        console.error('获取模板列表失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取模板列表失败',
                details: error.message
            }
        });
    }
});

/**
 * 获取模板详情
 * GET /api/solution-templates/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const template = await SolutionTemplate.getById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: '模板不存在'
                }
            });
        }

        res.json({
            success: true,
            data: template,
            message: '获取模板详情成功'
        });
    } catch (error) {
        console.error('获取模板详情失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取模板详情失败',
                details: error.message
            }
        });
    }
});

/**
 * 创建模板
 * POST /api/solution-templates
 * Body: { template_name, category, org_id, scope, ... }
 */
router.post('/', async (req, res) => {
    try {
        // 验证必填字段
        if (!req.body.template_name) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '模板名称不能为空'
                }
            });
        }

        if (!req.body.category) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '模板分类不能为空'
                }
            });
        }

        const template = await SolutionTemplate.create(req.body);

        res.status(201).json({
            success: true,
            data: template,
            message: '创建模板成功'
        });
    } catch (error) {
        console.error('创建模板失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '创建模板失败',
                details: error.message
            }
        });
    }
});

/**
 * 更新模板
 * PUT /api/solution-templates/:id
 * Body: { template_name, category, ... }
 */
router.put('/:id', async (req, res) => {
    try {
        // 验证模板是否存在
        const existingTemplate = await SolutionTemplate.getById(req.params.id);
        if (!existingTemplate) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: '模板不存在'
                }
            });
        }

        // 验证必填字段
        if (!req.body.template_name) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '模板名称不能为空'
                }
            });
        }

        if (!req.body.category) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '模板分类不能为空'
                }
            });
        }

        const template = await SolutionTemplate.update(req.params.id, req.body);

        res.json({
            success: true,
            data: template,
            message: '更新模板成功'
        });
    } catch (error) {
        console.error('更新模板失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '更新模板失败',
                details: error.message
            }
        });
    }
});

/**
 * 更新模板状态
 * PATCH /api/solution-templates/:id/status
 * Body: { status: 'active' | 'inactive' }
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '无效的状态值'
                }
            });
        }

        const template = await SolutionTemplate.updateStatus(req.params.id, status);

        res.json({
            success: true,
            data: template,
            message: '更新状态成功'
        });
    } catch (error) {
        console.error('更新状态失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '更新状态失败',
                details: error.message
            }
        });
    }
});

/**
 * 删除模板
 * DELETE /api/solution-templates/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        // 验证模板是否存在
        const existingTemplate = await SolutionTemplate.getById(req.params.id);
        if (!existingTemplate) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: '模板不存在'
                }
            });
        }

        await SolutionTemplate.delete(req.params.id);

        res.json({
            success: true,
            message: '删除模板成功'
        });
    } catch (error) {
        console.error('删除模板失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '删除模板失败',
                details: error.message
            }
        });
    }
});

/**
 * 增加使用次数
 * POST /api/solution-templates/:id/increment-usage
 */
router.post('/:id/increment-usage', async (req, res) => {
    try {
        const template = await SolutionTemplate.incrementUsageCount(req.params.id);

        res.json({
            success: true,
            data: template,
            message: '使用次数已增加'
        });
    } catch (error) {
        console.error('增加使用次数失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '增加使用次数失败',
                details: error.message
            }
        });
    }
});

/**
 * 获取统计信息
 * GET /api/solution-templates/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await SolutionTemplate.getStats(req.query.org_id);

        res.json({
            success: true,
            data: stats,
            message: '获取统计信息成功'
        });
    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取统计信息失败',
                details: error.message
            }
        });
    }
});

module.exports = router;
