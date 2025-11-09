# ぶっぱんモバイル - 3ヶ月パック申し込みシステム

## 📋 プロジェクト概要

このプロジェクトは、ぶっぱんモバイルの3ヶ月パック申し込みシステムと管理者ダッシュボードの実装です。

### 主要機能

1. **5ステップ申し込みフォーム**
   - 個人情報入力（個人/法人対応）
   - プラン選択（50回線以上/未満）
   - 書類アップロード
   - 確認画面
   - 完了メッセージ

2. **管理者ダッシュボード**（未実装 - 次のフェーズで対応）
   - ログイン機能
   - 申し込み一覧
   - 詳細画面と回線管理
   - タグ管理

---

## 🏗️ 技術スタック

### フロントエンド
- **Next.js 16.0.0** (App Router)
- **React 19.2.0**
- **TypeScript 5.x**
- **Tailwind CSS v4**
- **React Hook Form** - フォームバリデーション
- **Zod** - スキーマバリデーション

### バックエンド
- **Prisma** - ORM
- **Supabase** - PostgreSQL データベース + 認証 + ストレージ
- **bcryptjs** - パスワードハッシュ化

---

## 📂 プロジェクト構造

```
/workspaces/buppanmobile2/
├── app/
│   ├── api/                      # API Routes
│   │   ├── applications/         # 申し込みデータAPI
│   │   │   └── route.ts
│   │   └── upload/               # ファイルアップロードAPI
│   │       └── route.ts
│   ├── apply/                    # 申し込みページ
│   │   └── page.tsx
│   ├── components/               # 共通コンポーネント
│   │   ├── FAQ.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── PriceTable.tsx
│   ├── mypage/                   # マイページ（準備中）
│   ├── privacy/                  # プライバシーポリシー
│   ├── terms/                    # 利用規約
│   ├── legal/                    # 法的情報
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/                          # ユーティリティ
│   ├── prisma.ts                 # Prismaクライアント
│   ├── supabase.ts               # Supabaseクライアント
│   ├── validations.ts            # Zodバリデーションスキーマ
│   └── types.ts                  # TypeScript型定義
├── prisma/
│   └── schema.prisma             # データベーススキーマ
├── public/
│   ├── images/
│   └── documents/
├── .env.example                  # 環境変数テンプレート
└── package.json
```

---

## 🗄️ データベーススキーマ

### Application（申し込み情報）
```prisma
model Application {
  id                String   @id @default(uuid())
  applicantType     String   // 'individual' | 'corporate'

  // 個人情報
  lastName          String?
  firstName         String?
  lastNameKana      String?
  firstNameKana     String?

  // 法人情報
  companyName       String?
  companyNameKana   String?
  corporateNumber   String?
  establishedDate   DateTime?

  // 代表者情報
  representativeLastName     String?
  representativeFirstName    String?
  representativeLastNameKana String?
  representativeFirstNameKana String?
  representativeBirthDate    DateTime?

  // 担当者情報
  contactLastName     String?
  contactFirstName    String?
  contactLastNameKana String?
  contactFirstNameKana String?

  // 共通情報
  phone             String
  email             String
  postalCode        String
  address           String
  dateOfBirth       DateTime?

  // プラン情報
  planType          String   // '3month-50plus' | '3month-under50'
  lineCount         Int
  totalAmount       Int

  // 書類アップロード
  idCardFrontUrl    String?
  idCardBackUrl     String?
  registrationUrl   String?

  // ステータス
  verificationStatus String  @default("unverified")
  paymentStatus      String  @default("not_issued")
  status             String  @default("draft")

  // コメント
  comment1          String?  @db.Text
  comment2          String?  @db.Text

  // タイムスタンプ
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  submittedAt       DateTime?

  // リレーション
  lines             Line[]
}
```

### Line（回線情報）
```prisma
model Line {
  id                String   @id @default(uuid())
  applicationId     String
  phoneNumber       String?
  simLocationId     String?
  spareTagId        String?
  returnDate        DateTime?
  shipmentDate      DateTime?
  lineStatus        String   @default("not_opened")

  application       Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  simLocation       Tag?        @relation("SimLocation", fields: [simLocationId], references: [id])
  spareTag          Tag?        @relation("SpareTag", fields: [spareTagId], references: [id])
}
```

