/**
 * 模块加载器
 * 负责按需加载各个功能模块
 *
 * 使用方法：
 * const loader = new ModuleLoader();
 * await loader.loadModule('customer-profile', container, { customerId: 1 });
 */
class ModuleLoader {
    constructor() {
        this.modules = new Map();  // 已加载的模块缓存
        this.loading = new Map();  // 正在加载的模块
    }

    /**
     * 加载模块
     * @param {string} moduleName - 模块名称（如 'customer-profile'）
     * @param {HTMLElement} container - 容器元素
     * @param {object} options - 初始化选项
     * @returns {Promise<Module>}
     */
    async loadModule(moduleName, container, options = {}) {
        // 如果已加载，直接返回
        if (this.modules.has(moduleName)) {
            const module = this.modules.get(moduleName);
            module.mount(container);
            return module;
        }

        // 如果正在加载，等待加载完成
        if (this.loading.has(moduleName)) {
            return await this.loading.get(moduleName);
        }

        // 开始加载
        const loadPromise = this._loadModuleScript(moduleName, container, options);
        this.loading.set(moduleName, loadPromise);

        try {
            const module = await loadPromise;
            this.modules.set(moduleName, module);
            this.loading.delete(moduleName);
            return module;
        } catch (error) {
            this.loading.delete(moduleName);
            throw error;
        }
    }

    /**
     * 加载模块脚本
     */
    async _loadModuleScript(moduleName, container, options) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/modules/${moduleName}.js`;

            script.onload = () => {
                // 获取模块类（约定：每个模块导出一个类）
                const ModuleClass = window[this._getModuleClassName(moduleName)];

                if (!ModuleClass) {
                    reject(new Error(`模块 ${moduleName} 未找到导出类`));
                    return;
                }

                // 实例化模块
                const moduleInstance = new ModuleClass(options);
                moduleInstance.mount(container);
                resolve(moduleInstance);
            };

            script.onerror = () => {
                reject(new Error(`加载模块 ${moduleName} 失败`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * 获取模块类名（约定命名）
     * customer-profile → CustomerProfileModule
     */
    _getModuleClassName(moduleName) {
        return moduleName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'Module';
    }

    /**
     * 卸载模块
     */
    unloadModule(moduleName) {
        if (this.modules.has(moduleName)) {
            const module = this.modules.get(moduleName);
            module.unmount();
            this.modules.delete(moduleName);
        }
    }

    /**
     * 清空所有模块
     */
    clearAll() {
        this.modules.forEach(module => module.unmount());
        this.modules.clear();
    }
}

// 导出单例
window.moduleLoader = new ModuleLoader();
