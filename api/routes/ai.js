/**
 * AI 相关 API 路由
 * 提供 AI 润色、生成等功能
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

/**
 * 润色客户案例
 * POST /api/ai/polish-case
 * Body: { case_title, customer_name, case_type, initial_problems, treatment_plan, results, ... }
 */
router.post('/polish-case', async (req, res) => {
    try {
        const caseData = req.body;

        // 验证必要字段
        if (!caseData.case_title && !caseData.initial_problems && !caseData.results) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '至少需要提供案例标题、初始问题或效果说明之一'
                }
            });
        }

        // 调用 AI 服务
        const marketingCopy = await aiService.polishCase(caseData);

        res.json({
            success: true,
            data: {
                marketing_copy: marketingCopy
            },
            message: 'AI 润色成功'
        });
    } catch (error) {
        console.error('润色案例失败:', error);

        // 判断错误类型
        if (error.message.includes('KIMI_API_KEY')) {
            return res.status(500).json({
                success: false,
                error: {
                    code: 'AI_NOT_CONFIGURED',
                    message: 'AI 服务未配置，请联系管理员'
                }
            });
        }

        if (error.message.includes('Kimi API')) {
            return res.status(503).json({
                success: false,
                error: {
                    code: 'AI_SERVICE_ERROR',
                    message: 'AI 服务暂时不可用，请稍后重试',
                    details: error.message
                }
            });
        }

        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'AI 润色失败',
                details: error.message
            }
        });
    }
});

/**
 * 生成案例标题建议
 * POST /api/ai/suggest-titles
 * Body: { case_type, initial_problems, results }
 */
router.post('/suggest-titles', async (req, res) => {
    try {
        const caseData = req.body;

        // 调用 AI 服务
        const titles = await aiService.suggestTitles(caseData);

        res.json({
            success: true,
            data: {
                titles: titles
            },
            message: '标题生成成功'
        });
    } catch (error) {
        console.error('生成标题失败:', error);

        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '标题生成失败',
                details: error.message
            }
        });
    }
});

/**
 * 测试 AI 服务连接
 * GET /api/ai/test
 */
router.get('/test', async (req, res) => {
    try {
        const testData = {
            case_title: '测试案例',
            case_type: 'skin_care',
            initial_problems: '皮肤暗沉、缺水',
            results: '皮肤变得水润有光泽'
        };

        const result = await aiService.polishCase(testData);

        res.json({
            success: true,
            data: {
                message: 'AI 服务连接正常',
                test_result: result
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'AI_TEST_FAILED',
                message: 'AI 服务测试失败',
                details: error.message
            }
        });
    }
});

module.exports = router;
