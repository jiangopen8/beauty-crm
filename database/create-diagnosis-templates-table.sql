-- 诊断模板表
CREATE TABLE IF NOT EXISTS diagnosis_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_code VARCHAR(50) UNIQUE NOT NULL COMMENT '模板编码',
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '模板描述',
    org_id INT COMMENT '组织ID（NULL表示全局模板）',
    scope ENUM('global', 'org') DEFAULT 'org' COMMENT '作用域：global-全局，org-组织',
    apply_scene VARCHAR(100) COMMENT '适用场景',
    fields JSON NOT NULL COMMENT '模板字段定义（JSON格式）',
    version VARCHAR(20) DEFAULT '1.0' COMMENT '模板版本',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_by INT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_org_id (org_id),
    INDEX idx_status (status),
    INDEX idx_apply_scene (apply_scene)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诊断模板表';

-- 插入默认诊断模板
INSERT INTO diagnosis_templates (
    template_code,
    template_name,
    description,
    scope,
    apply_scene,
    fields,
    version,
    sort_order
) VALUES (
    'DEFAULT_DIAGNOSIS',
    '标准美容诊断模板',
    '适用于常规美容诊断场景，包含皮肤状况、问题分析、诊断结论等核心字段',
    'global',
    'all',
    '[
        {
            "field_key": "diagnosis_date",
            "field_name": "诊断日期",
            "field_type": "date",
            "group": "基本信息",
            "required": true,
            "placeholder": "选择诊断日期"
        },
        {
            "field_key": "diagnosis_type",
            "field_name": "诊断类型",
            "field_type": "select",
            "group": "基本信息",
            "required": true,
            "options": ["初诊", "复诊", "定期检查", "问题诊断", "效果评估"],
            "placeholder": "请选择诊断类型"
        },
        {
            "field_key": "skin_type",
            "field_name": "皮肤类型",
            "field_type": "select",
            "group": "皮肤状况",
            "required": true,
            "options": ["干性皮肤", "油性皮肤", "混合性皮肤", "中性皮肤", "敏感性皮肤"],
            "placeholder": "请选择皮肤类型"
        },
        {
            "field_key": "skin_condition",
            "field_name": "皮肤状况",
            "field_type": "checkbox",
            "group": "皮肤状况",
            "required": false,
            "options": ["暗沉", "粗糙", "松弛", "毛孔粗大", "痘痘", "痘印", "色斑", "细纹", "皱纹", "红血丝", "过敏"],
            "placeholder": "选择当前皮肤问题"
        },
        {
            "field_key": "skin_moisture",
            "field_name": "皮肤水分",
            "field_type": "select",
            "group": "皮肤状况",
            "required": false,
            "options": ["严重缺水", "轻度缺水", "水分正常", "水分充足"],
            "placeholder": "评估皮肤水分状况"
        },
        {
            "field_key": "skin_oil",
            "field_name": "皮肤油分",
            "field_type": "select",
            "group": "皮肤状况",
            "required": false,
            "options": ["严重缺油", "轻度缺油", "油分正常", "油分过多"],
            "placeholder": "评估皮肤油分状况"
        },
        {
            "field_key": "main_problems",
            "field_name": "主要问题",
            "field_type": "textarea",
            "group": "问题分析",
            "required": true,
            "rows": 4,
            "placeholder": "详细描述客户的主要皮肤问题"
        },
        {
            "field_key": "problem_severity",
            "field_name": "问题严重程度",
            "field_type": "radio",
            "group": "问题分析",
            "required": true,
            "options": ["轻度", "中度", "重度"],
            "placeholder": "评估问题严重程度"
        },
        {
            "field_key": "problem_duration",
            "field_name": "问题持续时间",
            "field_type": "select",
            "group": "问题分析",
            "required": false,
            "options": ["1周内", "1-4周", "1-3个月", "3-6个月", "6个月-1年", "1年以上"],
            "placeholder": "问题出现多久了"
        },
        {
            "field_key": "previous_treatments",
            "field_name": "既往治疗",
            "field_type": "textarea",
            "group": "问题分析",
            "required": false,
            "rows": 3,
            "placeholder": "客户之前做过哪些治疗或使用过什么产品"
        },
        {
            "field_key": "diagnosis_conclusion",
            "field_name": "诊断结论",
            "field_type": "textarea",
            "group": "诊断结论",
            "required": true,
            "rows": 4,
            "placeholder": "综合分析后的诊断结论"
        },
        {
            "field_key": "treatment_direction",
            "field_name": "治疗方向",
            "field_type": "textarea",
            "group": "诊断结论",
            "required": true,
            "rows": 3,
            "placeholder": "建议的治疗方向和重点"
        },
        {
            "field_key": "expected_effect",
            "field_name": "预期效果",
            "field_type": "textarea",
            "group": "诊断结论",
            "required": false,
            "rows": 3,
            "placeholder": "预期可以达到的改善效果"
        },
        {
            "field_key": "precautions",
            "field_name": "注意事项",
            "field_type": "textarea",
            "group": "诊断结论",
            "required": false,
            "rows": 3,
            "placeholder": "客户需要注意的事项"
        },
        {
            "field_key": "next_visit",
            "field_name": "下次复诊时间",
            "field_type": "date",
            "group": "诊断结论",
            "required": false,
            "placeholder": "建议的下次复诊日期"
        },
        {
            "field_key": "diagnosis_images",
            "field_name": "诊断照片",
            "field_type": "text",
            "group": "附件",
            "required": false,
            "placeholder": "诊断照片URL（多个用逗号分隔）"
        },
        {
            "field_key": "remarks",
            "field_name": "备注",
            "field_type": "textarea",
            "group": "附件",
            "required": false,
            "rows": 3,
            "placeholder": "其他需要记录的信息"
        }
    ]',
    '1.0',
    1
);

-- 查看创建结果
SELECT * FROM diagnosis_templates;
