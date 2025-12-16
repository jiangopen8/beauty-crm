/**
 * 客户诊断组模型
 * 文件：api/models/CustomerDiagnosisGroup.js
 *
 * 继承自 BaseModel，使用统一的数据库访问层
 */

const BaseModel = require('../core/BaseModel');
const db = require('../core/DatabaseService');

class CustomerDiagnosisGroup extends BaseModel {
  /**
   * 获取表名
   */
  static getTableName() {
    return 'customer_diagnosis_groups';
  }

  /**
   * 获取主键
   */
  static getPrimaryKey() {
    return 'id';
  }

  /**
   * 获取要查询的字段
   */
  static getFields() {
    return `
      id, customer_id, org_id, group_id, diagnosis_template_id,
      group_name, group_description,
      created_at, created_by, is_deleted
    `;
  }

  /**
   * 批量创建诊断组
   * 参考 CustomerSolution 的 createBatch 实现
   * 支持空模板数组（创建空诊断组）
   */
  static async createBatch(data) {
    const {
      customer_id,
      org_id,
      diagnosis_template_ids,
      group_name,
      group_description,
      created_by
    } = data;

    // 生成统一的组ID
    const group_id = `${customer_id}_${Date.now()}`;

    // 如果模板数组为空或未提供，创建空诊断组
    if (!diagnosis_template_ids || diagnosis_template_ids.length === 0) {
      return await this.createEmptyGroup({
        customer_id,
        org_id,
        group_id,
        group_name,
        group_description,
        created_by
      });
    }

    // 构建批量插入values
    const values = diagnosis_template_ids.map(templateId => [
      customer_id,
      org_id,
      group_id,
      templateId,
      group_name || null,
      group_description || null,
      created_by || null
    ]);

    // 批量插入SQL
    const sql = `
      INSERT INTO ${this.getTableName()} (
        customer_id, org_id, group_id, diagnosis_template_id,
        group_name, group_description, created_by
      ) VALUES ${values.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
    `;

    const result = await db.raw(sql, values.flat());

    return {
      group_id,
      result
    };
  }

  /**
   * 创建空诊断组
   * 插入一条特殊记录标记空组（diagnosis_template_id为NULL）
   */
  static async createEmptyGroup(data) {
    const {
      customer_id,
      org_id,
      group_id,
      group_name,
      group_description,
      created_by
    } = data;

    const sql = `
      INSERT INTO ${this.getTableName()} (
        customer_id, org_id, group_id, diagnosis_template_id,
        group_name, group_description, created_by
      ) VALUES (?, ?, ?, NULL, ?, ?, ?)
    `;

    const result = await db.raw(sql, [
      customer_id,
      org_id,
      group_id,
      group_name || null,
      group_description || null,
      created_by || null
    ]);

    return {
      group_id,
      result
    };
  }

  /**
   * 向诊断组添加模板
   * 用于向已有诊断组追加新的诊断模板
   */
  static async addTemplatesToGroup(groupId, templateIds, createdBy = null) {
    // 验证诊断组是否存在
    const exists = await this.existsByGroupId(groupId);
    if (!exists) {
      throw new Error('诊断组不存在');
    }

    // 获取诊断组的基本信息
    const groupInfo = await this.findByGroupId(groupId);
    if (!groupInfo || groupInfo.length === 0) {
      throw new Error('无法获取诊断组信息');
    }

    const { customer_id, org_id, group_name, group_description } = groupInfo[0];

    // 删除空组标记（如果存在）
    await db.raw(`
      DELETE FROM ${this.getTableName()}
      WHERE group_id = ? AND diagnosis_template_id IS NULL
    `, [groupId]);

    // 构建批量插入values
    const values = templateIds.map(templateId => [
      customer_id,
      org_id,
      groupId,
      templateId,
      group_name || null,
      group_description || null,
      createdBy || null
    ]);

    // 批量插入SQL
    const sql = `
      INSERT INTO ${this.getTableName()} (
        customer_id, org_id, group_id, diagnosis_template_id,
        group_name, group_description, created_by
      ) VALUES ${values.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
    `;

    const result = await db.raw(sql, values.flat());

    return {
      group_id: groupId,
      added_count: templateIds.length,
      result
    };
  }

