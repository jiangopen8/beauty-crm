// 创建测试私有模板
const API_BASE = 'http://localhost:5004';

async function createPrivateTemplate() {
    const templateData = {
        template_code: 'TEST_PRIVATE_001',
        template_name: '私有测试模板',
        description: '用于测试私有模板功能的示例模板',
        org_id: 1,
        scope: 'private',
        apply_scene: 'all',
        fields: [
            {
                field_key: 'custom_field_1',
                field_name: '自定义字段1',
                field_type: 'text',
                required: false,
                default_value: '',
                placeholder: '请输入内容',
                display_order: 1,
                group: '基础信息'
            },
            {
                field_key: 'custom_field_2',
                field_name: '自定义字段2',
                field_type: 'textarea',
                required: false,
                default_value: '',
                placeholder: '请输入详细信息',
                display_order: 2,
                group: '详细信息'
            }
        ],
        field_groups: [
            { group_name: '基础信息', display_order: 1 },
            { group_name: '详细信息', display_order: 2 }
        ],
        status: 'active',
        version: '1.0'
    };

    try {
        const response = await fetch(`${API_BASE}/api/customer-profile-templates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(templateData)
        });

        const result = await response.json();
        console.log('创建结果:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('✅ 私有模板创建成功！模板ID:', result.data.id);

            // 验证模板是否可以查询到
            const verifyResponse = await fetch(`${API_BASE}/api/customer-profile-templates?org_id=1&scope=private`);
            const verifyResult = await verifyResponse.json();
            console.log('\n验证查询结果:', JSON.stringify(verifyResult, null, 2));
        } else {
            console.log('❌ 创建失败:', result.message);
        }
    } catch (error) {
        console.error('❌ 错误:', error.message);
    }
}

createPrivateTemplate();
