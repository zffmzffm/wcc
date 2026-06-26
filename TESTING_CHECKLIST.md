# Testing Checklist / 测试清单

Date: 2026-06-26
日期：2026-06-26

## Automated Checks To Run Before Public Deploy / 公共部署前应运行的自动检查

1. `npm.cmd run lint`
   运行 lint。
2. `npm.cmd run data:validate`
   验证比赛数据。
3. `npm.cmd run knockout -- check`
   验证淘汰赛结果数据。
4. `npm.cmd run test -- --run`
   单次运行测试套件。
5. `npm.cmd run build`
   运行生产构建和静态生成。
6. Optional dependency sanity check: `npm.cmd ls next --depth=0`
   可选依赖健康检查：`npm.cmd ls next --depth=0`。

## Results From This Audit Run / 本次审计运行结果

### `npm.cmd run lint`

Exit code: 0
退出码：0

```text
> wc@0.1.0 lint
> eslint
```

### `npm.cmd run data:validate`

Exit code: 0
退出码：0

```text
> wc@0.1.0 data:validate
> node scripts/update-match-score.mjs --validate-only

Match data validation passed.
```

### `npm.cmd run knockout -- check`

Exit code: 0
退出码：0

```text
> wc@0.1.0 knockout
> node scripts/update-knockout-results.mjs check

Knockout results validation passed.
Resolved R32:
  R32_73: RSA vs CAN
  R32_74: GER vs 3ABCDF
  R32_75: NED vs MAR
  R32_76: BRA vs JPN
  R32_77: 1I vs 3CDFGH
  R32_78: CIV vs 2I
  R32_79: MEX vs 3CEFHI
  R32_80: 1L vs 3EHIJK
  R32_81: USA vs 3BEFIJ
  R32_82: 1G vs 3AEHIJ
  R32_83: 2K vs 2L
  R32_84: 1H vs 2J
  R32_85: SUI vs 3EFGIJ
  R32_86: 1J vs 2H
  R32_87: 1K vs 3DEIJL
  R32_88: AUS vs 2G
```

### `$env:NO_COLOR='1'; npm.cmd run test -- --run`

Exit code: 0
退出码：0

Note: a sandboxed no-color rerun first failed with `spawn EPERM` while starting esbuild. The same command was rerun outside the sandbox to capture readable output and passed.

说明：一次禁用颜色的沙盒内重跑在启动 esbuild 时先因 `spawn EPERM` 失败。随后在沙盒外用同一命令重跑，以便捕获可读输出，结果通过。

```text
> wc@0.1.0 test
> vitest --run


 RUN  v4.0.15 C:/cc/wcc

 ✓ src/__tests__/slugs.test.ts (2 tests) 4ms
 ✓ src/__tests__/matchStatus.test.ts (4 tests) 4ms
 ✓ src/__tests__/score.test.ts (3 tests) 4ms
 ✓ src/__tests__/pathGenerators.test.ts (10 tests) 6ms
 ✓ src/__tests__/knockoutResults.test.ts (2 tests) 5ms
 ✓ src/__tests__/formatters.test.ts (18 tests) 34ms
 ✓ src/__tests__/knockoutBracket.test.ts (4 tests) 10ms
 ✓ src/__tests__/dateUtils.test.ts (10 tests) 31ms
 ✓ src/__tests__/defaultSelection.test.ts (7 tests) 35ms
 ✓ src/__tests__/pathDistances.test.ts (4 tests) 44ms
 ✓ src/__tests__/updateMatchScoreCli.test.ts (2 tests) 159ms
 ✓ src/__tests__/updateKnockoutResultsCli.test.ts (2 tests) 237ms
 ✓ src/__tests__/useUrlState.test.ts (12 tests) 54ms
 ✓ src/__tests__/LiveMatchStack.test.tsx (4 tests) 178ms

 Test Files  14 passed (14)
      Tests  84 passed (84)
   Start at  12:08:56
   Duration  2.89s (transform 1.52s, setup 3.55s, import 2.18s, tests 807ms, environment 23.32s)
```

### `npm.cmd run build`

Exit code: 0
退出码：0

```text
> wc@0.1.0 build
> next build

   ▲ Next.js 16.0.7 (Turbopack)
   - Experiments (use with caution):
     · optimizePackageImports

   Creating an optimized production build ...
 ✓ Compiled successfully in 2.5s
   Running TypeScript ...
   Collecting page data using 19 workers ...
   Generating static pages using 19 workers (0/68) ...
   Generating static pages using 19 workers (17/68)
   Generating static pages using 19 workers (34/68)
   Generating static pages using 19 workers (51/68)
 ✓ Generating static pages using 19 workers (68/68) in 1110.8ms
   Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ● /city/[slug]
│ ├ /city/atlanta
│ ├ /city/boston
│ ├ /city/dallas
│ └ [+13 more paths]
├ ○ /icon.png
└ ● /team/[slug]
  ├ /team/mexico
  ├ /team/south-africa
  ├ /team/korea-republic
  └ [+45 more paths]


○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)

[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
```

