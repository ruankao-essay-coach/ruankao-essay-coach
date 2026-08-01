#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_BASE_URL = "https://api.bindvault.me/ruankao/api/v1";
const DEFAULT_RETRY_DELAYS_MS = [0, 250, 750];
const DEFAULT_LICENSE_SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const DEFAULT_ESSAY_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const RETRYABLE_HTTP_STATUSES = new Set([502, 503, 504]);

function wait(ms) {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

export async function fetchWithRetry(fetchImpl, url, options, retryDelaysMs = DEFAULT_RETRY_DELAYS_MS) {
  let lastError;
  for (let attempt = 0; attempt < retryDelaysMs.length; attempt += 1) {
    await wait(retryDelaysMs[attempt]);
    try {
      const response = await fetchImpl(url, options);
      if (RETRYABLE_HTTP_STATUSES.has(response.status) && attempt < retryDelaysMs.length - 1) {
        await response.arrayBuffer().catch(() => undefined);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  const detail = String(lastError?.message || "未知网络错误");
  throw new Error(`网络请求失败（已自动重试${retryDelaysMs.length}次）：${detail}`);
}

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
  ruankao_client.mjs essay generation-brief|humanize-brief|optimization-brief|check|review <json-file>

Exit codes for "essay check":
  0  客观检查通过且字数在范围内
  3  存在项目事实冲突、显式评分点标签或完全重复句
  4  客观检查通过，只剩字数越界`;
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

export class LocalStore {
  constructor(root = undefined) {
    this.root = root || configDir();
    this.profilePath = path.join(this.root, "profile.json");
    this.projectsDir = path.join(this.root, "projects");
    this.essaySessionsDir = path.join(this.root, "essay_sessions");
    ensureDir(this.root, 0o700);
    ensureDir(this.projectsDir, 0o700);
    ensureDir(this.essaySessionsDir, 0o700);
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

  essaySessionPath(generationId) {
    const fingerprint = createHash("sha256").update(generationId, "utf8").digest("hex");
    return path.join(this.essaySessionsDir, `${fingerprint}.json`);
  }

  saveEssaySession(request, result) {
    const generationId = String(result?.generation_id || "").trim();
    const essayTask = request?.essay_task;
    if (!generationId) {
      throw new Error("生成简报缺少 generation_id，无法建立本地终检上下文");
    }
    if (
      !essayTask
      || essayTask.status !== "confirmed"
      || !String(essayTask.topic || "").trim()
      || !Array.isArray(essayTask.task_requirements)
      || essayTask.task_requirements.length === 0
    ) {
      throw new Error("生成请求缺少已确认的论文题目，无法建立本地终检上下文");
    }

    const timestamp = nowIso();
    const session = {
      schema_version: 1,
      generation_id: generationId,
      essay_task: structuredClone(essayTask),
      ...(request.project_profile_id
        ? { project_profile_id: String(request.project_profile_id) }
        : {}),
      ...(!request.project_profile_id && request.project_profile
        ? { project_profile: structuredClone(request.project_profile) }
        : {}),
      ...(request.practice_context
        ? { practice_context: structuredClone(request.practice_context) }
        : {}),
      created_at: timestamp,
      expires_at: new Date(Date.now() + DEFAULT_ESSAY_SESSION_TTL_MS).toISOString(),
    };
    atomicWriteJson(this.essaySessionPath(generationId), session);
    return session;
  }

  hydrateEssayRequest(payload) {
    const hasConfirmedTask = payload?.essay_task?.status === "confirmed"
      && String(payload.essay_task.topic || "").trim()
      && Array.isArray(payload.essay_task.task_requirements)
      && payload.essay_task.task_requirements.length > 0;
    const hasProject = Boolean(payload?.project_profile || String(payload?.project_profile_id || "").trim());
    if (hasConfirmedTask && hasProject) return payload;

    const generationId = String(payload?.generation_id || "").trim();
    if (!generationId) {
      throw new Error("终检请求缺少 generation_id，且未携带完整的已确认题目与项目资料");
    }
    const sessionPath = this.essaySessionPath(generationId);
    if (!fs.existsSync(sessionPath)) {
      throw new Error(`未找到本机论文上下文：${generationId}；请重新执行 essay generation-brief`);
    }
    const session = this.read(sessionPath);
    if (session.generation_id !== generationId) {
      throw new Error("本机论文上下文与 generation_id 不匹配，请重新执行 essay generation-brief");
    }
    if (Date.parse(String(session.expires_at || "")) <= Date.now()) {
      throw new Error(`本机论文上下文已过期：${generationId}；请重新执行 essay generation-brief`);
    }

    return {
      essay_task: structuredClone(session.essay_task),
      ...(session.project_profile_id ? { project_profile_id: session.project_profile_id } : {}),
      ...(session.project_profile ? { project_profile: structuredClone(session.project_profile) } : {}),
      ...(session.practice_context ? { practice_context: structuredClone(session.practice_context) } : {}),
      ...payload,
    };
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

export class Client {
  constructor(
    store = undefined,
    fetchImpl = fetch,
    retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
    sessionTtlMs = Number(process.env.RUANKAO_LICENSE_SESSION_TTL_MS || DEFAULT_LICENSE_SESSION_TTL_MS),
  ) {
    this.baseUrl = (process.env.RUANKAO_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.token = (process.env.RUANKAO_LICENSE_TOKEN || "").trim();
    this.store = store || new LocalStore();
    this.fetchImpl = fetchImpl;
    this.retryDelaysMs = retryDelaysMs;
    this.sessionTtlMs = sessionTtlMs;
    this.device = deviceId();
    this.sessionPath = path.join(this.store.root, "license_session.json");
  }

  async call(method, apiPath, payload = undefined) {
    if (!this.token) {
      throw new Error("请设置 RUANKAO_LICENSE_TOKEN");
    }
    const response = await fetchWithRetry(this.fetchImpl, `${this.baseUrl}${apiPath}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "X-Device-ID": this.device,
        "X-Request-ID": `req_${randomUUID().replaceAll("-", "")}`,
        "Content-Type": "application/json",
        "User-Agent": "ruankao-essay-coach/1.0.0",
      },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    }, this.retryDelaysMs);
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

  requireToken() {
    if (!this.token) {
      throw new Error("请设置 RUANKAO_LICENSE_TOKEN");
    }
  }

  sessionFingerprint() {
    return createHash("sha256")
      .update(`${this.baseUrl}\n${this.device}\n${this.token}`, "utf8")
      .digest("hex");
  }

  hasFreshLicenseSession(now = Date.now()) {
    try {
      const session = JSON.parse(fs.readFileSync(this.sessionPath, "utf8"));
      return session.fingerprint === this.sessionFingerprint()
        && Number(session.valid_until_ms) > now + 5000;
    } catch {
      return false;
    }
  }

  rememberLicenseSession(status, now = Date.now()) {
    const remoteExpiry = Date.parse(String(status?.expires_at || ""));
    const ttlExpiry = now + this.sessionTtlMs;
    const validUntil = Number.isFinite(remoteExpiry) ? Math.min(ttlExpiry, remoteExpiry) : ttlExpiry;
    atomicWriteJson(this.sessionPath, {
      fingerprint: this.sessionFingerprint(),
      verified_at: new Date(now).toISOString(),
      valid_until_ms: validUntil,
    });
  }

  async refreshLicenseSession() {
    const status = await this.call("GET", "/license/status");
    if (status?.valid === true) this.rememberLicenseSession(status);
    return status;
  }

  async ensureLicenseSession() {
    this.requireToken();
    if (this.hasFreshLicenseSession()) return { valid: true, cached: true };
    return this.refreshLicenseSession();
  }

  enrich(payload) {
    return enrichRequestPayload(payload, this.store);
  }
}

