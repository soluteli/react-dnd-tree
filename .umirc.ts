import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'kh-react-dnd-tree',
  base: '/react-dnd-tree',
  publicPath: process.env.NODE_ENV === 'production' ? '/react-dnd-tree/' : '/',
  locales: [
    ['zh-CN', '中文'],
    ['en-US', 'English'],
  ],
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  // more config: https://d.umijs.org/config,
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'kh-react-dnd-tree',
        camel2DashComponentName: false,
        customStyleName: (name) => {
          return `./DndTree/style/index.less`; // 注意：这里 ./ 不可省略
        },
      },
      'kh-react-dnd-tree',
    ],
  ],
});
