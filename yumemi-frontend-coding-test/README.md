# [(株)ゆめみのフロントエンドコーディング試験](https://notion.yumemi.co.jp/0e9ef27b55704d7882aab55cc86c999d)

## 環境構築メモ

```
# https://create-react-app.dev/docs/getting-started#selecting-a-template
npx create-react-app . --template typescript

# リンター
# https://eslint.org/docs/latest/use/getting-started
# https://zenn.dev/ro_komatsuna/articles/eslint_setup
npm init @eslint/config
# 設定は下記にした。
# ✔ How would you like to use ESLint? · To check syntax, find problems, and enforce code style
# ✔ What type of modules does your project use? · JavaScript modules
# ✔ Which framework does your project use? · React
# ✔ Does your project use TypeScript? · Yes
# ✔ Where does your code run? · Browser
# ✔ How would you like to define a style for your project? · Use a popular style guid
# ✔ Which style guide do you want to follow? … Standard
# ✔ What format do you want your config file to be in? · JSON

# フォーマッター
# https://prettier.io/docs/en/install.html
# https://prettier.io/docs/en/install.html#eslint-and-other-linters
# https://zenn.dev/ro_komatsuna/articles/prettier_setup
npm install --save-dev --save-exact prettier
echo {}> .prettierrc.json
npm install --save-dev eslint-config-prettier
```

### ESLint の設定

`npm init @eslint/config`で作成された.eslintrc.json をベースに以下を変更。

- 実行時のエラー対処

  ```json:.eslintrc.json
  {
    "parserOptions": {
      "project": "./tsconfig.json",
    },
    "settings": {
      "react": {
        "version": "detect"
      }
    }
  }
  ```

- ビルドファイルの除外

  ```json:.eslintrc.json
  {
    "ignorePatterns": ["build/"]
  }
  ```

- prettier との競合回避

  extends の最後に記述する。

  ```json:.eslintrc.json
  {
    "extends": [
      "other extends",
      "prettier"
    ],
  }
  ```

- React Hook 関連のルール追加。

  ```json:.eslintrc.json
  {
    "plugins": ["react-hooks"],
    "rules": {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
  ```

### prettier の設定

prettier の設定ファイル.prettierrc.json と.prettierignore を下記のように変更した。

- .prettierrc.json

  列数を GitHub のコードレビュー画面のデフォルトに合わせて変更。

  ```json:.prettierrc.json
  {
    "printWidth": 119
  }
  ```

- .prettierignore

  ビルドファイルなどフォーマット不要なものを追加。

  ```
  # Ignore artifacts:
  build
  coverage
  ```

# Getting Started with Create React App

以下は Create React App で作成された内容。

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
