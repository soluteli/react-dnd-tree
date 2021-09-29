1. `"jsx": "preserve",` 和 `peerDependencies`
2. `runtimeHelpers: true,` 和 `@bable/runtime`
3. 需要先 `npm run build`, 否则 demo 样式无效

## 发布流程

1. 发布文档 `npm run deploy`
2. 更新日志 `npm run changelog`, 然后手动更改
3. 更改版本 `npm version patch | minor`
4. 发布 `npm publish`
