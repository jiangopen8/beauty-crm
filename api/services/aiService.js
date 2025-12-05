/**
 * AI 服务模块
 * 封装 Kimi AI 大模型调用
 */

require('dotenv').config();
const https = require('https');

class AIService {
    constructor() {
        this.apiKey = process.env.KIMI_API_KEY;
        this.apiUrl = process.env.KIMI_API_URL;
        this.model = process.env.KIMI_MODEL || 'moonshot-v1-8k';

        if (!this.apiKey) {
            console.warn('⚠️ KIMI_API_KEY 未配置，AI 功能将不可用');
        }
    }

    /**
     * 调用 Kimi API
     * @param {Array} messages - 消息数组
     * @param {Object} options - 可选配置
     */
    async chat(messages, options = {}) {
        if (!this.apiKey) {
            throw new Error('KIMI_API_KEY 未配置');
        }

        const requestBody = JSON.stringify({
            model: this.model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 1000,
            ...options
        });

        return new Promise((resolve, reject) => {
            // 解析 API URL
            const url = new URL(this.apiUrl);

            const requestOptions = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };

            const req = https.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            reject(new Error(`Kimi API 错误: ${res.statusCode} - ${data}`));
                            return;
                        }

                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        reject(new Error(`解析响应失败: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                console.error('❌ Kimi API 调用失败:', error.message);
                reject(error);
            });

            req.write(requestBody);
            req.end();
        });
    }

    /**
     * 润色客户案例，生成营销文案
     * @param {Object} caseData - 案例数据
     * @returns {String} - 润色后的营销文案
     */
    async polishCase(caseData) {
        const {
            case_title,
            customer_name,
            case_type,
            initial_problems,
            treatment_plan,
            results,
            service_period,
            customer_feedback
        } = caseData;

        // 案例类型的中文名称映射
        const caseTypeMap = {
            'skin_care': '皮肤护理',
            'hair_care': '头发护理',
            'body_care': '身体护理',
            'other': '美业服务'
        };

        const caseTypeName = caseTypeMap[case_type] || '美业服务';

        // 构建提示词
        const systemPrompt = `你是一位专业的美业营销文案专家，擅长将客户案例转化为吸引人的营销文案。

你的任务是：
1. 基于提供的客户案例信息，生成一段优质的营销文案
2. 文案要突出效果、专业性和真实性
3. 使用吸引人的表达方式，但不夸大其词
4. 文案长度控制在200-300字
5. 适当使用emoji增加亲和力
6. 语气专业且温暖

文案结构建议：
- 开头：吸引眼球的标题或引言
- 中间：描述客户的初始问题、解决方案和显著效果
- 结尾：呼吁行动（咨询、预约等）`;

        const userPrompt = `请为以下${caseTypeName}案例生成营销文案：

案例标题：${case_title || '客户案例'}
${customer_name ? `客户姓名：${customer_name}` : ''}
${initial_problems ? `初始问题：${initial_problems}` : ''}
${treatment_plan ? `解决方案：${treatment_plan}` : ''}
${service_period ? `服务周期：${service_period}` : ''}
${results ? `效果说明：${results}` : ''}
${customer_feedback ? `客户评价：${customer_feedback}` : ''}

请生成一段专业、吸引人的营销文案。`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        try {
            const response = await this.chat(messages, {
                temperature: 0.8,
                max_tokens: 2000  // 增加token限制
            });

            // 调试：打印完整响应（可选，生产环境可删除）
            // console.log('🔍 Kimi API 响应:', JSON.stringify(response, null, 2));

            // 提取生成的文案 - Kimi K2 的内容可能在 reasoning_content 或 content 中
            const choice = response.choices?.[0];
            const generatedText = choice?.message?.content || choice?.message?.reasoning_content;

            if (!generatedText || generatedText.trim() === '') {
                console.error('❌ 响应结构异常，完整响应:', JSON.stringify(response, null, 2));
                throw new Error('AI 未返回有效内容');
            }

            return generatedText.trim();
        } catch (error) {
            console.error('❌ AI 润色失败:', error.message);
            throw error;
        }
    }

    /**
     * 生成案例标题建议
     * @param {Object} caseData - 案例数据片段
     * @returns {Array} - 标题建议列表
     */
    async suggestTitles(caseData) {
        const { case_type, initial_problems, results } = caseData;

        const systemPrompt = `你是美业营销专家，擅长撰写吸引人的案例标题。请生成3-5个标题建议，每个标题一行，不要编号。`;

        const userPrompt = `请为以下案例生成标题：
类型：${case_type}
问题：${initial_problems || '未提供'}
效果：${results || '未提供'}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        try {
            const response = await this.chat(messages, {
                temperature: 0.9,
                max_tokens: 200
            });

            const generatedText = response.choices?.[0]?.message?.content;
            if (!generatedText) {
                throw new Error('AI 未返回有效内容');
            }

            // 将文本分割成数组
            const titles = generatedText
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^\d+[\.\、]\s*/, '').trim())
                .filter(line => line.length > 0);

            return titles;
        } catch (error) {
            console.error('❌ AI 生成标题失败:', error.message);
            throw error;
        }
    }
}

// 导出单例
const aiService = new AIService();
module.exports = aiService;
