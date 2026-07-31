#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_BASE_URL = "https://api.bindvault.me/ruankao/api/v1";

function usage() {
  return `Usage:
  ruankao_client.mjs license status
  ruankao_client.mjs profile get|prepare|delete
  ruankao_client.mjs profile update <json-file>
  ruankao_client.mjs project create <json-file>
  ruankao_client.mjs project list
  ruankao_client.mjs project get|delete|check <project-id>
  ruankao_client.mjs project prepare <project-id> [authentic|reasonable_supplement|sample_project]
  ruankao_client.mjs project update <project-id> <json-file>
  ruankao_client.mjs topic analyze <json-file>
  ruankao_client.mjs essay generation-brief|optimization-brief|check|review <json-file>

Exit codes for "essay check":
  0  规则闸门通过且字数在范围内；仍需按 semantic_review 完成语义自查
  3  仍有内容问题，按 repair_requirements 重写全文
  4  内容问题已清空，只剩字数越界，按 length_adjustment.instructions 调整篇幅`;
}

function chmodIfPossible(targetPath, mode) {
  if (process.platform === "win32") {
    return;
  }
  try {
    fs.chmodSync(targetPath, mode);
  } catch {
    // Best-effort only. Some mounted filesystems do not support chmod.
  }
}

function ensureDir(dirPath, mode = 0o700) {
  fs.mkdirSync(dirPath, { recursive: true });
  chmodIfPossible(dirPath, mode);
}

function configDir() {
  const configured = process.env.RUANKAO_CONFIG_DIR;
  const candidates = configured
    ? [path.resolve(configured.replace(/^~(?=$|[\\/])/, os.homedir()))]
    : [path.join(os.homedir(), ".ruankao"), path.join(process.cwd(), ".ruankao")];

  for (const candidate of candidates) {
    try {
      ensureDir(candidate, 0o700);
      return candidate;
    } catch {
      // Try next candidate.
    }
  }
  throw new Error("无法创建本地数据目录，请设置 RUANKAO_CONFIG_DIR");
}

function nowIso() {
  return new Date().toISOString();
}

function readJsonFile(filePath) {
  const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("JSON 文件顶层必须是对象");
  }
  return value;
}

function atomicWriteJson(filePath, value) {
  ensureDir(path.dirname(filePath), 0o700);
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  chmodIfPossible(temporary, 0o600);
  fs.renameSync(temporary, filePath);
}

const PROJECT_METADATA_FIELDS = new Set([
  "fact_sources", "practice_supplements", "practice_mode", "supplement_strategy",
  "project_origin", "source_document_name",
]);

function applyFactSources(content, defaultSource, changedFields = Object.keys(content)) {
  const existing = content.fact_sources && typeof content.fact_sources === "object" && !Array.isArray(content.fact_sources)
    ? structuredClone(content.fact_sources)
    : {};
  for (const field of changedFields) {
    if (PROJECT_METADATA_FIELDS.has(field)) continue;
    if (!existing[field]) {
      existing[field] = {
        source: defaultSource,
        confirmed: ["user_confirmed", "user_edited"].includes(defaultSource),
      };
    }
  }
  return { ...content, fact_sources: existing };
}

class LocalStore {
  constructor(root = undefined) {
    this.root = root || configDir();
    this.profilePath = path.join(this.root, "profile.json");
    this.projectsDir = path.join(this.root, "projects");
    ensureDir(this.root, 0o700);
    ensureDir(this.projectsDir, 0o700);
  }

