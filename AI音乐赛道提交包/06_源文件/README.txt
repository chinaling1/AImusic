此目录用于存放项目源代码压缩包（≤100M）。

生成方式（任选其一）：
  1) git archive --format=zip --output=久别04_源码.zip HEAD
  2) 手动压缩项目根目录（排除 node_modules/、release*/、dist-backend/、.env 等）

注意：压缩包大小需控制在 100M 以内，建议保留 src/backend/app、src/frontend/src、electron/、requirements.txt、package.json、README.md、.env.example 等核心源文件。