export function enrichRequestPayload(payload, store) {
  const enriched = { ...payload };
  const projectId = String(enriched.project_profile_id ?? "").trim();
  delete enriched.project_profile_id;
  if (projectId && !enriched.project_profile) {
    enriched.project_profile = store.getProject(projectId);
  }
  return enriched;
}

function required(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

export async function execute(client, argv) {
  const [group, action, first, second] = argv;
  client.requireToken();

  if (group === "license" && action === "status") {
    return client.refreshLicenseSession();
  }

  const remoteCommand = (group === "profile" && action === "prepare")
    || (group === "project" && ["prepare", "check"].includes(action))
    || (group === "topic" && action === "analyze")
    || (group === "essay" && ["generation-brief", "humanize-brief", "optimization-brief", "check", "review"].includes(action));
  if (!remoteCommand) {
    await client.ensureLicenseSession();
  }
  const store = client.store;

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
      "humanize-brief": "/essays/humanize-brief",
      "optimization-brief": "/essays/optimization-brief",
      check: "/essays/check",
      review: "/essays/review",
    };
    if (paths[action]) {
      const request = readJsonFile(required(first, "缺少 JSON 文件路径"));
      if (action === "generation-brief") {
        const result = await client.call("POST", paths[action], client.enrich(request));
        store.saveEssaySession(request, result);
        return result;
      }
      const hydrated = store.hydrateEssayRequest(request);
      return client.call("POST", paths[action], client.enrich(hydrated));
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