  read(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(path.basename(filePath, ".json"));
    }
    const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`本地数据文件格式错误：${filePath}`);
    }
    return value;
  }

  upgradeProject(record, filePath) {
    const content = record.content && typeof record.content === "object" && !Array.isArray(record.content)
      ? record.content
      : {};
    const defaultSource = content.practice_mode === "sample_project" ? "sample_project" : "user_confirmed";
    const upgradedContent = applyFactSources(content, defaultSource);
    if (JSON.stringify(upgradedContent.fact_sources) !== JSON.stringify(content.fact_sources || {})) {
      record.content = upgradedContent;
      atomicWriteJson(filePath, record);
    }
    return record;
  }

  getProfile() {
    if (!fs.existsSync(this.profilePath)) {
      return { exists: false, profile: null };
    }
    return { exists: true, profile: this.read(this.profilePath) };
  }

  updateProfile(patch) {
    const current = fs.existsSync(this.profilePath) ? this.read(this.profilePath) : {};
    const content = current.content && typeof current.content === "object" && !Array.isArray(current.content)
      ? current.content
      : {};
    const incoming = patch.content ?? patch;
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
      throw new Error("画像内容必须是 JSON 对象");
    }
    const record = {
      content: { ...content, ...incoming },
      updated_at: nowIso(),
    };
    atomicWriteJson(this.profilePath, record);
    return { exists: true, profile: record };
  }

  deleteProfile() {
    const existed = fs.existsSync(this.profilePath);
    if (existed) {
      fs.unlinkSync(this.profilePath);
    }
    return { deleted: existed };
  }

  createProject(payload) {
    const projectId = `proj_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
    let name = String(payload.name ?? payload.project_name ?? "").trim();
    const subject = String(payload.subject ?? "system_architect").trim();
    let content;
    if (payload.content === undefined || payload.content === null) {
      content = Object.fromEntries(
        Object.entries(payload).filter(([key]) => !["id", "name", "subject"].includes(key)),
      );
    } else if (typeof payload.content === "object" && !Array.isArray(payload.content)) {
      content = payload.content;
    } else {
      throw new Error("项目 content 必须是 JSON 对象");
    }
    if (!name) {
      name = String(content.project_name ?? "").trim();
    }
    if (!name) {
      throw new Error("项目名称不能为空");
    }
    const defaultSource = content.practice_mode === "sample_project" ? "sample_project" : "user_confirmed";
    content = applyFactSources(content, defaultSource);
    const timestamp = nowIso();
    const record = {
      id: projectId,
      name,
      subject,
      content,
      created_at: timestamp,
      updated_at: timestamp,
    };
    atomicWriteJson(path.join(this.projectsDir, `${projectId}.json`), record);
    return record;
  }

  listProjects() {
    const projects = fs
      .readdirSync(this.projectsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /^proj_.*\.json$/.test(entry.name))
      .map((entry) => {
        const filePath = path.join(this.projectsDir, entry.name);
        return this.upgradeProject(this.read(filePath), filePath);
      })
      .sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? "")));
    return { projects };
  }

  getProject(projectId) {
    const filePath = path.join(this.projectsDir, `${projectId}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`未找到本地项目：${projectId}`);
    }
    return this.upgradeProject(this.read(filePath), filePath);
  }

  updateProject(projectId, patch) {
    const current = this.getProject(projectId);
    let contentPatch;
    if (patch.content === undefined || patch.content === null) {
      contentPatch = Object.fromEntries(
        Object.entries(patch).filter(
          ([key]) => !["id", "name", "subject", "created_at", "updated_at"].includes(key),
        ),
      );
    } else if (typeof patch.content === "object" && !Array.isArray(patch.content)) {
      contentPatch = patch.content;
    } else {
      throw new Error("项目 content 必须是 JSON 对象");
    }
    const currentContent = current.content && typeof current.content === "object" && !Array.isArray(current.content)
      ? current.content
      : {};
    const explicitSources = contentPatch.fact_sources && typeof contentPatch.fact_sources === "object"
      && !Array.isArray(contentPatch.fact_sources)
      ? contentPatch.fact_sources
      : {};
    const changedFields = Object.keys(contentPatch).filter((field) => !PROJECT_METADATA_FIELDS.has(field));
    const mergedSources = {
      ...(currentContent.fact_sources || {}),
      ...explicitSources,
    };
    for (const field of changedFields) {
      if (!explicitSources[field]) {
        mergedSources[field] = { source: "user_edited", confirmed: true };
      }
    }
    current.content = { ...currentContent, ...contentPatch, fact_sources: mergedSources };
    if (patch.name || patch.project_name) {
      current.name = String(patch.name ?? patch.project_name).trim();
    }
    if (patch.subject) {
      current.subject = String(patch.subject).trim();
    }
    current.updated_at = nowIso();
    atomicWriteJson(path.join(this.projectsDir, `${projectId}.json`), current);
    return current;
  }

  deleteProject(projectId) {
    const filePath = path.join(this.projectsDir, `${projectId}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`未找到本地项目：${projectId}`);
    }
    fs.unlinkSync(filePath);
    return { deleted: true, project_id: projectId };
  }
}

function deviceId() {
  const configured = process.env.RUANKAO_DEVICE_ID;
  if (configured) {
    return configured;
  }
  const filePath = path.join(configDir(), "device_id");
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8").trim();
  }
  const value = `dev_${randomUUID().replaceAll("-", "")}`;
  fs.writeFileSync(filePath, `${value}\n`, "utf8");
  chmodIfPossible(filePath, 0o600);
  return value;
}

class Client {
  constructor(store = undefined) {
    this.baseUrl = (process.env.RUANKAO_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.token = (process.env.RUANKAO_LICENSE_TOKEN || "").trim();
    this.store = store || new LocalStore();
  }

  async call(method, apiPath, payload = undefined) {
    if (!this.token) {
      throw new Error("请设置 RUANKAO_LICENSE_TOKEN");
    }
    const response = await fetch(`${this.baseUrl}${apiPath}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "X-Device-ID": deviceId(),
        "X-Request-ID": `req_${randomUUID().replaceAll("-", "")}`,
        "Content-Type": "application/json",
        "User-Agent": "ruankao-essay-coach/0.2.9",
      },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    const text = await response.text();
    let body = text ? undefined : { ok: true };
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = { error: { code: "HTTP_ERROR", message: text } };
      }
    }
    if (!response.ok) {
      console.error(JSON.stringify(body, null, 2));
      process.exit(1);
    }
    return body;
  }

  enrich(payload) {
    const enriched = { ...payload };
    const projectId = String(enriched.project_profile_id ?? "").trim();
    delete enriched.project_profile_id;
    if (projectId && !enriched.project_profile) {
      enriched.project_profile = this.store.getProject(projectId);
    }
    if (!enriched.candidate_profile) {
      const profile = this.store.getProfile();
      if (profile.exists) {
        enriched.candidate_profile = profile.profile.content;
      }
    }
    return enriched;
  }
}

