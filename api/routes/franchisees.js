/**
 * 加盟商路由
 * 定义加盟商管理相关的API端点
 */

const express = require('express');
const router = express.Router();
const franchiseeController = require('../controllers/franchiseeController');
// const { authenticate } = require('../middleware/auth');

// 注意：暂时注释掉认证中间件，方便测试
// 生产环境请取消注释以启用认证

/**
 * @route   GET /api/franchisees/stats
 * @desc    获取加盟商统计数据
 * @access  Public（测试阶段），Private（生产环境）
 */
router.get('/stats', franchiseeController.getStats);

/**
 * @route   GET /api/franchisees
 * @desc    获取加盟商列表（支持筛选、搜索、分页）
 * @access  Public（测试阶段），Private（生产环境）
 * @query   {string} status - 状态筛选（active/inactive/suspended）
 * @query   {string} search - 搜索关键词（名称、城市、联系人）
 * @query   {string} province - 省份筛选
 * @query   {string} city - 城市筛选
 * @query   {number} page - 页码（默认1）
 * @query   {number} pageSize - 每页大小（默认20，最大100）
 */
router.get('/', franchiseeController.getFranchisees);

/**
 * @route   GET /api/franchisees/:id
 * @desc    获取加盟商详情
 * @access  Public（测试阶段），Private（生产环境）
 * @param   {number} id - 加盟商ID
 */
router.get('/:id', franchiseeController.getFranchiseeById);

/**
 * @route   POST /api/franchisees
 * @desc    创建加盟商
 * @access  Public（测试阶段），Private（生产环境）
 * @body    {object} franchiseeData - 加盟商数据
 */
router.post('/', franchiseeController.createFranchisee);

/**
 * @route   PUT /api/franchisees/:id
 * @desc    更新加盟商信息
 * @access  Public（测试阶段），Private（生产环境）
 * @param   {number} id - 加盟商ID
 * @body    {object} updateData - 更新数据
 */
router.put('/:id', franchiseeController.updateFranchisee);

/**
 * @route   PATCH /api/franchisees/:id/status
 * @desc    更新加盟商状态
 * @access  Public（测试阶段），Private（生产环境）
 * @param   {number} id - 加盟商ID
 * @body    {string} status - 新状态（active/inactive/suspended）
 */
router.patch('/:id/status', franchiseeController.updateStatus);

/**
 * @route   DELETE /api/franchisees/:id
 * @desc    删除加盟商（软删除）
 * @access  Public（测试阶段），Private（生产环境）
 * @param   {number} id - 加盟商ID
 */
router.delete('/:id', franchiseeController.deleteFranchisee);

module.exports = router;