### Tag（タグ管理）
```prisma
model Tag {
  id                String   @id @default(uuid())
  name              String   @unique
  type              String   // 'sim_location' | 'spare'
  color             String?
  order             Int      @default(0)

  linesAsSimLocation Line[]  @relation("SimLocation")
  linesAsSpareTag    Line[]  @relation("SpareTag")
}
```

### Admin（管理者）
```prisma
model Admin {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String   // ハッシュ化済み
  name              String
  role              String   @default("admin")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastLoginAt       DateTime?
}
```

---

## 🚀 セットアップ手順

### 1. 環境変数の設定

`.env.example`を`.env`にコピーして、必要な値を設定してください。

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
```

### 2. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. Project Settings → API から以下を取得：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Project Settings → Database から`DATABASE_URL`を取得

### 3. Supabase Storageの設定

Supabaseダッシュボードで`applications`という名前のバケットを作成：

1. Storage → New bucket
2. Name: `applications`
3. Public bucket: **ON**（公開アクセス有効）
4. Create bucket

### 4. データベースのマイグレーション

```bash
npx prisma generate
npx prisma db push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

---

## 📱 実装済み機能

### ✅ 申し込みフォーム

#### ステップ1: 個人情報入力
- 個人/法人のタブ切り替え
- **個人の場合:**
  - 姓名、姓名カナ
  - 電話番号、メールアドレス
  - 郵便番号、住所
  - 生年月日
- **法人の場合:**
  - 会社名、会社名カナ
  - 法人番号、設立年月日
  - 電話番号、メールアドレス
  - 代表者情報（姓名、姓名カナ、生年月日）
  - 担当者情報（姓名、姓名カナ）
  - 郵便番号、住所

#### ステップ2: プラン選択
- 3ヶ月パック（50回線以上: ¥4,200/回線、50回線未満: ¥4,600/回線）
- 回線数入力（プランに応じたバリデーション）
- 合計金額の自動計算表示
- ※事務手数料込み表示

#### ステップ3: 書類アップロード
- 身分証明書（表・裏）のアップロード
- 法人の場合: 登記簿謄本（3ヶ月以内発行）のアップロード
- 対応形式: JPEG, PNG, PDF（最大10MB）
- Supabase Storageへの自動アップロード
- アップロード完了時の視覚的フィードバック

#### ステップ4: 確認画面
- 全入力内容の表示
- 各ステップへ戻って修正可能
- 同意事項のチェックボックス:
  - プライバシーポリシー
  - 利用規約
  - 電気通信事業法約款
  - 初期契約解除制度
  - 反社会的勢力でないことの表明

#### ステップ5: 完了メッセージ
- 「ありがとうございます。2営業日以内で請求書と申し込み確認のご連絡をさせていただきます。」
- トップページへの戻るリンク

### ✅ データ保存機能

- **途中保存:** 各ステップ完了時に自動的にデータベースに保存（status: 'draft'）
- **セッション復帰:** ブラウザを閉じても、sessionStorageから途中データを復元可能
- **最終送信:** ステップ4で「申し込む」ボタンを押すと`status`が`submitted`に更新

### ✅ API エンドポイント

#### POST `/api/applications`
申し込みデータの保存・更新

**リクエスト:**
```json
{
  "id": "uuid（更新の場合のみ）",
  "step": 1,
  "status": "draft | submitted",
  "data": { /* フォームデータ */ }
}
```

**レスポンス:**
```json
{
  "success": true,
  "application": { /* 保存されたデータ */ }
}
```

#### GET `/api/applications?email=xxx`
下書き状態の申し込み情報を取得

**レスポンス:**
```json
{
  "application": { /* 申し込みデータ or null */ }
}
```

#### POST `/api/upload`
ファイルアップロード

**リクエスト:**
```
FormData {
  file: File,
  folder: string
}
```

**レスポンス:**
```json
{
  "success": true,
  "url": "https://...",
  "path": "documents/..."
}
```

---

## 🚧 未実装機能（次のフェーズ）

### 管理者ダッシュボード

1. **ログインページ** (`/admin/login`)
   - メール・パスワード認証
   - Supabase Auth使用

2. **一覧画面** (`/admin/dashboard`)
   - 全申し込みの一覧表示
   - ステータスフィルター
   - 検索機能
   - ページネーション

3. **詳細画面** (`/admin/applications/[id]`)
   - 申し込み情報の詳細表示
   - 回線管理テーブル
   - ステータス更新
   - コメント追加・編集

