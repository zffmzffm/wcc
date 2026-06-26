# Maintenance Audit / 维护审计

Date: 2026-06-26
日期：2026-06-26

Scope: portfolio-grade review of Cup26Map as a public static web app.
范围：以作品集级别的公共静态 Web 应用标准审查 Cup26Map。

## Executive Summary / 执行摘要

Cup26Map is in good shape for a public portfolio project: it has a clear product surface, static hosting, typed React/Next code, JSON-backed data, focused update scripts, and a meaningful Vitest suite. The main reliability risk is not the app architecture; it is ongoing tournament data maintenance and dependency freshness.

Cup26Map 作为公开作品集项目状态较好：产品界面清晰，采用静态托管，有类型化的 React/Next 代码、JSON 数据支撑、聚焦的更新脚本，以及有实际意义的 Vitest 测试套件。主要可靠性风险不在应用架构，而在持续维护赛事数据和保持依赖新鲜度。

This review applied only small fixes: README maintenance notes, a Privacy & Legal footer note, lint cleanup, and a static header logo migration to `next/image`. No architecture rewrite or major feature was added.

本次审查只做了小修复：README 维护说明、页脚 Privacy & Legal 说明、lint 清理，以及把静态页头 logo 迁移到 `next/image`。没有重写架构，也没有新增大功能。

## Current App Shape / 当前应用形态

- Framework: Next.js App Router with `output: 'export'` for static hosting.
  框架：Next.js App Router，并使用 `output: 'export'` 做静态托管。
- UI: React 19, Leaflet, React Leaflet, modular CSS, responsive map/sidebar layout.
  UI：React 19、Leaflet、React Leaflet、模块化 CSS，以及响应式地图/侧栏布局。
- Data: static JSON and TypeScript modules under `src/data/`.
  数据：`src/data/` 下的静态 JSON 和 TypeScript 模块。
- Routes: `/`, `/city/[slug]`, `/team/[slug]`, all statically generated.
  路由：`/`、`/city/[slug]`、`/team/[slug]`，全部静态生成。
- Update scripts: score updates, knockout result updates, distance/doc generation helpers.
  更新脚本：比分更新、淘汰赛结果更新、距离/文档生成辅助脚本。
- Test stack: Vitest, React Testing Library, jsdom.
  测试栈：Vitest、React Testing Library、jsdom。

## Reliability Strengths / 可靠性优势

- Static export removes backend runtime, database, auth, and server scaling failure modes.
  静态导出消除了后端运行时、数据库、认证和服务端扩容相关的故障模式。
- `MapErrorBoundary` contains map-render failures instead of taking down the whole page.
  `MapErrorBoundary` 可以隔离地图渲染失败，避免整页崩溃。
- URL state is shareable and tested, including back/forward behavior.
  URL 状态可分享且有测试覆盖，包括浏览器前进/后退行为。
- Score rendering is centralized in `src/utils/score.ts` and covered by tests.
  比分渲染集中在 `src/utils/score.ts`，并已有测试覆盖。
- Knockout update and score update CLIs have validation tests.
  淘汰赛更新和比分更新 CLI 都有验证测试。
- Build currently prerenders all expected static route families.
  当前构建可以预渲染所有预期的静态路由族。
- Lint now exits with no warnings after small cleanup.
  小清理之后，lint 当前无 warning 退出。

## Reliability Risks / 可靠性风险

- Tournament data becomes stale unless manually refreshed and validated.
  赛事数据如果不手动刷新并验证，就会逐渐过期。
- `src/data/knockoutVenues.json` is both display data and logic input; casual copy edits can break path generation.
  `src/data/knockoutVenues.json` 既是展示数据也是逻辑输入，随意改文案可能破坏路径生成。
- `src/data/pathDistances.json` and `docs/championship_paths_table.md` can drift if generated independently.
  如果独立生成，`src/data/pathDistances.json` 和 `docs/championship_paths_table.md` 可能发生漂移。
- No current automated check confirms sitemap entries match every generated team/city route.
  目前没有自动检查能确认 sitemap 条目覆盖所有生成的球队/城市路由。
- The local install is inconsistent: package metadata and lockfile require Next 16.0.10, but local `node_modules` currently contains Next 16.0.7.
  本地安装不一致：package 元数据和 lockfile 要求 Next 16.0.10，但当前本地 `node_modules` 是 Next 16.0.7。
