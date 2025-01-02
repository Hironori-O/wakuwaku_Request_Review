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

1. `.env` - チーム共有の基本設定（バージョン管理対象）
   - 開発環境用の基本的な設定値
   - チームメンバー全員で共有する設定

2. `.env.local` - 個人用設定（バージョン管理対象外）
   - `.env`の設定を上書きしたい場合に使用
   - 個人の開発環境に特有の設定
   - このファイルは`.gitignore`に記載されており、Gitの管理対象外

### 新規開発環境のセットアップ

1. リポジトリをクローン
2. 必要に応じて`.env.local`を作成し、個人の環境に合わせて設定を上書き
3. `npm install`で依存パッケージをインストール
4. `npm run dev`で開発サーバーを起動

### 環境変数の優先順位

1. `.env.local` （個人設定）
2. `.env` （チーム共有設定）