4. **タグ管理画面** (`/admin/settings`)
   - SIMの場所タグ管理
   - 予備タグ管理
   - タグの追加・編集・削除

5. **認証ミドルウェア**
   - `/admin`配下のルート保護
   - 管理者権限チェック

---

## 🔐 セキュリティ対策

### 実装済み
- ✅ 環境変数による機密情報の管理
- ✅ ファイルアップロードのバリデーション（サイズ、形式）
- ✅ Zod によるフォーム入力のバリデーション
- ✅ Supabase Storage の使用（安全なファイル保存）

### 未実装（今後対応）
- ⏳ CSRF トークン
- ⏳ レート制限
- ⏳ 管理者パスワードのハッシュ化（bcryptjs導入済み、実装待ち）
- ⏳ JWT による認証

---

## 🎨 デザインシステム

### カラーパレット
```css
--gold: #d4af37
--gold-light: #f0d970
--gold-dark: #b8941f
--background: #0a0a0a
--foreground: #ffffff
```

### コンポーネントスタイル
- **Glassmorphism:** `bg-white/5 backdrop-blur-sm border border-white/10`
- **Gradient Buttons:** `bg-gradient-to-r from-[#d4af37] to-[#f0d970]`
- **Rounded Corners:** `rounded-2xl`, `rounded-3xl`, `rounded-full`
- **Hover Effects:** `hover:border-[#d4af37]/50 hover:shadow-xl`

---

## 📊 データフロー

### 申し込みフロー

```
ユーザー入力
    ↓
フロントエンドバリデーション（Zod）
    ↓
API リクエスト (/api/applications)
    ↓
サーバーサイドバリデーション
    ↓
Prisma → データベース保存
    ↓
レスポンス返却
    ↓
次のステップへ or 完了画面
```

### ファイルアップロードフロー

```
ファイル選択
    ↓
クライアント側バリデーション（サイズ、形式）
    ↓
FormData作成
    ↓
API リクエスト (/api/upload)
    ↓
サーバー側バリデーション
    ↓
Supabase Storage アップロード
    ↓
公開URL取得
    ↓
フォームデータに URL 保存
```

---

## 🐛 トラブルシューティング

### データベース接続エラー

**問題:** `Prisma Client could not connect to the database`

**解決策:**
1. `.env`の`DATABASE_URL`が正しいか確認
2. Supabaseプロジェクトが起動しているか確認
3. `npx prisma generate`を再実行

### ファイルアップロードエラー

**問題:** `ファイルのアップロードに失敗しました`

**解決策:**
1. Supabaseで`applications`バケットが作成されているか確認
2. バケットが公開設定（Public bucket: ON）になっているか確認
3. `SUPABASE_SERVICE_ROLE_KEY`が正しく設定されているか確認

### ビルドエラー

**問題:** `Module not found: Can't resolve '@/lib/...'`

**解決策:**
```bash
# Prisma Clientを再生成
npx prisma generate

# node_modulesを再インストール
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 開発メモ

### 料金設定
- 50回線以上: ¥4,200（税込）/ 回線
- 50回線未満: ¥4,600（税込）/ 回線
- ※事務手数料込み

### 書類要件
- **個人:** 身分証明書（表・裏）
- **法人:** 身分証明書（表・裏）+ 登記簿謄本（3ヶ月以内発行）

### ステータス定義

**verificationStatus（本人確認）:**
- `unverified`: 未確認
- `verified`: 確認済み
- `issue`: 不備あり

**paymentStatus（決済）:**
- `not_issued`: 請求書発行前
- `issued`: 請求書発行済み
- `paid`: 入金済み

**status（申し込み全体）:**
- `draft`: 下書き
- `submitted`: 送信済み
- `processing`: 処理中
- `completed`: 完了

**lineStatus（回線）:**
- `not_opened`: 未開通
- `opened`: 開通済み
- `shipped`: 発送済み
- `waiting_return`: 返却待ち
- `returned`: 返却済み
- `canceled`: 解約

---

## 🤝 コントリビューション

このプロジェクトは現在開発中です。バグ報告や機能要望がある場合は、Issueを作成してください。

---

## 📄 ライセンス

Private Project - All Rights Reserved

---

## 👨‍💻 作成者

Claude Code による自動生成

---

最終更新日: 2025-11-09
