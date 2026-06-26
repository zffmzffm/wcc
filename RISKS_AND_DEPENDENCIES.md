# Risks and Dependencies / 风险与依赖

Date: 2026-06-26
日期：2026-06-26

## Dependency Inventory / 依赖清单

Runtime dependencies:
运行时依赖：

- `next`: package metadata requires 16.0.10.
  `next`：package 元数据要求 16.0.10。
- `react`: 19.2.0.
  `react`：19.2.0。
- `react-dom`: 19.2.0.
  `react-dom`：19.2.0。
- `leaflet`: ^1.9.4.
  `leaflet`：^1.9.4。
- `react-leaflet`: ^5.0.0.
  `react-leaflet`：^5.0.0。

Build/test dependencies include TypeScript, ESLint 9, eslint-config-next 16.0.7, Tailwind CSS 4, Vitest 4, jsdom, and React Testing Library.

构建/测试依赖包括 TypeScript、ESLint 9、eslint-config-next 16.0.7、Tailwind CSS 4、Vitest 4、jsdom 和 React Testing Library。

External runtime services/assets:
外部运行时服务/资源：

- CARTO/OpenStreetMap map tiles via `https://{s}.basemaps.cartocdn.com/...`.
  通过 `https://{s}.basemaps.cartocdn.com/...` 加载 CARTO/OpenStreetMap 地图瓦片。
- Flag images from `https://flagcdn.com`.
  从 `https://flagcdn.com` 加载旗帜图片。
- Outbound Video Guide link to YouTube.
  指向 YouTube 的外部 Video Guide 链接。
- Outbound support link to Ko-fi.
  指向 Ko-fi 的外部支持链接。
- Outbound creator link to `duoyj.ca`.
  指向 `duoyj.ca` 的外部创作者链接。

Static hosting assumptions:
静态托管假设：

- Next.js `output: 'export'`.
  Next.js 使用 `output: 'export'`。
- Cloudflare Pages-style security headers in `public/_headers`.
  `public/_headers` 中包含 Cloudflare Pages 风格的安全响应头。
- No server-side API, database, auth, or background job runtime.
  没有服务端 API、数据库、认证或后台任务运行时。

## Current Dependency Findings / 当前依赖发现

- `package.json` and `package-lock.json` agree that Next should be 16.0.10.
  `package.json` 和 `package-lock.json` 都认为 Next 应为 16.0.10。
- The current local `node_modules` install contains Next 16.0.7, so `npm.cmd ls next --depth=0` reports `ELSPROBLEMS`.
  当前本地 `node_modules` 中是 Next 16.0.7，因此 `npm.cmd ls next --depth=0` 报告 `ELSPROBLEMS`。
- `npm.cmd run build` used Next 16.0.7 from local `node_modules` and still completed successfully.
  `npm.cmd run build` 使用本地 `node_modules` 中的 Next 16.0.7，但仍然成功完成。
- Build emitted repeated `baseline-browser-mapping` freshness warnings.
  构建重复输出 `baseline-browser-mapping` 新鲜度 warning。

Recommendation: before release verification, refresh the local install with `npm ci` or `npm.cmd install`, then rerun lint, data checks, tests, and build.

建议：发布验证前，先用 `npm ci` 或 `npm.cmd install` 刷新本地安装，然后重新运行 lint、数据检查、测试和构建。

## Data Risks / 数据风险

- Official schedule, teams, kickoff times, venue metadata, and knockout assignments can change or require correction.
  官方赛程、球队、开球时间、场馆元数据和淘汰赛签位可能变化或需要修正。
- `matches.json` covers group-stage fixtures; `knockoutVenues.json` is required for full 104-match coverage.
  `matches.json` 覆盖小组赛；完整 104 场覆盖还需要 `knockoutVenues.json`。
- `knockoutVenues.json` placeholder strings are logic inputs, not just labels.
  `knockoutVenues.json` 中的占位符字符串是逻辑输入，不只是标签。
- Third-place Round of 32 slots cannot be inferred safely from a list of eight teams; the app expects explicit official slot assignments.
  Round of 32 的第三名席位不能安全地只从八支球队列表推断；应用需要明确的官方签位分配。
- Score updates are manual JSON changes through script workflows; incorrect score side ordering would be user-visible.
  比分更新是通过脚本工作流进行的手动 JSON 变更；比分左右顺序错误会直接暴露给用户。
- `pathDistances.json` should remain generated/source-of-truth for distance reports to avoid doc/data drift.
  `pathDistances.json` 应继续作为距离报告的生成来源/事实来源，避免文档和数据漂移。

## Privacy and Legal Risks / 隐私与法律风险

- The app now discloses that it has no accounts or first-party forms, but third-party asset providers can receive standard request metadata.
  应用现在披露了没有账号或第一方表单，但第三方资源提供方仍可能收到标准请求元数据。
