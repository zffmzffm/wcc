# 小组赛后淘汰赛更新执行细则

## 概要

这份文档是小组赛第三轮期间和小组赛全部结束后的固定执行规则，供 Codex、其他程序员或自动化脚本遵守。

工作分两阶段：

- 每组结束后：把 `1A`、`2A`、`1B`、`2B` 等显示为实际小组第一/第二球队，并灰化已经不可能的 scenario。
- 全部小组赛结束后：根据用户提供的 8 支小组第三及其具体 R32 槽位，把 `3ABCDF` 等显示为实际球队，并灰化不可能的 scenario。

## 核心规则

- 不要直接改写 `src/data/knockoutVenues.json` 里的 `matchup` seed。
- `1A`、`2B`、`3ABCDF`、`W73` 这些字符串不仅是显示文字，也是路径推导逻辑输入。
- 实际球队必须通过新增的 resolved-display/results 数据层实现。
- 后续轮次 `W73`、`W90` 等在淘汰赛胜者未确定前继续保留。
- 第三名槽位必须由用户提供具体 R32 槽位，例如 `R32_79=CZE`。执行者不得只根据 8 支第三名球队自动猜测 `3***` 对应关系。

## 结果数据格式

新增或维护 `src/data/knockoutResults.json`。

每组第三轮结束后，记录：

```json
{
    "groups": {
        "A": {
            "first": "MEX",
            "second": "KOR",
            "eliminated": ["RSA"]
        }
    },
    "thirdPlaceSlots": {}
}
```

小组赛全部结束后，记录具体第三名槽位：

```json
{
    "thirdPlaceSlots": {
        "R32_79": "CZE",
        "R32_74": "SUI",
        "R32_82": "JPN"
    }
}
```

`thirdPlaceSlots` 的 key 是 R32 matchId，value 是实际进入该第三名槽位的球队代码。

## 每组结束后的执行流程

当用户提供某组第一、第二、淘汰球队后：

1. 写入 `groups[group].first`。
2. 写入 `groups[group].second`。
3. 写入 `groups[group].eliminated`。
4. 校验所有球队都属于该小组，且没有重复。
5. 剩余未列入第一、第二、淘汰的球队可视为“待定第三”，但在最终第三名槽位确定前，不视为已晋级。

显示规则：

- 小组第一球队：对应 `1X` scenario 保持彩色，其余 scenario 灰化。
- 小组第二球队：对应 `2X` scenario 保持彩色，其余 scenario 灰化。
- 已淘汰球队：所有淘汰赛 scenario 灰化。
- 待定第三球队：`1st`、`2nd` scenario 灰化，所有 `3rd-*` scenario 保持待定状态。
- 尚未结束的小组保持现有 scenario 行为。

## 全部小组赛结束后的执行流程

用户提供 8 个具体第三名槽位后：

1. 校验 R32 match 存在，且该 match 包含 `3...` seed。
2. 校验球队确实是该组第三名，不是第一、第二或已淘汰球队。
3. 校验球队组别符合该 seed 候选范围。例如 `R32_79` 的 `3CEFHI` 只能接受 C/E/F/H/I 组第三名。
4. 校验 8 支球队唯一，8 个 R32 第三名槽位唯一。

显示规则：

- 已分配的 `3***` 显示为实际球队代码。
- 晋级小组第三：只有实际分配到的第三名 scenario 保持彩色，其余 scenario 灰化。
- 未晋级小组第三：所有淘汰赛 scenario 灰化。

## 更新脚本规格

脚本路径：`scripts/update-knockout-results.mjs`。

npm 命令：`npm run knockout -- ...`。

必须支持：

```bash
npm run knockout -- group A 1=MEX 2=KOR out=RSA
npm run knockout -- thirds R32_79=CZE R32_74=SUI R32_82=JPN R32_81=...
npm run knockout -- check
npm run knockout -- show A
```

脚本职责：

- 读写 `src/data/knockoutResults.json`。
- 校验 `src/data/teams.json` 和 `src/data/knockoutVenues.json`。
- 每次更新后打印已解析的 R32 对阵。
- 永远不修改 `src/data/knockoutVenues.json`。
- 命令保持简短，沿用现有比分更新脚本的风格。

如果脚本不可用，执行者可以按同样 schema 手动更新 `knockoutResults.json`，然后运行校验和测试。

## 验收标准

repo 根目录存在 `POST_GROUP_STAGE_KNOCKOUT_UPDATE_RUNBOOK.md`。

文档包含：

- 两阶段工作流程。
- 结果数据 schema。
- 每类球队的 scenario 灰化规则。
- 第三名槽位填写和校验规则。
- 更新脚本命令规格。
- 验证清单。

后续 app 实现必须满足：

- 每组结束后，可以先显示已确定的小组第一/第二。
- 已淘汰球队所有 scenario 灰化。
- 待定第三球队只保留第三名 scenario 为待定。
- 全部第三名槽位确定后，不可能 scenario 全部灰化。
- `knockoutVenues.json.matchup` 原始 seed 保持不变。

## 验证清单

数据和脚本检查：

```bash
npm run knockout -- check
npm run score -- check
```

代码实现后检查：

```bash
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

手动 UI 检查：

- 选择小组第一球队，确认只有 `1st` 路线彩色。
- 选择小组第二球队，确认只有 `2nd` 路线彩色。
- 选择已淘汰球队，确认所有淘汰赛 scenario 灰化。
- 选择待定第三球队，确认第三名 scenario 仍为待定。
- 最终第三名槽位确定后，确认只有实际分配路线彩色。
