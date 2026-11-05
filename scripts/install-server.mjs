import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

// Vercel 빌드에서 노트북 중계 서버를 또 설치하면 postinstall 이 재귀로 돌다가
// 메모리 부족(SIGKILL)으로 죽는다. 시연 API 만 올리면 된다.
if (process.env.VERCEL) process.exit(0)

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const result = spawnSync("pnpm", ["--dir", "server", "install"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
})
process.exit(result.status ?? 1)
