# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 環境変数の設定

本プロジェクトでは、以下の環境変数ファイルを使用します：

1. `.env.example` - 環境変数のテンプレート
   - 必要な環境変数の一覧
   - バージョン管理対象

2. `.env` - 実際の環境変数
   - APIキーなどの機密情報を含む
   - セキュリティのためバージョン管理対象外

### 新規環境のセットアップ

1. `.env.example`をコピーして`.env`を作成：
```bash
cp .env.example .env
```

2. `.env`に必要な環境変数を設定
   ※ 実際の値は開発チームに確認してください

