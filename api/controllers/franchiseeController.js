/**
 * 加盟商控制器
 * 处理加盟商相关的HTTP请求
 */

const Franchisee = require('../models/Franchisee');
const { success, successWithPagination, error, notFound } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { PAGINATION } = require('../config/constants');

/**
 * 获取加盟商列表
 * GET /api/franchisees
 */
exports.getFranchisees = asyncHandler(async (req, res) => {
    const {
        status,
        search,
        province,
        city,
        page = PAGINATION.DEFAULT_PAGE,
        pageSize = PAGINATION.DEFAULT_PAGE_SIZE
    } = req.query;

    // 验证分页参数
    const validPageSize = Math.min(
        parseInt(pageSize),
        PAGINATION.MAX_PAGE_SIZE
    );

    const filters = {
        status,
        search,
        province,
        city,
        page: parseInt(page),
        pageSize: validPageSize
    };

    // 获取列表和总数
    const [franchisees, total] = await Promise.all([
        Franchisee.findAll(filters),
        Franchisee.count(filters)
    ]);

    res.json(successWithPagination(
        franchisees,
        total,
        filters.page,
        filters.pageSize
    ));
});

/**
 * 获取加盟商详情
 * GET /api/franchisees/:id
 */
exports.getFranchiseeById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const franchisee = await Franchisee.findById(id);

    if (!franchisee) {
        return res.status(404).json(notFound('加盟商不存在'));
    }

    res.json(success(franchisee));
});

/**
 * 创建加盟商
 * POST /api/franchisees
 */
exports.createFranchisee = asyncHandler(async (req, res) => {
    const {
        org_code,
        org_name,
        franchisee_level,
        contract_no,
        contract_start_date,
        contract_end_date,
        revenue_share_rate,
        contact_person,
        contact_phone,
        contact_email,
        province,
        city,
        district,
        address,
        longitude,
        latitude,
        description
    } = req.body;

    // 基本验证
    if (!org_code || !org_name) {
        return res.status(400).json(error('机构编码和名称不能为空', 'VALIDATION_ERROR'));
    }

    // 检查机构编码是否已存在
    const existing = await Franchisee.findByOrgCode(org_code);
    if (existing) {
        return res.status(409).json(error('机构编码已存在', 'ALREADY_EXISTS'));
    }

    // 创建加盟商
    const franchiseeData = {
        org_code,
        org_name,
        franchisee_level,
        contract_no,
        contract_start_date,
        contract_end_date,
        revenue_share_rate,
        contact_person,
        contact_phone,
        contact_email,
        province,
        city,
        district,
        address,
        longitude,
        latitude,
        description,
        created_by: req.user ? req.user.userId : null
    };

    const franchiseeId = await Franchisee.create(franchiseeData);

    // 获取新创建的加盟商信息
    const newFranchisee = await Franchisee.findById(franchiseeId);

    res.status(201).json(success(newFranchisee, '加盟商创建成功'));
});

/**
 * 更新加盟商信息
 * PUT /api/franchisees/:id
 */
exports.updateFranchisee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查加盟商是否存在
    const franchisee = await Franchisee.findById(id);
    if (!franchisee) {
        return res.status(404).json(notFound('加盟商不存在'));
    }

    // 更新数据
    const updateData = {
        ...req.body,
        updated_by: req.user ? req.user.userId : null
    };

    const updated = await Franchisee.update(id, updateData);

    if (!updated) {
        return res.status(500).json(error('更新失败'));
    }

    // 获取更新后的信息
    const updatedFranchisee = await Franchisee.findById(id);

    res.json(success(updatedFranchisee, '加盟商信息更新成功'));
});

/**
 * 删除加盟商（软删除）
 * DELETE /api/franchisees/:id
 */
exports.deleteFranchisee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 检查加盟商是否存在
    const franchisee = await Franchisee.findById(id);
    if (!franchisee) {
        return res.status(404).json(notFound('加盟商不存在'));
    }

    const deleted = await Franchisee.delete(id);

    if (!deleted) {
        return res.status(500).json(error('删除失败'));
    }

    res.json(success(null, '加盟商删除成功'));
});

/**
 * 获取加盟商统计数据
 * GET /api/franchisees/stats
 */
exports.getStats = asyncHandler(async (req, res) => {
    const stats = await Franchisee.getStats();

    res.json(success(stats));
});

/**
 * 更新加盟商状态
 * PATCH /api/franchisees/:id/status
 */
exports.updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json(error('状态不能为空', 'VALIDATION_ERROR'));
    }

    // 检查加盟商是否存在
    const franchisee = await Franchisee.findById(id);
    if (!franchisee) {
        return res.status(404).json(notFound('加盟商不存在'));
    }

    const updated = await Franchisee.updateStatus(id, status);

    if (!updated) {
        return res.status(500).json(error('状态更新失败'));
    }

    res.json(success({ id, status }, '状态更新成功'));
});