  /**
   * 按组ID查询诊断组及其模板信息
   */
  static async findByGroupId(groupId) {
    const sql = `
      SELECT
        cdg.id,
        cdg.customer_id,
        cdg.org_id,
        cdg.group_id,
        cdg.group_name,
        cdg.group_description,
        cdg.diagnosis_template_id as template_id,
        dt.template_name,
        dt.template_code,
        dt.description,
        dt.fields,
        cdg.created_at,
        cdg.created_by
      FROM ${this.getTableName()} cdg
      LEFT JOIN diagnosis_templates dt ON cdg.diagnosis_template_id = dt.id
      WHERE cdg.group_id = ? AND cdg.is_deleted = 0
      ORDER BY cdg.created_at ASC
    `;

    return await db.findMany(sql, [groupId]);
  }

  /**
   * 按客户ID查询所有诊断组（分组返回）
   */
  static async findByCustomerId(customerId) {
    const sql = `
      SELECT
        cdg.id,
        cdg.customer_id,
        cdg.org_id,
        cdg.group_id,
        cdg.group_name,
        cdg.group_description,
        cdg.diagnosis_template_id as template_id,
        dt.template_name,
        dt.template_code,
        dt.description,
        dt.fields,
        cdg.created_at,
        cdg.created_by
      FROM ${this.getTableName()} cdg
      LEFT JOIN diagnosis_templates dt ON cdg.diagnosis_template_id = dt.id
      WHERE cdg.customer_id = ? AND cdg.is_deleted = 0
      ORDER BY cdg.group_id DESC, cdg.created_at ASC
    `;

    const items = await db.findMany(sql, [customerId]);

    // 按 group_id 分组
    const groups = {};
    items.forEach(item => {
      const gid = item.group_id;
      if (!groups[gid]) {
        groups[gid] = {
          group_id: gid,
          customer_id: item.customer_id,
          org_id: item.org_id,
          group_name: item.group_name,
          group_description: item.group_description,
          created_at: item.created_at,
          created_by: item.created_by,
          templates: []
        };
      }
      // 只添加非空模板（过滤掉空组标记）
      if (item.template_id) {
        groups[gid].templates.push({
          template_id: item.template_id,
          template_name: item.template_name,
          template_code: item.template_code,
          description: item.description,
          fields: typeof item.fields === 'string' ? JSON.parse(item.fields) : item.fields
        });
      }
    });

    return Object.values(groups);
  }

  /**
   * 删除整个诊断组（软删除）
   */
  static async deleteGroup(groupId) {
    const sql = `
      UPDATE ${this.getTableName()}
      SET is_deleted = 1
      WHERE group_id = ? AND is_deleted = 0
    `;

    return await db.update(sql, [groupId]);
  }

  /**
   * 按组ID检查诊断组是否存在
   */
  static async existsByGroupId(groupId) {
    const sql = `
      SELECT COUNT(*) as count
      FROM ${this.getTableName()}
      WHERE group_id = ? AND is_deleted = 0
    `;

    const result = await db.findOne(sql, [groupId]);
    return result ? result.count > 0 : false;
  }

  /**
   * 统计诊断组内的模板数
   */
  static async countTemplatesByGroupId(groupId) {
    const sql = `
      SELECT COUNT(*) as count
      FROM ${this.getTableName()}
      WHERE group_id = ? AND is_deleted = 0
    `;

    const result = await db.findOne(sql, [groupId]);
    return result ? result.count : 0;
  }
}

module.exports = CustomerDiagnosisGroup;
