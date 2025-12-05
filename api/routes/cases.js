const express = require('express');
const router = express.Router();
const { Case } = require('../models/Case');

/**
 * 获取案例列表
 * GET /api/cases?page=1&pageSize=10&org_id=1&case_type=skin_care&is_featured=1&keyword=xxx
 */
router.get('/', async (req, res) => {
    try {
        const { page, pageSize, org_id, case_type, is_featured, keyword } = req.query;

        // 验证必需参数
        if (!org_id) {
            return res.json({
                success: false,
                error: {
                    code: 'MISSING_ORG_ID',
                    message: '缺少组织ID参数'
                }
            });
        }

        const result = await Case.getList({
            page: parseInt(page) || 1,
            pageSize: parseInt(pageSize) || 10,
            org_id: parseInt(org_id),
            case_type,
            is_featured: is_featured !== undefined ? is_featured === 'true' || is_featured === '1' : null,
            keyword
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('获取案例列表失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取案例列表失败'
            }
        });
    }
});

/**
 * 获取案例统计信息
 * GET /api/cases/stats?org_id=1
 */
router.get('/stats', async (req, res) => {
    try {
        const { org_id } = req.query;

        // 验证必需参数
        if (!org_id) {
            return res.json({
                success: false,
                error: {
                    code: 'MISSING_ORG_ID',
                    message: '缺少组织ID参数'
                }
            });
        }

        const stats = await Case.getStats(parseInt(org_id));

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('获取案例统计失败:', error);
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
 * 根据ID获取案例详情
 * GET /api/cases/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const caseData = await Case.findById(parseInt(id));

        if (!caseData) {
            return res.json({
                success: false,
                error: {
                    code: 'CASE_NOT_FOUND',
                    message: '案例不存在'
                }
            });
        }

        res.json({
            success: true,
            data: caseData
        });
    } catch (error) {
        console.error('获取案例详情失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取案例详情失败'
            }
        });
    }
});

/**
 * 创建案例
 * POST /api/cases
 */
router.post('/', async (req, res) => {
    try {
        const {
            customer_id,
            org_id,
            case_title,
            case_type,
            service_period,
            service_frequency,
            initial_problems,
            treatment_plan,
            products_used,
            results,
            before_photos,
            after_photos,
            customer_feedback,
            satisfaction_score,
            is_featured,
            is_public,
            display_order
        } = req.body;

        // 验证必填字段
        if (!org_id || !case_title) {
            return res.json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '缺少必填字段：org_id 和 case_title 是必填的'
                }
            });
        }

        const caseId = await Case.create({
            customer_id,
            org_id: parseInt(org_id),
            case_title,
            case_type,
            service_period,
            service_frequency,
            initial_problems,
            treatment_plan,
            products_used,
            results,
            before_photos,
            after_photos,
            customer_feedback,
            satisfaction_score,
            is_featured,
            is_public,
            display_order,
            created_by: 1 // TODO: 从session获取当前用户ID
        });

        res.json({
            success: true,
            data: {
                id: caseId,
                message: '案例创建成功'
            }
        });
    } catch (error) {
        console.error('创建案例失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '创建案例失败'
            }
        });
    }
});

/**
 * 更新案例
 * PUT /api/cases/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const success = await Case.update(parseInt(id), updateData);

        if (!success) {
            return res.json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: '案例更新失败'
                }
            });
        }

        // 返回更新后的案例信息
        const caseData = await Case.findById(parseInt(id));

        res.json({
            success: true,
            data: caseData,
            message: '案例更新成功'
        });
    } catch (error) {
        console.error('更新案例失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '更新案例失败'
            }
        });
    }
});

/**
 * 更新精选状态
 * PATCH /api/cases/:id/featured
 */
router.patch('/:id/featured', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_featured } = req.body;

        const success = await Case.updateFeatured(parseInt(id), is_featured);

        if (!success) {
            return res.json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: '更新失败'
                }
            });
        }

        res.json({
            success: true,
            message: '精选状态更新成功'
        });
    } catch (error) {
        console.error('更新精选状态失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '更新精选状态失败'
            }
        });
    }
});

/**
 * 更新公开状态
 * PATCH /api/cases/:id/public
 */
router.patch('/:id/public', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_public } = req.body;

        const success = await Case.updatePublic(parseInt(id), is_public);

        if (!success) {
            return res.json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: '更新失败'
                }
            });
        }

        res.json({
            success: true,
            message: '公开状态更新成功'
        });
    } catch (error) {
        console.error('更新公开状态失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '更新公开状态失败'
            }
        });
    }
});

/**
 * 删除案例
 * DELETE /api/cases/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Case.delete(parseInt(id));

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
            message: '案例删除成功'
        });
    } catch (error) {
        console.error('删除案例失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '删除案例失败'
            }
        });
    }
});

module.exports = router;
