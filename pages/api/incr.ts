// import { Redis } from "@upstash/redis";
// import { NextRequest, NextResponse } from "next/server";

// const redis = Redis.fromEnv();
// export const config = {
//   runtime: "edge",
// };

// export default async function incr(req: NextRequest): Promise<NextResponse> {
//   if (req.method !== "POST") {
//     return new NextResponse("use POST", { status: 405 });
//   }
//   if (req.headers.get("Content-Type") !== "application/json") {
//     return new NextResponse("must be json", { status: 400 });
//   }

//   const body = await req.json();
//   let slug: string | undefined = undefined;
//   if ("slug" in body) {
//     slug = body.slug;
//   }
//   if (!slug) {
//     return new NextResponse("Slug not found", { status: 400 });
//   }
//   const ip = req.ip;
//   if (ip) {
//     // Hash the IP in order to not store it directly in your db.
//     const buf = await crypto.subtle.digest(
//       "SHA-256",
//       new TextEncoder().encode(ip),
//     );
//     const hash = Array.from(new Uint8Array(buf))
//       .map((b) => b.toString(16).padStart(2, "0"))
//       .join("");

//     // deduplicate the ip for each slug
//     const isNew = await redis.set(["deduplicate", hash, slug].join(":"), true, {
//       nx: true,
//       ex: 24 * 60 * 60,
//     });
//     if (!isNew) {
//       new NextResponse(null, { status: 202 });
//     }
//   }
//   await redis.incr(["pageviews", "projects", slug].join(":"));
//   return new NextResponse(null, { status: 202 });
// }

/**
 * このコードは **Next.js (Edge Functions)** を使って、あるプロジェクトのスラッグ (`slug`) に対応する **ページビュー（PV）カウント**を行うAPIエンドポイントを定義しています。また、同じIPアドレスからの重複アクセスを一日（24時間）に1回に制限する機能も備えています。

順を追って説明します：

---

### 🔧 使用している技術

- `@upstash/redis`: サーバーレス対応のRedis（Upstash）のクライアントライブラリ
- `Next.js Edge Runtime`: 高速なレスポンスを可能にするためにEdge環境で実行される

---

### 🧠 何をしているか（流れ）

1. **リクエストの検証**
   - `POST`メソッド以外なら `405 Method Not Allowed` を返す
   - `Content-Type` が `application/json` でないなら `400 Bad Request`

2. **JSONボディのパース**
   - `slug`（識別子）が存在するか確認
   - なければ `400 Bad Request`

3. **IPアドレスの取得とハッシュ化**
   - ユーザーのIPを `SHA-256` でハッシュ化
   - IPをそのまま保存しないことでプライバシーに配慮

4. **重複チェック**
   - Redisキー形式：`deduplicate:<hash>:<slug>`
   - `nx: true` → キーが存在しないときだけセット
   - `ex: 86400` → 有効期限は24時間
   - すでにアクセス済みなら何もせず `202 Accepted` を返す（ページビュー増加はしない）

5. **ページビューのカウント**
   - Redisキー形式：`pageviews:projects:<slug>`
   - インクリメント（`INCR`）でページビューを1増やす

6. **レスポンス**
   - 常に `202 Accepted` を返す（非同期処理成功）

---

### 📦 Redisに保存されるキーの例

| キー名                          | 値         | 目的                       |
|-------------------------------|------------|----------------------------|
| `deduplicate:<ip-hash>:slug` | `true`     | 同一IPでの重複防止        |
| `pageviews:projects:slug`     | 数値 (`1`) | 実際のページビュー数       |

---

### ✅ 実用用途の例

例えば、ポートフォリオサイトなどで各プロジェクトページごとのPVをカウントしつつ、ボットなどによるリロードスパムを防ぎたいときにこのコードが役立ちます。

---

もっと掘り下げることもできるけど、何か気になる部分ある？
 */