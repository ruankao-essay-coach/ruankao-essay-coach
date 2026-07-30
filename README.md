# Ruankao Essay Coach

软考系统架构设计师论文生成与优化 Skill，支持 Codex 和 Claude Code。

## 一键安装

安装到 Codex：

```bash
npx --yes --package=skills@latest skills add ruankao-essay-coach/ruankao-essay-coach --skill ruankao-essay-coach -g -a codex -y
```

安装到 Claude Code：

```bash
npx --yes --package=skills@latest skills add ruankao-essay-coach/ruankao-essay-coach --skill ruankao-essay-coach -g -a claude-code -y
```

同时安装到 Codex 和 Claude Code：

```bash
npx --yes --package=skills@latest skills add ruankao-essay-coach/ruankao-essay-coach --skill ruankao-essay-coach -g -a codex -a claude-code -y
```

## Claude Code 插件安装

也可以在 Claude Code 中执行：

```text
/plugin marketplace add ruankao-essay-coach/ruankao-essay-coach
/plugin install ruankao-essay-coach@ruankao-essay-coach
```

安装后可直接描述需求，或运行：

```text
/ruankao-essay-coach:ruankao-essay-coach
```

## 配置激活码

在启动 Codex 或 Claude Code 的终端中设置：

```bash
export RUANKAO_LICENSE_TOKEN="<你的激活码>"
```

然后启动对应客户端并输入：

```text
使用 ruankao-essay-coach 帮我准备软考系统架构师论文
```

需要 Node.js 18+。
