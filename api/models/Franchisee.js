/**
 * 加盟商数据模型
 * 对应数据库 organizations 表（org_type='franchisee'）
 */

const db = require('../config/db');
const { ORG_TYPES, ORG_STATUS, PAGINATION } = require('../config/constants');

class Franchisee {
    /**
     * 获取加盟商列表
     * @param {object} filters - 筛选条件
     * @returns {Promise<Array>} 加盟商列表
     */
    static async findAll(filters = {}) {
        const {
            status,
            search,
            province,
            city,
            page = PAGINATION.DEFAULT_PAGE,
            pageSize = PAGINATION.DEFAULT_PAGE_SIZE
        } = filters;

        let sql = `
            SELECT
                id,
                org_code,
                org_name,
                org_type,
                parent_id,
                level,
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
                status,
                created_at,
                updated_at
            FROM organizations
            WHERE org_type = ?
            AND is_deleted = 0
        `;

        const params = [ORG_TYPES.FRANCHISEE];

        // 状态筛选
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        // 省份筛选
        if (province) {
            sql += ' AND province = ?';
            params.push(province);
        }

        // 城市筛选
        if (city) {
            sql += ' AND city = ?';
            params.push(city);
        }

        // 搜索（加盟商名称、城市、联系人）
        if (search) {
            sql += ' AND (org_name LIKE ? OR city LIKE ? OR contact_person LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // 排序
        sql += ' ORDER BY created_at DESC';

        // 分页
        const pageNum = Number(page) || PAGINATION.DEFAULT_PAGE;
        const pageSizeNum = Number(pageSize) || PAGINATION.DEFAULT_PAGE_SIZE;
        const offsetNum = (pageNum - 1) * pageSizeNum;

        sql += ` LIMIT ${pageSizeNum} OFFSET ${offsetNum}`;

        return await db.query(sql, params);
    }

    /**
     * 获取加盟商总数
     * @param {object} filters - 筛选条件
     * @returns {Promise<number>} 总数
     */
    static async count(filters = {}) {
        const { status, search, province, city } = filters;

        let sql = `
            SELECT COUNT(*) as total
            FROM organizations
            WHERE org_type = ?
            AND is_deleted = 0
        `;

        const params = [ORG_TYPES.FRANCHISEE];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (province) {
            sql += ' AND province = ?';
            params.push(province);
        }

        if (city) {
            sql += ' AND city = ?';
            params.push(city);
        }

        if (search) {
            sql += ' AND (org_name LIKE ? OR city LIKE ? OR contact_person LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        const result = await db.query(sql, params);
        return result[0].total;
    }

    /**
     * 根据ID获取加盟商详情
     * @param {number} id - 加盟商ID
     * @returns {Promise<object|null>} 加盟商信息
     */
    static async findById(id) {
        const sql = `
            SELECT *
            FROM organizations
            WHERE id = ?
            AND org_type = ?
            AND is_deleted = 0
        `;

        const result = await db.query(sql, [id, ORG_TYPES.FRANCHISEE]);
        return result[0] || null;
    }

    /**
     * 根据机构编码获取加盟商
     * @param {string} orgCode - 机构编码
     * @returns {Promise<object|null>} 加盟商信息
     */
    static async findByOrgCode(orgCode) {
        const sql = `
            SELECT *
            FROM organizations
            WHERE org_code = ?
            AND org_type = ?
            AND is_deleted = 0
        `;

        const result = await db.query(sql, [orgCode, ORG_TYPES.FRANCHISEE]);
        return result[0] || null;
    }

    /**
     * 创建加盟商
     * @param {object} data - 加盟商数据
     * @returns {Promise<number>} 新建加盟商的ID
     */
    static async create(data) {
        const sql = `
            INSERT INTO organizations (
                org_code, org_name, org_type, parent_id, level,
                franchisee_level, contract_no, contract_start_date, contract_end_date,
                revenue_share_rate, contact_person, contact_phone, contact_email,
                province, city, district, address, longitude, latitude,
                status, logo_url, description, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.org_code,
            data.org_name,
            ORG_TYPES.FRANCHISEE,
            data.parent_id || null,
            2, // 加盟商层级为2
            data.franchisee_level || 'standard',
            data.contract_no || null,
            data.contract_start_date || null,
            data.contract_end_date || null,
            data.revenue_share_rate || 0,
            data.contact_person || null,
            data.contact_phone || null,
            data.contact_email || null,
            data.province || null,
            data.city || null,
            data.district || null,
            data.address || null,
            data.longitude || null,
            data.latitude || null,
            data.status || ORG_STATUS.ACTIVE,
            data.logo_url || null,
            data.description || null,
            data.created_by || null
        ];

        const result = await db.query(sql, params);
        return result.insertId;
    }

    /**
     * 更新加盟商信息
     * @param {number} id - 加盟商ID
     * @param {object} data - 更新数据
     * @returns {Promise<boolean>} 是否更新成功
     */
    static async update(id, data) {
        // 准备更新数据
        const updateData = {
            ...data,
            updated_at: new Date()
        };

        // 移除不允许更新的字段
        delete updateData.id;
        delete updateData.org_type;
        delete updateData.org_code; // 机构编码不允许更新
        delete updateData.created_at;
        delete updateData.is_deleted;

        // 构建SET子句
        const fields = Object.keys(updateData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updateData[field]);

        const sql = `
            UPDATE organizations
            SET ${setClause}
            WHERE id = ?
            AND org_type = ?
            AND is_deleted = 0
        `;

        const params = [...values, id, ORG_TYPES.FRANCHISEE];
        const result = await db.query(sql, params);
        return result.affectedRows > 0;
    }

    /**
     * 删除加盟商（软删除）
     * @param {number} id - 加盟商ID
     * @returns {Promise<boolean>} 是否删除成功
     */
    static async delete(id) {
        const sql = `
            UPDATE organizations
            SET is_deleted = 1, updated_at = NOW()
            WHERE id = ?
            AND org_type = ?
        `;

        const result = await db.query(sql, [id, ORG_TYPES.FRANCHISEE]);
        return result.affectedRows > 0;
    }

    /**
     * 获取统计数据
     * @returns {Promise<object>} 统计信息
     */
    static async getStats() {
        const sql = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_count,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_count
            FROM organizations
            WHERE org_type = ?
            AND is_deleted = 0
        `;

        const result = await db.query(sql, [ORG_TYPES.FRANCHISEE]);
        return result[0];
    }

    /**
     * 更新加盟商状态
     * @param {number} id - 加盟商ID
     * @param {string} status - 新状态
     * @returns {Promise<boolean>} 是否更新成功
     */
    static async updateStatus(id, status) {
        const sql = `
            UPDATE organizations
            SET status = ?, updated_at = NOW()
            WHERE id = ?
            AND org_type = ?
            AND is_deleted = 0
        `;

        const result = await db.query(sql, [status, id, ORG_TYPES.FRANCHISEE]);
        return result.affectedRows > 0;
    }
}

module.exports = Franchisee;
