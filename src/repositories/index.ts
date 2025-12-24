/**
 * Repository Exports
 * 统一导出数据仓库实例和类型定义
 */
import { JsonMatchRepository } from './JsonMatchRepository';
import { IMatchRepository } from './types';

// 默认使用 JSON 实现，未来可切换到 API 实现
// 只需修改此处即可全局切换数据源
export const matchRepository: IMatchRepository = new JsonMatchRepository();

// 重新导出类型定义
export * from './types';
