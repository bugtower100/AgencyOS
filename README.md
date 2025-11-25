# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # Agency OS · GM 信息追踪工具

    > 面向三角机构桌游主持人（GM）的离线优先控制台。复刻 Agency OS 的冷峻企业风，实现战役、特工、任务、异常体与混沌池的全流程追踪。

    - 产品/技术架构：`docs/product-architecture.md`
    - 规则原文参考：仓库根目录 `规则文本/`

    ## ✨ 核心能力（MVP）

    1. **战役仪表板**：展示分部状态、下一次任务、混沌与异常体统计。
    2. **人力资源档案**：ARC 三件套、资质 QA、嘉奖/申诫、关系网络与快照。
    3. **任务控制台**：单页实时面板，集中日志、混沌池、散逸端、可选目标及励志提示弹窗。
    4. **异常体 / 散逸端库**：按焦点、领域、状态搜索，追踪相关任务与混沌效应。
    5. **结算向导**：引导式任务报告、MVP 与机构评级自动计算、战役快照与导出。

    扩展路线：申领物商店、请求机构特效、高墙文件解锁、云同步与插件化报表。

    ## 🧱 技术栈

    - **构建**：Vite 7 + React 18 + TypeScript
    - **状态**：Zustand（实体 store）+ TanStack Query（异步）
    - **表单/校验**：React Hook Form + Zod
    - **样式**：Tailwind CSS + Radix UI，自定义暗色/紧急模式主题
    - **数据层**：Dexie.js（IndexedDB 持久化）+ JSON 导入导出
    - **图表/表格**：Recharts、TanStack Table

    > ⚠️ Vite 7 需要 Node.js ≥ 20.19（或 22.12+）。当前环境为 20.16.0，会在启动 dev server 时产生警告甚至失败，请升级 Node 版本。

    ## 📁 目录约定

    ```
    src/
      app/            # 入口、路由、布局、主题 providers
      modules/
        campaigns/
        agents/
        missions/
        anomalies/
        reports/
      components/ui/  # 设计系统组件
      stores/         # Zustand slices（campaignSlice 等）
      services/db/    # Dexie schema、导入导出、快照
      lib/            # 工具与规则映射
    ```

    ## 🚀 开发指引

    1. 确认 Node.js 版本 ≥ 20.19。
    2. 安装依赖：

    ```powershell
    npm install
    ```

    3. 启动开发服务器：

    ```powershell
    npm run dev
    ```

    4. 运行计划中的单元测试（Vitest + Testing Library）：

    ```powershell
    npm run test
    ```

    5. 构建生产包：

    ```powershell
    npm run build
    ```

    ## 🧪 质量与安全守则

    - 核心操作（混沌增减、嘉奖/申诫、任务结算）需覆盖单元测试。
    - Dexie 快照在任务结算后自动触发，并提供手动备份按钮。
    - 敏感内容标签仅 GM 可见，导出时可选择脱敏字段。

    ## 📜 参考资料

    - `文档1.txt`：规则映射与实体字段详解。
    - `文档2.txt`：UI 氛围、特色功能、结算规则建议。
    - `docs/product-architecture.md`：需求整合、数据模型、模块划分、技术路线。