- Map tiles and flag images are external runtime dependencies; privacy expectations should not imply a fully self-contained offline app.
  地图瓦片和旗帜图片是外部运行时依赖；隐私表述不应暗示应用完全离线自包含。
- FIFA and World Cup trademarks require ongoing care. The footer disclaimer helps, but marketing copy should keep the project clearly unofficial.
  FIFA 和 World Cup 相关商标需要持续谨慎处理。页脚免责声明有帮助，但营销文案也应明确保持非官方定位。
- The source is private and not licensed for redistribution; README now separates public hosted access from source reuse rights.
  源码是私有的，未授权再分发；README 现在区分了公共托管访问和源码复用权利。

## Security Risks / 安全风险

- Static export reduces server attack surface.
  静态导出降低服务端攻击面。
- `public/_headers` sets frame, content-type, referrer, permissions, and CSP headers.
  `public/_headers` 设置了 frame、content-type、referrer、permissions 和 CSP 响应头。
- CSP currently allows `'unsafe-inline'` and `'unsafe-eval'` for scripts/styles, likely because of the framework/build/runtime needs. This is acceptable for a static personal project but not a hardened enterprise baseline.
  当前 CSP 对脚本/样式允许 `'unsafe-inline'` 和 `'unsafe-eval'`，可能是框架/构建/运行时需要。对静态个人项目可以接受，但不是企业级加固基线。
- No dependency audit output was collected in this pass.
  本次没有收集 dependency audit 输出。

## Mobile and Browser Risks / 移动端与浏览器风险

- Mobile CSS uses fixed viewport regions, fixed footer, `100dvh`, and `:has()` selectors; these should be manually tested on iOS Safari and Android Chrome.
  移动端 CSS 使用固定视口区域、固定页脚、`100dvh` 和 `:has()` 选择器；应在 iOS Safari 和 Android Chrome 上手动测试。
- iOS fullscreen uses CSS fallback because the native Fullscreen API is not available there.
  iOS 因不支持原生 Fullscreen API，使用 CSS fallback。
- Map tile loading depends on network quality and tile service availability.
  地图瓦片加载依赖网络质量和瓦片服务可用性。
- Header controls are compact on small screens; high text scaling could still cause crowding.
  页头控件在小屏上很紧凑；高文字缩放仍可能导致拥挤。

## Operational Risks / 运维风险

- No monitoring or user-visible status page was found.
  未发现监控或用户可见状态页。
- No automated scheduled data refresh exists in the repo.
  仓库中没有自动定时数据刷新。
- No automatic route/sitemap consistency test exists.
  没有自动路由/sitemap 一致性测试。
- No visual regression or Playwright mobile coverage exists.
  没有视觉回归或 Playwright 移动端覆盖。
- No current README evidence shows production deployment settings or rollback steps.
  当前 README 没有展示生产部署设置或回滚步骤的证据。

## Risk Register / 风险登记表

| Risk / 风险 | Severity / 严重性 | Likelihood / 可能性 | Mitigation / 缓解措施 |
| --- | --- | --- | --- |
| Tournament data stale or wrong / 赛事数据过期或错误 | High / 高 | Medium / 中 | Script-first updates, official-source checks, data validation before deploy / 优先用脚本更新，核对官方来源，部署前做数据验证 |
| Local dependency install drift / 本地依赖安装漂移 | Medium / 中 | High in current checkout / 当前 checkout 中较高 | Run `npm ci` or `npm.cmd install`; rerun full checks / 运行 `npm ci` 或 `npm.cmd install`，再重新跑完整检查 |
| External map/flag providers unavailable / 外部地图或旗帜提供方不可用 | Medium / 中 | Medium / 中 | Disclose dependency; consider fallback labels for flags; keep map error boundary / 披露依赖，考虑旗帜 fallback 标签，保留地图错误边界 |
| Mobile layout crowding / 移动端布局拥挤 | Medium / 中 | Medium / 中 | Manual device QA and screenshots before portfolio sharing / 作品集分享前做手动设备 QA 和截图 |
| Trademark/affiliation confusion / 商标或官方关联混淆 | Medium / 中 | Low / 低 | Keep unofficial disclaimer visible; avoid official wording / 保持非官方免责声明可见，避免官方化措辞 |
| No production monitoring / 没有生产监控 | Medium / 中 | Medium / 中 | Add lightweight uptime/error monitoring if traffic grows / 流量增长后添加轻量 uptime/错误监控 |
| Sitemap drift / Sitemap 漂移 | Low / 低 | Medium / 中 | Add static route/sitemap consistency test / 添加静态路由/sitemap 一致性测试 |
| CSP is not fully strict / CSP 不够严格 | Low / 低 | Medium / 中 | Tighten only after verifying framework/runtime compatibility / 先验证框架/运行时兼容性，再收紧 CSP |