function required(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

async function execute(client, argv) {
  const [group, action, first, second] = argv;
  const store = client.store;

  if (group === "license" && action === "status") {
    return client.call("GET", "/license/status");
  }

  if (group === "profile") {
    if (action === "get") return store.getProfile();
    if (action === "prepare") {
      const profile = store.getProfile();
      const content = profile.exists ? profile.profile.content : {};
      return client.call("POST", "/profile/prepare", { candidate_profile: content });
    }
    if (action === "update") return store.updateProfile(readJsonFile(required(first, "缺少 JSON 文件路径")));
    if (action === "delete") return store.deleteProfile();
  }

  if (group === "project") {
    if (action === "create") return store.createProject(readJsonFile(required(first, "缺少 JSON 文件路径")));
    if (action === "list") return store.listProjects();
    if (action === "get") return store.getProject(required(first, "缺少项目 ID"));
    if (action === "update") {
      return store.updateProject(
        required(first, "缺少项目 ID"),
        readJsonFile(required(second, "缺少 JSON 文件路径")),
      );
    }
    if (action === "delete") return store.deleteProject(required(first, "缺少项目 ID"));
    if (["prepare", "check"].includes(action)) {
      return client.call("POST", `/projects/${action}`, {
        project_profile: store.getProject(required(first, "缺少项目 ID")),
        ...(action === "prepare" && second ? { practice_context: { mode: second } } : {}),
      });
    }
  }

  if (group === "topic" && action === "analyze") {
    return client.call("POST", "/topics/analyze", client.enrich(readJsonFile(required(first, "缺少 JSON 文件路径"))));
  }

  if (group === "essay") {
    const paths = {
      "generation-brief": "/essays/generation-brief",
      "optimization-brief": "/essays/optimization-brief",
      check: "/essays/check",
      review: "/essays/review",
    };
    if (paths[action]) {
      return client.call("POST", paths[action], client.enrich(readJsonFile(required(first, "缺少 JSON 文件路径"))));
    }
  }

  throw new Error(usage());
}

export function resultExitCode(argv, result) {
  const [group, action] = argv;
  if (group !== "essay" || action !== "check") return 0;
  if (result?.passed === false) return 3;
  if (result?.length_adjustment && result.length_adjustment.in_range === false) return 4;
  return 0;
}

async function main() {
  try {
    if (process.argv.includes("--help") || process.argv.includes("-h")) {
      console.log(usage());
      return;
    }
    const argv = process.argv.slice(2);
    const result = await execute(new Client(), argv);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = resultExitCode(argv, result);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
