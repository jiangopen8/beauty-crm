/**
 * 创建测试加盟商数据
 * 用法: node scripts/create-test-franchisees.js
 */

require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5004';

// 测试加盟商数据
const testFranchisees = [
    {
        org_code: 'FC001',
        org_name: '上海静安旗舰店',
        franchisee_level: 'flagship',
        contact_person: '王美丽',
        contact_phone: '13800138001',
        contact_email: 'wang@example.com',
        province: '上海市',
        city: '上海市',
        district: '静安区',
        address: '南京西路1788号',
        contract_no: 'HT2024001',
        contract_start_date: '2024-01-01',
        contract_end_date: '2029-12-31',
        revenue_share_rate: 8.5,
        status: 'active',
        description: '上海旗舰店，位于核心商圈，业绩优秀'
    },
    {
        org_code: 'FC002',
        org_name: '北京朝阳标准店',
        franchisee_level: 'standard',
        contact_person: '李华强',
        contact_phone: '13800138002',
        contact_email: 'li@example.com',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        address: '建国路88号',
        contract_no: 'HT2024002',
        contract_start_date: '2024-02-01',
        contract_end_date: '2029-01-31',
        revenue_share_rate: 7.5,
        status: 'active',
        description: '北京朝阳区标准店，经营稳定'
    },
    {
        org_code: 'FC003',
        org_name: '深圳南山科技店',
        franchisee_level: 'standard',
        contact_person: '张小芳',
        contact_phone: '13800138003',
        contact_email: 'zhang@example.com',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        address: '科技园南路168号',
        contract_no: 'HT2024003',
        contract_start_date: '2024-03-01',
        contract_end_date: '2029-02-28',
        revenue_share_rate: 8.0,
        status: 'active',
        description: '深圳科技园店，年轻客户群体'
    },
    {
        org_code: 'FC004',
        org_name: '杭州西湖社区店',
        franchisee_level: 'community',
        contact_person: '陈美玲',
        contact_phone: '13800138004',
        contact_email: 'chen@example.com',
        province: '浙江省',
        city: '杭州市',
        district: '西湖区',
        address: '文一西路299号',
        contract_no: 'HT2024004',
        contract_start_date: '2024-04-01',
        contract_end_date: '2027-03-31',
        revenue_share_rate: 6.5,
        status: 'active',
        description: '杭州社区店，服务周边居民'
    },
    {
        org_code: 'FC005',
        org_name: '广州天河旗舰店',
        franchisee_level: 'flagship',
        contact_person: '刘建国',
        contact_phone: '13800138005',
        contact_email: 'liu@example.com',
        province: '广东省',
        city: '广州市',
        district: '天河区',
        address: '天河路108号',
        contract_no: 'HT2024005',
        contract_start_date: '2024-05-01',
        contract_end_date: '2029-04-30',
        revenue_share_rate: 9.0,
        status: 'active',
        description: '广州天河旗舰店，高端客户定位'
    },
    {
        org_code: 'FC006',
        org_name: '成都武侯标准店',
        franchisee_level: 'standard',
        contact_person: '赵敏',
        contact_phone: '13800138006',
        contact_email: 'zhao@example.com',
        province: '四川省',
        city: '成都市',
        district: '武侯区',
        address: '人民南路四段123号',
        contract_no: 'HT2024006',
        contract_start_date: '2024-06-01',
        contract_end_date: '2027-05-31',
        revenue_share_rate: 7.0,
        status: 'suspended',
        description: '成都武侯店，因装修暂停营业'
    }
];

async function createTestData() {
    console.log('====================================');
    console.log('  创建测试加盟商数据');
    console.log('====================================\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < testFranchisees.length; i++) {
        const franchisee = testFranchisees[i];
        console.log(`[${i + 1}/${testFranchisees.length}] 创建: ${franchisee.org_name}...`);

        try {
            const response = await fetch(`${API_BASE_URL}/api/franchisees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(franchisee)
            });

            const result = await response.json();

            if (result.success) {
                console.log(`   ✅ 成功 - ID: ${result.data.id}`);
                successCount++;
            } else {
                console.log(`   ❌ 失败 - ${result.error.message}`);
                failCount++;
            }
        } catch (error) {
            console.log(`   ❌ 错误 - ${error.message}`);
            failCount++;
        }
    }

    console.log('\n====================================');
    console.log('  创建完成统计');
    console.log('====================================');
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`❌ 失败: ${failCount} 个`);
    console.log(`📊 总计: ${testFranchisees.length} 个`);
    console.log('====================================\n');

    // 验证数据
    console.log('📋 验证数据库中的加盟商...\n');
    try {
        const response = await fetch(`${API_BASE_URL}/api/franchisees/stats`);
        const result = await response.json();

        if (result.success) {
            console.log(`📊 数据库统计:`);
            console.log(`   总数: ${result.data.total}`);
            console.log(`   运营中: ${result.data.active_count}`);
            console.log(`   已暂停: ${result.data.suspended_count}`);
        }
    } catch (error) {
        console.log(`❌ 获取统计失败: ${error.message}`);
    }

    console.log('\n✅ 测试数据创建完成！');
    console.log('🌐 访问前端页面查看: http://localhost:8080/franchisees.html\n');
}

// 执行创建
createTestData().catch(error => {
    console.error('❌ 创建失败:', error);
    process.exit(1);
});
