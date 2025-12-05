/**
 * 创建方案模板测试数据
 * 生成不同分类的美业护理方案模板
 */

const db = require('./db.config');

// 模拟方案模板数据
const testTemplates = [
    // 补水保湿方案
    {
        template_name: '深层补水保湿护理方案',
        template_code: 'TPL-HYD-001',
        category: 'hydration',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['干性', '缺水性', '混合性']),
        suitable_problems: JSON.stringify(['干燥紧绷', '缺水脱皮', '细纹']),
        target_group: '25-45岁女性',
        course_duration: '4周',
        treatment_frequency: '每周2次',
        expected_effects: '深层补水,改善肌肤干燥、紧绷现象,提升肌肤水润度和弹性,让肌肤恢复水嫩光泽',
        precautions: '护理期间多喝水,避免熬夜;敏感肌肤需提前告知美容师;护理后6小时内避免化妆',
        steps: JSON.stringify([
            { step_number: 1, description: '温和卸妆清洁,去除面部彩妆和污垢', duration: 5 },
            { step_number: 2, description: '深层清洁,打开毛孔,软化角质', duration: 10 },
            { step_number: 3, description: '补水精华导入,使用超声波仪器加速吸收', duration: 15 },
            { step_number: 4, description: '补水面膜敷用,深层滋养肌肤', duration: 20 },
            { step_number: 5, description: '补水精华按摩,促进循环和吸收', duration: 10 },
            { step_number: 6, description: '涂抹保湿乳液和面霜,锁住水分', duration: 5 }
        ]),
        products: JSON.stringify([
            { name: '温和卸妆油', quantity: '2-3泵', usage: '打圈按摩30秒后清水洗净' },
            { name: '氨基酸洁面乳', quantity: '硬币大小', usage: '打泡后轻柔按摩' },
            { name: '玻尿酸补水精华', quantity: '3-4滴', usage: '点涂后轻拍至吸收' },
            { name: '海藻补水面膜', quantity: '1片', usage: '敷15-20分钟' },
            { name: '神经酰胺保湿乳', quantity: '黄豆大小', usage: '均匀涂抹按摩' },
            { name: '锁水保湿霜', quantity: '适量', usage: '轻柔按压至吸收' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 15
    },
    {
        template_name: '基础补水护理方案',
        template_code: 'TPL-HYD-002',
        category: 'hydration',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['中性', '混合性']),
        suitable_problems: JSON.stringify(['轻度缺水', '肤色暗沉']),
        target_group: '18-30岁女性',
        course_duration: '2周',
        treatment_frequency: '每周1次',
        expected_effects: '补充肌肤水分,改善肌肤干燥,让肌肤水润饱满有光泽',
        precautions: '护理后注意防晒,多喝水促进新陈代谢',
        steps: JSON.stringify([
            { step_number: 1, description: '面部清洁,去除污垢和油脂', duration: 5 },
            { step_number: 2, description: '爽肤水补水,二次清洁并补水', duration: 3 },
            { step_number: 3, description: '补水精华涂抹,深层补水', duration: 10 },
            { step_number: 4, description: '补水面膜敷用', duration: 15 },
            { step_number: 5, description: '保湿乳液锁水', duration: 5 }
        ]),
        products: JSON.stringify([
            { name: '清爽洁面啫喱', quantity: '适量', usage: '打泡后按摩清洁' },
            { name: '保湿爽肤水', quantity: '适量', usage: '拍打至吸收' },
            { name: '透明质酸精华', quantity: '2-3滴', usage: '点涂按摩' },
            { name: '补水面膜', quantity: '1片', usage: '敷15分钟' },
            { name: '清爽保湿乳', quantity: '适量', usage: '均匀涂抹' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 8
    },

    // 美白亮肤方案
    {
        template_name: '美白淡斑焕肤方案',
        template_code: 'TPL-WHT-001',
        category: 'whitening',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['暗沉', '色斑']),
        suitable_problems: JSON.stringify(['色斑', '肤色不均', '暗沉发黄']),
        target_group: '28-50岁女性',
        course_duration: '8周',
        treatment_frequency: '每周2-3次',
        expected_effects: '淡化色斑、提亮肤色、改善肌肤暗沉,使肌肤恢复白皙透亮,肤色更加均匀',
        precautions: '护理期间严格防晒(SPF50+);避免食用光敏性食物;初期可能出现轻微脱皮属正常现象',
        steps: JSON.stringify([
            { step_number: 1, description: '温和清洁,去除面部污垢', duration: 5 },
            { step_number: 2, description: '果酸焕肤,促进角质代谢', duration: 10 },
            { step_number: 3, description: '美白精华导入,淡化色斑', duration: 20 },
            { step_number: 4, description: '美白面膜敷用,提亮肤色', duration: 20 },
            { step_number: 5, description: '维C精华按摩,抗氧化美白', duration: 10 },
            { step_number: 6, description: '防晒隔离,保护肌肤', duration: 5 }
        ]),
        products: JSON.stringify([
            { name: '温和氨基酸洁面', quantity: '适量', usage: '轻柔按摩清洁' },
            { name: '10%果酸焕肤精华', quantity: '薄涂', usage: '避开眼周,停留8-10分钟' },
            { name: '烟酰胺美白精华', quantity: '3-4滴', usage: '全脸涂抹按摩' },
            { name: '传明酸美白面膜', quantity: '1片', usage: '敷15-20分钟' },
            { name: '维C美白精华', quantity: '2-3滴', usage: '重点涂抹斑点部位' },
            { name: 'SPF50+防晒霜', quantity: '一元硬币大小', usage: '均匀涂抹全脸' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 23
    },
    {
        template_name: '亮肤焕采护理方案',
        template_code: 'TPL-WHT-002',
        category: 'whitening',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['暗沉', '不均匀']),
        suitable_problems: JSON.stringify(['肤色暗沉', '肤色不均']),
        target_group: '20-35岁女性',
        course_duration: '4周',
        treatment_frequency: '每周1-2次',
        expected_effects: '提亮肤色,改善暗沉,让肌肤焕发自然光采',
        precautions: '注意防晒,避免日晒',
        steps: JSON.stringify([
            { step_number: 1, description: '深层清洁毛孔', duration: 8 },
            { step_number: 2, description: '美白精华涂抹', duration: 10 },
            { step_number: 3, description: '亮肤面膜敷用', duration: 15 },
            { step_number: 4, description: '保湿锁水护理', duration: 7 }
        ]),
        products: JSON.stringify([
            { name: '深层清洁洁面乳', quantity: '适量', usage: '打圈按摩' },
            { name: '烟酰胺精华液', quantity: '3滴', usage: '全脸涂抹' },
            { name: '美白亮肤面膜', quantity: '1片', usage: '敷15分钟' },
            { name: '亮肤保湿霜', quantity: '适量', usage: '按摩至吸收' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 12
    },

    // 抗衰老方案
    {
        template_name: '紧致抗衰提拉方案',
        template_code: 'TPL-AGE-001',
        category: 'anti_aging',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['成熟肌', '松弛肌']),
        suitable_problems: JSON.stringify(['皱纹', '松弛下垂', '法令纹', '抬头纹']),
        target_group: '35-55岁女性',
        course_duration: '12周',
        treatment_frequency: '每周2次',
        expected_effects: '紧致提拉肌肤,淡化细纹和皱纹,改善面部松弛下垂,重塑面部轮廓,恢复年轻紧致状态',
        precautions: '配合家居护理效果更佳;保持充足睡眠;避免过度表情运动',
        steps: JSON.stringify([
            { step_number: 1, description: '抗衰洁面,温和清洁不伤肌肤', duration: 5 },
            { step_number: 2, description: '去角质护理,促进细胞更新', duration: 10 },
            { step_number: 3, description: '射频紧肤,刺激胶原蛋白再生', duration: 25 },
            { step_number: 4, description: '抗衰精华导入,深层抗老', duration: 15 },
            { step_number: 5, description: '提拉按摩手法,改善轮廓', duration: 20 },
            { step_number: 6, description: '抗老面膜,密集修护', duration: 20 },
            { step_number: 7, description: '眼部抗衰护理,淡化眼纹', duration: 10 },
            { step_number: 8, description: '紧致面霜锁住营养', duration: 5 }
        ]),
        products: JSON.stringify([
            { name: '抗衰氨基酸洁面', quantity: '适量', usage: '温和按摩清洁' },
            { name: '酵素去角质凝胶', quantity: '适量', usage: '打圈按摩2分钟' },
            { name: '六胜肽抗皱精华', quantity: '4-5滴', usage: '重点涂抹皱纹部位' },
            { name: '胶原蛋白面膜', quantity: '1片', usage: '敷20分钟' },
            { name: '视黄醇抗老精华', quantity: '2-3滴', usage: '全脸涂抹避开眼周' },
            { name: '眼部紧致精华', quantity: '绿豆大小', usage: '点涂眼周轻拍' },
            { name: '紧致提拉面霜', quantity: '适量', usage: '向上提拉按摩' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 31
    },
    {
        template_name: '青春焕颜抗初老方案',
        template_code: 'TPL-AGE-002',
        category: 'anti_aging',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['初老肌', '轻熟龄']),
        suitable_problems: JSON.stringify(['初期细纹', '轻微松弛']),
        target_group: '25-35岁女性',
        course_duration: '6周',
        treatment_frequency: '每周1次',
        expected_effects: '预防衰老,淡化初期细纹,提升肌肤弹性,保持年轻状态',
        precautions: '坚持使用效果更佳,注意防晒抗氧化',
        steps: JSON.stringify([
            { step_number: 1, description: '温和清洁肌肤', duration: 5 },
            { step_number: 2, description: '抗氧化精华涂抹', duration: 10 },
            { step_number: 3, description: '抗初老面膜敷用', duration: 15 },
            { step_number: 4, description: '提拉按摩手法', duration: 15 },
            { step_number: 5, description: '紧致乳霜护理', duration: 5 }
        ]),
        products: JSON.stringify([
            { name: '温和洁面乳', quantity: '适量', usage: '按摩清洁' },
            { name: '抗氧化精华液', quantity: '3-4滴', usage: '全脸涂抹' },
            { name: '抗初老面膜', quantity: '1片', usage: '敷15分钟' },
            { name: '紧致提拉乳霜', quantity: '适量', usage: '提拉按摩' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 18
    },

    // 修复护理方案
    {
        template_name: '敏感肌修复舒缓方案',
        template_code: 'TPL-REP-001',
        category: 'repair',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['敏感肌', '受损肌']),
        suitable_problems: JSON.stringify(['泛红', '敏感', '屏障受损', '刺痛']),
        target_group: '所有年龄段',
        course_duration: '6周',
        treatment_frequency: '每周1-2次',
        expected_effects: '修复肌肤屏障,舒缓敏感泛红,增强肌肤抵抗力,减少敏感反应,让肌肤恢复健康稳定状态',
        precautions: '避免使用刺激性产品;停用所有功效型产品;护理期间避免蒸桑拿、泡温泉;不要去角质',
        steps: JSON.stringify([
            { step_number: 1, description: '温和清水洁面,不使用洁面产品', duration: 3 },
            { step_number: 2, description: '舒缓喷雾镇静,缓解不适', duration: 5 },
            { step_number: 3, description: '修复精华导入,重建屏障', duration: 15 },
            { step_number: 4, description: '舒缓修复面膜,密集修护', duration: 15 },
            { step_number: 5, description: '舒缓按摩,促进修复', duration: 10 },
            { step_number: 6, description: '屏障修复乳霜,锁水保护', duration: 5 }
        ]),
        products: JSON.stringify([
            { name: '温泉舒缓喷雾', quantity: '适量', usage: '距离面部20cm喷洒' },
            { name: '积雪草修复精华', quantity: '3-4滴', usage: '轻柔按压至吸收' },
            { name: '神经酰胺修复面膜', quantity: '1片', usage: '敷15分钟' },
            { name: '角鲨烷修复油', quantity: '2-3滴', usage: '轻柔按摩' },
            { name: '屏障修复乳霜', quantity: '适量', usage: '厚敷锁水' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 27
    },
    {
        template_name: '痘后修复淡印方案',
        template_code: 'TPL-REP-002',
        category: 'repair',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['痘痘肌', '油性']),
        suitable_problems: JSON.stringify(['痘印', '痘坑', '色素沉着', '炎症后红印']),
        target_group: '18-40岁',
        course_duration: '8周',
        treatment_frequency: '每周2次',
        expected_effects: '淡化痘印痘疤,改善痘坑凹陷,促进肌肤修复再生,恢复平滑细腻肌肤',
        precautions: '避免用手挤压痘痘;注意防晒避免色沉加重;配合医美效果更佳',
        steps: JSON.stringify([
            { step_number: 1, description: '温和清洁,控油不过度', duration: 5 },
            { step_number: 2, description: '水杨酸精华,疏通毛孔', duration: 10 },
            { step_number: 3, description: '果酸焕肤,促进更新', duration: 10 },
            { step_number: 4, description: '修复精华导入,淡化痘印', duration: 15 },
            { step_number: 5, description: '修复面膜,镇静舒缓', duration: 15 },
            { step_number: 6, description: '保湿乳液,平衡水油', duration: 5 }
        ]),
        products: JSON.stringify([
            { name: '控油洁面乳', quantity: '适量', usage: '温和清洁' },
            { name: '2%水杨酸精华', quantity: '点涂', usage: '涂抹痘痘部位' },
            { name: '果酸焕肤精华', quantity: '薄涂', usage: '全脸涂抹' },
            { name: '积雪草修复精华', quantity: '3-4滴', usage: '重点涂抹痘印' },
            { name: '修复舒缓面膜', quantity: '1片', usage: '敷15分钟' },
            { name: '清爽保湿乳', quantity: '适量', usage: '均匀涂抹' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 19
    },

    // 头发护理方案
    {
        template_name: '头皮深层清洁护理方案',
        template_code: 'TPL-HAI-001',
        category: 'hair_care',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['油性头皮']),
        suitable_problems: JSON.stringify(['头屑', '头油', '毛孔堵塞', '头皮瘙痒']),
        target_group: '所有年龄段',
        course_duration: '4周',
        treatment_frequency: '每周1次',
        expected_effects: '深层清洁头皮毛孔,去除多余油脂和老废角质,改善头屑问题,让头皮清爽健康,头发蓬松有活力',
        precautions: '护理后24小时内不要洗头;避免抓挠头皮;饮食清淡少油腻',
        steps: JSON.stringify([
            { step_number: 1, description: '头皮检测,了解头皮状况', duration: 5 },
            { step_number: 2, description: '头皮按摩,放松舒缓', duration: 10 },
            { step_number: 3, description: '深层清洁洗发,去除油脂', duration: 10 },
            { step_number: 4, description: '头皮去角质,疏通毛孔', duration: 10 },
            { step_number: 5, description: '头皮精华导入,调理平衡', duration: 15 },
            { step_number: 6, description: '营养发膜护理,滋养发丝', duration: 15 },
            { step_number: 7, description: '吹干造型', duration: 10 }
        ]),
        products: JSON.stringify([
            { name: '控油清洁洗发水', quantity: '适量', usage: '打泡后按摩头皮' },
            { name: '头皮去角质膏', quantity: '适量', usage: '轻柔按摩头皮2-3分钟' },
            { name: '薄荷控油头皮精华', quantity: '适量', usage: '涂抹头皮按摩至吸收' },
            { name: '氨基酸修护发膜', quantity: '适量', usage: '涂抹发丝停留10分钟' },
            { name: '护发精油', quantity: '2-3滴', usage: '涂抹发尾' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 14
    },
    {
        template_name: '受损发质修复方案',
        template_code: 'TPL-HAI-002',
        category: 'hair_care',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['受损发质']),
        suitable_problems: JSON.stringify(['干枯', '分叉', '烫染受损', '毛躁']),
        target_group: '所有年龄段',
        course_duration: '8周',
        treatment_frequency: '每周1-2次',
        expected_effects: '深层修复受损发质,补充蛋白质和水分,改善干枯分叉,让头发恢复柔顺光泽有弹性',
        precautions: '减少烫染频率;避免高温吹风;使用专业护发产品',
        steps: JSON.stringify([
            { step_number: 1, description: '温和清洁,保护发质', duration: 8 },
            { step_number: 2, description: '蛋白质补充护理', duration: 15 },
            { step_number: 3, description: '深层修复发膜', duration: 20 },
            { step_number: 4, description: '精华油护理,锁住营养', duration: 10 },
            { step_number: 5, description: '低温吹干', duration: 10 }
        ]),
        products: JSON.stringify([
            { name: '修复洗发水', quantity: '适量', usage: '温和清洁' },
            { name: '蛋白质修复精华', quantity: '适量', usage: '涂抹全发' },
            { name: '深层修复发膜', quantity: '适量', usage: '停留15-20分钟' },
            { name: '摩洛哥护发精油', quantity: '3-4滴', usage: '涂抹发中发尾' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 21
    },

    // 其他方案
    {
        template_name: '男士基础护肤方案',
        template_code: 'TPL-OTH-001',
        category: 'other',
        org_id: 1,
        scope: 'org',
        suitable_skin_types: JSON.stringify(['男性肌肤', '油性']),
        suitable_problems: JSON.stringify(['毛孔粗大', '黑头', '出油', '粗糙']),
        target_group: '20-45岁男性',
        course_duration: '4周',
        treatment_frequency: '每周1次',
        expected_effects: '深层清洁毛孔,控油平衡,收缩毛孔,改善粗糙暗沉,让肌肤清爽健康',
        precautions: '避免熬夜;少吃油腻辛辣食物;坚持日常清洁护理',
        steps: JSON.stringify([
            { step_number: 1, description: '深层清洁,去除油脂污垢', duration: 10 },
            { step_number: 2, description: '黑头导出,清洁毛孔', duration: 15 },
            { step_number: 3, description: '收敛毛孔护理', duration: 10 },
            { step_number: 4, description: '控油补水面膜', duration: 15 },
            { step_number: 5, description: '清爽保湿护理', duration: 5 }
        ]),
        products: JSON.stringify([
            { name: '男士深层清洁洁面', quantity: '适量', usage: '打圈按摩清洁' },
            { name: '黑头导出液', quantity: '适量', usage: '涂抹T区' },
            { name: '毛孔收敛水', quantity: '适量', usage: '湿敷5分钟' },
            { name: '控油补水面膜', quantity: '1片', usage: '敷15分钟' },
            { name: '男士清爽乳液', quantity: '适量', usage: '轻拍至吸收' }
        ]),
        services: JSON.stringify([]),
        status: 'active',
        usage_count: 9
    }
];

async function createTestTemplates() {
    console.log('🚀 开始创建方案模板测试数据...\n');

    try {
        // 清空现有测试数据(可选)
        console.log('📌 检查现有数据...');
        const [existing] = await db.query(
            'SELECT COUNT(*) as count FROM solution_templates WHERE org_id = 1'
        );
        console.log(`   当前组织 1 有 ${existing.count} 个模板\n`);

        // 插入测试数据
        let successCount = 0;
        let failCount = 0;

        for (const template of testTemplates) {
            try {
                const sql = `
                    INSERT INTO solution_templates (
                        template_name, template_code, category, org_id, scope,
                        suitable_skin_types, suitable_problems, target_group,
                        course_duration, treatment_frequency, expected_effects,
                        precautions, steps, products, services,
                        status, usage_count, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;

                await db.query(sql, [
                    template.template_name,
                    template.template_code,
                    template.category,
                    template.org_id,
                    template.scope,
                    template.suitable_skin_types,
                    template.suitable_problems,
                    template.target_group,
                    template.course_duration,
                    template.treatment_frequency,
                    template.expected_effects,
                    template.precautions,
                    template.steps,
                    template.products,
                    template.services,
                    template.status,
                    template.usage_count
                ]);

                successCount++;
                console.log(`✅ [${template.category}] ${template.template_name}`);
            } catch (error) {
                failCount++;
                console.log(`❌ [${template.category}] ${template.template_name} - ${error.message}`);
            }
        }

        console.log('\n📊 创建完成统计:');
        console.log(`   ✅ 成功: ${successCount} 个`);
        console.log(`   ❌ 失败: ${failCount} 个`);
        console.log(`   📝 总计: ${testTemplates.length} 个\n`);

        // 按分类统计
        console.log('📈 按分类统计:');
        const categories = {
            'hydration': '补水保湿',
            'whitening': '美白亮肤',
            'anti_aging': '抗衰老',
            'repair': '修复护理',
            'hair_care': '头发护理',
            'other': '其他方案'
        };

        for (const [key, label] of Object.entries(categories)) {
            const [result] = await db.query(
                'SELECT COUNT(*) as count FROM solution_templates WHERE category = ? AND org_id = 1',
                [key]
            );
            console.log(`   ${label}: ${result.count} 个`);
        }

        console.log('\n✨ 测试数据创建完成!');
        console.log('🌐 访问 http://localhost:3000/templates.html 查看效果\n');

    } catch (error) {
        console.error('❌ 创建测试数据失败:', error);
        throw error;
    } finally {
        // 注意: db.config 导出的是连接池,不需要手动关闭
        console.log('✅ 数据库操作完成');
        process.exit(0);
    }
}

// 运行脚本
if (require.main === module) {
    createTestTemplates()
        .then(() => {
            console.log('✅ 脚本执行成功');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 脚本执行失败:', error);
            process.exit(1);
        });
}

module.exports = { testTemplates, createTestTemplates };