### `npm.cmd ls next --depth=0`

Exit code: 1
退出码：1

```text
wc@0.1.0 C:\cc\wcc
`-- next@16.0.7 invalid: "16.0.10" from the root project

npm error code ELSPROBLEMS
npm error invalid: next@16.0.7 C:\cc\wcc\node_modules\next
npm error Log files were not written due to an error writing to the directory: C:\Users\zffm2\AppData\Local\npm-cache\_logs
npm error You can rerun the command with `--loglevel=verbose` to see the logs in your terminal
```

Package metadata and lockfile both require Next 16.0.10, so this is a local `node_modules` drift issue rather than a lockfile mismatch.

package 元数据和 lockfile 都要求 Next 16.0.10，因此这是本地 `node_modules` 漂移问题，而不是 lockfile 不匹配。

## Manual QA Checklist / 手动 QA 清单

### Desktop / 桌面端

- Open `/` and confirm the map renders with all host city markers.
  打开 `/`，确认地图渲染并显示所有主办城市 marker。
- Select a team and confirm group-stage routes, knockout scenario tabs, and map legend render.
  选择一支球队，确认小组赛路线、淘汰赛场景 tab 和地图图例正常渲染。
- Select a city and confirm venue image, group matches, knockout matches, and close behavior.
  选择一个城市，确认场馆图片、小组赛、淘汰赛和关闭行为正常。
- Select a match day and confirm match labels do not overlap badly.
  选择比赛日，确认比赛标签没有严重重叠。
- Use the share button and confirm copied/shared URL preserves selected state.
  使用分享按钮，确认复制/分享的 URL 能保留选择状态。
- Open fullscreen and exit fullscreen.
  打开并退出全屏。
- Open Privacy & Legal modal, close by button, overlay click, and Escape.
  打开 Privacy & Legal 弹窗，并分别用按钮、遮罩点击和 Escape 关闭。

### Mobile / 移动端

- Check 390x844, 430x932, and 768x1024 viewports.
  检查 390x844、430x932 和 768x1024 视口。
- Confirm four header dropdowns remain tappable and readable.
  确认页头四个下拉框仍可点击且可读。
- Confirm map/sidebar/fixed footer do not obscure active content.
  确认地图、侧栏和固定页脚不会遮挡当前内容。
- Select team, city, day, and timezone independently.
  分别选择球队、城市、比赛日和时区。
- Confirm dropdown menus fit the viewport and are scrollable.
  确认下拉菜单适配视口并可滚动。
- Confirm map controls are reachable and do not collide with live match stack.
  确认地图控件可触达，并且不与 live match stack 冲突。
- Check iOS Safari fullscreen fallback.
  检查 iOS Safari 的全屏 fallback。

### Data Update Flow / 数据更新流程

- Run `npm.cmd run score -- <date>` to list matches before updating.
  更新前运行 `npm.cmd run score -- <date>` 列出当天比赛。
- Run score updates through `npm.cmd run score -- <matchId> <left-right>` or date assignment mode.
  用 `npm.cmd run score -- <matchId> <left-right>` 或日期赋值模式更新比分。
- Run `npm.cmd run data:validate` after score edits.
  修改比分后运行 `npm.cmd run data:validate`。
- Run `npm.cmd run knockout -- group ...` only with verified official group results.
  只有在确认官方小组结果后，才运行 `npm.cmd run knockout -- group ...`。
- Run `npm.cmd run knockout -- thirds ...` only with exact official R32 slot assignments.
  只有拿到准确官方 R32 第三名席位分配后，才运行 `npm.cmd run knockout -- thirds ...`。
- Run `npm.cmd run knockout -- check` after knockout edits.
  修改淘汰赛数据后运行 `npm.cmd run knockout -- check`。
- Rerun test/build before deploy.
  部署前重新运行测试和构建。

### SEO and Static Export / SEO 和静态导出

- Confirm `/city/<slug>` pages exist for all 16 cities.
  确认 16 个城市都有 `/city/<slug>` 页面。
- Confirm `/team/<slug>` pages exist for all 48 teams.
  确认 48 支球队都有 `/team/<slug>` 页面。
- Confirm `out/` is regenerated by build.
  确认构建会重新生成 `out/`。
- Inspect `public/sitemap.xml` or generated output for route coverage.
  检查 `public/sitemap.xml` 或生成产物的路由覆盖情况。
- Confirm `public/_headers` is deployed by the hosting provider.
  确认托管平台会部署 `public/_headers`。

## Coverage Gaps / 覆盖缺口

- No Playwright/browser automation.
  没有 Playwright/浏览器自动化。
- No visual regression tests.
  没有视觉回归测试。
- No automated mobile viewport screenshots.
  没有自动化移动端视口截图。
- No accessibility tree or screen-reader audit.
  没有无障碍树或屏幕阅读器审计。
- No dependency audit was run in this pass.
  本次没有运行依赖审计。
- No production monitoring verification.
  没有生产监控验证。