- Build warns that `baseline-browser-mapping` data is over two months old.
  构建提示 `baseline-browser-mapping` 数据已经超过两个月未更新。
- No production uptime, error-monitoring, or analytics evidence was found.
  未发现生产可用性、错误监控或分析数据方面的证据。

## Data Dependencies / 数据依赖

Primary app data lives in:
核心应用数据位于：

- `src/data/matches.json`: group-stage schedule and scores.
  `src/data/matches.json`：小组赛赛程和比分。
- `src/data/knockoutVenues.json`: knockout schedule, placeholders, match IDs, and path logic inputs.
  `src/data/knockoutVenues.json`：淘汰赛赛程、占位符、比赛 ID 和路径逻辑输入。
- `src/data/knockoutResults.json`: real group/third-place resolutions as they become known.
  `src/data/knockoutResults.json`：已确定的小组名次和第三名席位结果。
- `src/data/teams.json`: team codes, names, groups, and flag mapping inputs.
  `src/data/teams.json`：球队代码、名称、分组和旗帜映射输入。
- `src/data/cities.json`: host city and venue metadata.
  `src/data/cities.json`：主办城市和场馆元数据。
- `src/data/pathDistances.json`: precomputed travel/path distance data.
  `src/data/pathDistances.json`：预计算的旅行/路径距离数据。

Operational expectation:
运维预期：

- Verify public match information against official sources before publishing updates.
  发布更新前，用官方来源核对公开比赛信息。
- Run `npm.cmd run data:validate` after score edits.
  修改比分后运行 `npm.cmd run data:validate`。
- Run `npm.cmd run knockout -- check` after knockout result edits.
  修改淘汰赛结果后运行 `npm.cmd run knockout -- check`。
- Treat third-place slot assignments as explicit official bracket placements, not inferred team lists.
  第三名席位必须按官方明确签位处理，不能只从八支第三名球队列表推断。

## Mobile UX Review / 移动端 UX 审查

Code-level review found a real mobile strategy rather than only desktop shrinking:
代码层面看，这不是简单缩小桌面版，而是有真实的移动端策略：

- Header controls compress into one row on small screens.
  小屏幕上页头控件压缩为一行。
- Map receives a fixed top portion of the viewport and sidebars become bottom scroll panels.
  地图占据视口上方固定区域，侧栏变为底部可滚动面板。
- Empty mobile selection avoids overloading the first screen with both city and team sidebars.
  移动端空选择状态避免首屏同时塞入城市和球队侧栏。
- Fixed footer stays available for support/legal links.
  固定页脚保留支持和法律链接入口。
- Dropdown menus switch to fixed viewport-width panels on mobile.
  下拉菜单在移动端切换为固定视口宽度面板。
- Reduced motion is respected for animations.
  动画遵循 reduced motion 偏好。

Remaining mobile risk:
剩余移动端风险：

- This review did not include live device screenshots or touch testing.
  本次审查没有包含真机截图或触控测试。
- Four dropdowns in one row may still feel tight on narrow phones or high text scaling.
  四个下拉框放在一行，在窄屏或高字体缩放下可能仍然拥挤。
- Fixed footer plus scrollable sidebars should be manually checked on iOS Safari and Android Chrome.
  固定页脚加可滚动侧栏需要在 iOS Safari 和 Android Chrome 上手动检查。
- CSS `:has()` is used for sidebar visibility; modern support is broad, but older browsers remain a compatibility edge.
  侧栏显示逻辑使用 CSS `:has()`；现代浏览器支持较广，但旧浏览器仍是兼容性边界。

## README Quality / README 质量

The README now covers:
README 现在覆盖：

- Public app URL and private-source boundary.
  公共应用 URL 和私有源码边界。
- Static export deployment shape.
  静态导出部署形态。
- Windows-friendly `npm.cmd` commands.
  Windows 友好的 `npm.cmd` 命令。
- Score update workflow.
  比分更新流程。
- Knockout result workflow.
  淘汰赛结果更新流程。
- Recommended checks before deploy.
  部署前推荐检查。
- Runtime third-party dependencies and privacy posture.
  运行时第三方依赖和隐私姿态。

Remaining README improvements:
README 仍可改进：

