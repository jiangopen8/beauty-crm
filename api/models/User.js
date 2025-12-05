const db = require('../config/db');

/**
 * 用户状态枚举
 */
const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    LOCKED: 'locked'
};

/**
 * 性别枚举
 */
const GENDER = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other'
};

/**
 * 用户模型
 */
class User {
    /**
     * 根据ID获取用户信息（包含组织信息）
     */
    static async findById(id) {
        const sql = `
            SELECT
                u.id,
                u.username,
                u.real_name,
                u.org_id,
                u.phone,
                u.email,
                u.gender,
                u.avatar_url,
                u.position,
                u.status,
                u.last_login_at,
                u.last_login_ip,
                u.login_count,
                u.created_at,
                o.org_code,
                o.org_name,
                o.org_type,
                o.level AS org_level
            FROM users u
            LEFT JOIN organizations o ON u.org_id = o.id
            WHERE u.id = ? AND u.is_deleted = 0
        `;

        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    /**
     * 根据ID获取用户信息（包含密码哈希，用于密码验证）
     */
    static async findByIdWithPassword(id) {
        const sql = `
            SELECT
                u.id,
                u.username,
                u.password_hash,
                u.real_name,
                u.org_id,
                u.status
            FROM users u
            WHERE u.id = ? AND u.is_deleted = 0
        `;

        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    /**
     * 根据用户名获取用户（用于登录）
     */
    static async findByUsername(username) {
        const sql = `
            SELECT
                u.*,
                o.org_code,
                o.org_name,
                o.org_type
            FROM users u
            LEFT JOIN organizations o ON u.org_id = o.id
            WHERE u.username = ? AND u.is_deleted = 0
        `;

        const rows = await db.query(sql, [username]);
        return rows[0] || null;
    }

    /**
     * 获取用户列表（分页）
     */
    static async getList({ page = 1, pageSize = 10, org_id, status, keyword }) {
        const offset = (page - 1) * pageSize;

        let whereClauses = ['u.is_deleted = 0'];
        const params = [];

        if (org_id) {
            whereClauses.push('u.org_id = ?');
            params.push(parseInt(org_id));
        }

        if (status) {
            whereClauses.push('u.status = ?');
            params.push(status);
        }

        if (keyword) {
            whereClauses.push('(u.username LIKE ? OR u.real_name LIKE ? OR u.phone LIKE ?)');
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword);
        }

        const whereClause = whereClauses.join(' AND ');

        // 获取总数
        const countSql = `
            SELECT COUNT(*) as total
            FROM users u
            WHERE ${whereClause}
        `;
        const countResult = await db.query(countSql, params);
        const total = countResult[0]?.total || 0;

        // 获取列表 - 使用字符串拼接LIMIT和OFFSET避免参数类型问题
        const sql = `
            SELECT
                u.id,
                u.username,
                u.real_name,
                u.org_id,
                u.phone,
                u.email,
                u.gender,
                u.avatar_url,
                u.position,
                u.status,
                u.last_login_at,
                u.created_at,
                o.org_name,
                o.org_type
            FROM users u
            LEFT JOIN organizations o ON u.org_id = o.id
            WHERE ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ${parseInt(pageSize)} OFFSET ${parseInt(offset)}
        `;

        const rows = await db.query(sql, params);

        return {
            items: rows,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    }

    /**
     * 创建用户
     */
    static async create(data) {
        const sql = `
            INSERT INTO users (
                username,
                password_hash,
                real_name,
                org_id,
                phone,
                email,
                gender,
                avatar_url,
                position,
                status,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.username,
            data.password_hash,
            data.real_name,
            data.org_id,
            data.phone || null,
            data.email || null,
            data.gender || null,
            data.avatar_url || null,
            data.position || null,
            data.status || USER_STATUS.ACTIVE,
            data.created_by || null
        ];

        const result = await db.query(sql, params);
        return result.insertId;
    }

    /**
     * 更新用户信息
     */
    static async update(id, data) {
        const updateData = {
            ...data,
            updated_at: new Date()
        };

        // 移除不允许更新的字段
        delete updateData.id;
        delete updateData.username; // 用户名不允许修改
        delete updateData.password_hash; // 密码单独接口修改
        delete updateData.created_at;
        delete updateData.is_deleted;

        const fields = Object.keys(updateData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updateData[field]);

        const sql = `
            UPDATE users
            SET ${setClause}
            WHERE id = ? AND is_deleted = 0
        `;

        const params = [...values, id];
        const result = await db.query(sql, params);
        return result.affectedRows > 0;
    }

    /**
     * 更新用户状态
     */
    static async updateStatus(id, status) {
        const sql = `
            UPDATE users
            SET status = ?, updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `;

        const result = await db.query(sql, [status, id]);
        return result.affectedRows > 0;
    }

    /**
     * 更新密码
     */
    static async updatePassword(id, password_hash) {
        const sql = `
            UPDATE users
            SET password_hash = ?, updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `;

        const result = await db.query(sql, [password_hash, id]);
        return result.affectedRows > 0;
    }

    /**
     * 更新登录信息
     */
    static async updateLoginInfo(id, ip) {
        const sql = `
            UPDATE users
            SET
                last_login_at = NOW(),
                last_login_ip = ?,
                login_count = login_count + 1
            WHERE id = ? AND is_deleted = 0
        `;

        const result = await db.query(sql, [ip, id]);
        return result.affectedRows > 0;
    }

    /**
     * 删除用户（软删除）
     */
    static async delete(id) {
        const sql = `
            UPDATE users
            SET is_deleted = 1, updated_at = NOW()
            WHERE id = ?
        `;

        const result = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * 获取用户统计信息
     */
    static async getStats(org_id = null) {
        let whereClause = 'is_deleted = 0';
        const params = [];

        if (org_id) {
            whereClause += ' AND org_id = ?';
            params.push(org_id);
        }

        const sql = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_count,
                SUM(CASE WHEN status = 'locked' THEN 1 ELSE 0 END) as locked_count,
                SUM(CASE WHEN DATE(last_login_at) = CURDATE() THEN 1 ELSE 0 END) as today_login_count
            FROM users
            WHERE ${whereClause}
        `;

        const rows = await db.query(sql, params);
        return rows[0];
    }
}

module.exports = { User, USER_STATUS, GENDER };
