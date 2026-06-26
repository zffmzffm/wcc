# Portfolio Notes / 作品集说明

Date: 2026-06-26
日期：2026-06-26

## Portfolio Positioning / 作品集定位

Cup26Map demonstrates a production-minded public web app rather than a toy demo. The strongest portfolio story is: a static, shareable, map-first World Cup planning tool that turns complex tournament data into a usable fan/travel experience.

Cup26Map 展示的是有生产意识的公共 Web 应用，而不是玩具 demo。它最强的作品集叙事是：一个静态、可分享、地图优先的世界杯规划工具，把复杂赛事数据转化为可用的球迷/旅行体验。

## What This Project Demonstrates / 这个项目展示了什么

- Product judgment: the first screen is the actual interactive map, not a marketing landing page.
  产品判断：首屏就是实际可用的交互地图，而不是营销落地页。
- Frontend engineering: Next.js App Router, React 19, dynamic client-only Leaflet rendering, static export, and responsive CSS.
  前端工程：Next.js App Router、React 19、仅客户端动态 Leaflet 渲染、静态导出和响应式 CSS。
- Data modeling: 104-match tournament model across teams, cities, knockout placeholders, scores, and travel paths.
  数据建模：覆盖球队、城市、淘汰赛占位符、比分和旅行路径的 104 场赛事模型。
- State management: shareable URL query state for team, city, day, and timezone selections.
  状态管理：球队、城市、比赛日和时区选择都通过可分享的 URL query 状态表达。
- Reliability mindset: validation scripts for score and knockout updates, plus unit tests around core utilities and CLI workflows.
  可靠性意识：比分和淘汰赛更新有验证脚本，核心工具函数和 CLI 工作流有单元测试。
- SEO awareness: static team and city landing pages with metadata and structured data.
  SEO 意识：球队和城市静态落地页包含 metadata 和结构化数据。
- Accessibility basics: skip links, focus styles, ARIA labels, keyboard-close modal behavior, and reduced-motion CSS.
  无障碍基础：skip link、焦点样式、ARIA label、键盘关闭弹窗，以及 reduced-motion CSS。
- Public-app hygiene: legal disclaimer, privacy note, support link, external dependency disclosure, and private-source license clarity.
  公共应用卫生：法律免责声明、隐私说明、支持链接、外部依赖披露，以及私有源码许可边界。

## Suggested Portfolio Summary / 建议作品集摘要

Cup26Map is a static Next.js app for exploring the 2026 World Cup schedule across 16 host cities and 48 teams. It combines an interactive Leaflet map, team travel paths, timezone-aware match listings, score updates, and knockout-stage scenario handling. The project emphasizes static reliability, URL-shareable state, JSON data workflows, responsive map UX, SEO landing pages, and tested maintenance scripts.

Cup26Map 是一个静态 Next.js 应用，用于探索 2026 世界杯 16 个主办城市和 48 支球队的赛程。它结合了交互式 Leaflet 地图、球队旅行路径、时区感知赛程列表、比分更新，以及淘汰赛场景处理。项目重点展示静态可靠性、URL 可分享状态、JSON 数据工作流、响应式地图 UX、SEO 落地页和经过测试的维护脚本。

## Resume Bullets / 简历要点

- Built a static Next.js 16 and React 19 map app for the 2026 World Cup, generating team and city landing pages for all 48 teams and 16 host cities.
  构建了面向 2026 世界杯的静态 Next.js 16 + React 19 地图应用，为 48 支球队和 16 个主办城市生成球队/城市落地页。
- Modeled group-stage and knockout-stage tournament data with validated score/result update scripts and a Vitest suite covering 84 tests.
  建模小组赛和淘汰赛数据，并配套经过验证的比分/结果更新脚本，以及覆盖 84 个测试的 Vitest 套件。
- Implemented responsive Leaflet map interactions, URL-shareable selections, timezone-aware schedules, and travel-path visualization for team journeys.
  实现响应式 Leaflet 地图交互、URL 可分享选择、时区感知赛程，以及球队旅程路径可视化。
- Hardened public-app surfaces with static export, SEO metadata, structured data, legal/privacy disclosures, and data-maintenance documentation.
  通过静态导出、SEO metadata、结构化数据、法律/隐私披露和数据维护文档，强化公共应用表面。

## Case Study Outline / Case Study 大纲

1. Problem: fans need one place to compare teams, cities, match days, kickoff times, and travel paths.
   问题：球迷需要一个地方同时比较球队、城市、比赛日、开球时间和旅行路径。
2. Product decision: map-first interaction with filters and sidebars instead of a table-first schedule.
   产品决策：采用地图优先交互，加筛选器和侧栏，而不是表格优先赛程。
3. Data model: teams, cities, matches, knockout placeholders, results, and distances.
   数据模型：球队、城市、比赛、淘汰赛占位符、结果和距离。
4. UX details: mobile defaults, compact controls, fixed map/sidebar layout, shareable URLs.
   UX 细节：移动端默认状态、紧凑控件、固定地图/侧栏布局、可分享 URL。
5. Reliability: static export, validation scripts, tests, and manual update runbooks.
   可靠性：静态导出、验证脚本、测试和手动更新 runbook。
6. Tradeoffs: official-data freshness is manual; no live API; browser/device QA remains partly unproven.
   取舍：官方数据新鲜度依赖手动维护；没有实时 API；浏览器/设备 QA 仍有部分未验证。

## Screenshots To Capture Before Sharing / 分享前建议截图

- Desktop default map with controls and footer visible.
  桌面默认地图，控件和页脚可见。
- Desktop selected team with flight paths and knockout legend.
  桌面选择球队后，展示飞行路径和淘汰赛图例。
- Desktop selected city sidebar with venue photo and schedule.
  桌面选择城市后，展示场馆照片和赛程侧栏。
- Mobile default view.
  移动端默认视图。
- Mobile selected team view.
  移动端选择球队视图。
- A team landing page and a city landing page.
  一个球队落地页和一个城市落地页。

## What Remains Unproven / 仍未证明的部分

- Real production traffic behavior under tile/CDN limits.
  在地图瓦片/CDN 限制下的真实生产流量表现。
- Full accessibility audit with keyboard-only and screen-reader testing.
  完整无障碍审计，包括纯键盘和屏幕阅读器测试。
- Performance metrics on real phones and slow networks.
  真机和慢网络下的性能指标。
- End-to-end update process during live tournament days.
  真实比赛日期间端到端更新流程。
- Official-data refresh cadence and source traceability.
  官方数据刷新节奏和来源可追溯性。
- Long-term browser compatibility for CSS `:has()` and fullscreen behavior on iOS.
  CSS `:has()` 和 iOS fullscreen 行为的长期浏览器兼容性。
- Monitoring, incident response, and rollback workflow for the hosted site.
  托管站点的监控、事故响应和回滚流程。

## Portfolio Framing Caveat / 作品集表述提醒

Do not present Cup26Map as official FIFA infrastructure. The correct framing is an unofficial fan and planning tool with strong static-app reliability and data-maintenance discipline.

不要把 Cup26Map 表述为 FIFA 官方基础设施。正确定位是：一个非官方球迷和规划工具，具有较强的静态应用可靠性和数据维护纪律。