- Add a screenshot or GIF for portfolio readers.
  为作品集读者添加截图或 GIF。
- Add a short architecture diagram if this becomes a public case study.
  如果未来作为公开 case study，可添加简短架构图。
- Add a fresh-install command recommendation such as `npm ci` if this repo is ever shared with collaborators.
  如果仓库未来分享给协作者，可增加 `npm ci` 之类的全新安装建议。
- Add a sitemap/static route validation command if implemented later.
  如果后续实现，可加入 sitemap/静态路由验证命令。

## Privacy, About, and Support Links / 隐私、关于和支持链接

Current state after small fix:
小修后的当前状态：

- Footer includes Video Guide, Support the project, creator attribution, and Privacy & Legal.
  页脚包含 Video Guide、Support the project、创作者署名，以及 Privacy & Legal。
- Privacy note states the app has no accounts or first-party forms and names third-party asset/link surfaces.
  隐私说明写明应用没有账号或第一方表单，并列出第三方资源/链接表面。
- Legal note states the FIFA affiliation disclaimer.
  法律说明写明与 FIFA 无官方关联。
- About is represented by the creator attribution link to `duoyj.ca`, not a dedicated `/about` page.
  About 目前由指向 `duoyj.ca` 的创作者署名链接承载，而不是独立 `/about` 页面。

Recommendation:
建议：

- A dedicated About page is optional. For portfolio polish, a short static About page could explain the project purpose, unofficial status, data maintenance model, and creator contact path. This is not required for reliability and was not added in this pass.
  独立 About 页面是可选项。为了作品集打磨，可以做一个短静态 About 页面，说明项目目的、非官方状态、数据维护模型和创作者联系方式。它不是可靠性必需项，本次没有添加。

## Safe Small Fixes Applied / 已应用的安全小修

- `README.md`: added public app notes, third-party dependency/privacy notes, recommended checks, and clearer license/public-app wording.
  `README.md`：添加公共应用说明、第三方依赖/隐私说明、推荐检查命令，以及更清晰的许可证/公共应用表述。
- `src/components/Footer.tsx`: changed Legal to Privacy & Legal and added a privacy disclosure.
  `src/components/Footer.tsx`：把 Legal 改为 Privacy & Legal，并加入隐私披露。
- `src/components/Header.tsx`: replaced the header logo `<img>` with `next/image` using the real image dimensions.
  `src/components/Header.tsx`：用 `next/image` 替换页头 logo 的 `<img>`，并使用真实图片尺寸。
- `src/components/TeamFlightPath/CityLabel.tsx`: removed an unused collision helper.
  `src/components/TeamFlightPath/CityLabel.tsx`：移除未使用的碰撞检测辅助函数。
- `src/components/TeamFlightPath/FlightSegment.tsx`: removed unused imports.
  `src/components/TeamFlightPath/FlightSegment.tsx`：移除未使用 import。
- `src/hooks/useMapViewControl.ts`: removed unused imports and included `selectedDay` in a relevant effect dependency list.
  `src/hooks/useMapViewControl.ts`：移除未使用 import，并把 `selectedDay` 加入相关 effect 依赖列表。
- `src/components/MatchDayLabels.tsx`: made the map refresh key an intentional memo invalidator.
  `src/components/MatchDayLabels.tsx`：明确把地图刷新 key 作为 memo 重新计算触发项。

## Maintenance Recommendations / 维护建议

1. Keep data edits script-first and validate after every update.
   数据编辑优先通过脚本完成，并在每次更新后验证。
2. Refresh local dependencies with `npm ci` or `npm.cmd install` before release verification when `node_modules` is stale.
   当 `node_modules` 过期时，发布验证前用 `npm ci` 或 `npm.cmd install` 刷新本地依赖。
3. Add a lightweight sitemap/static-route consistency test.
   添加轻量的 sitemap/静态路由一致性测试。
4. Add manual mobile QA screenshots for at least 390x844, 430x932, 768x1024, and desktop.
   至少为 390x844、430x932、768x1024 和桌面视口补充手动移动端 QA 截图。
5. Keep FIFA/source disclaimers visible and avoid implying official affiliation.
   保持 FIFA/来源免责声明可见，避免暗示官方关联。
6. Track dependency freshness monthly during the tournament window.
   在赛事窗口期按月跟踪依赖新鲜度。