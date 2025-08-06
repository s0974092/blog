## 🛠️ 本機開發檢查指南

### 為什麼需要本機檢查？

在推送代碼到 GitHub 之前進行本機檢查可以：

- ✅ **節省時間** - 避免推送後發現錯誤需要重新提交
- ✅ **提高效率** - 快速發現並修復問題
- ✅ **確保品質** - 在本地就確保代碼符合標準
- ✅ **減少 CI 失敗** - 降低 GitHub Actions 失敗的機率

### 檢查流程

#### 1. 日常開發檢查
```bash
# 每次修改代碼後運行
npm run ci:basic
```

#### 2. 提交前檢查
```bash
# 在 git commit 之前運行
npm run ci:pre-commit
```

#### 3. 推送前檢查
```bash
# 在 git push 之前運行
npm run ci:pre-push
```

### 自動化檢查（推薦）

我們已經配置了 Git hooks，會自動在提交和推送前運行檢查：

```bash
# 安裝 husky（如果還沒安裝）
npm install --save-dev husky

# 啟用 Git hooks
npx husky install

# 現在每次 git commit 和 git push 都會自動運行檢查
```

### 檢查失敗時的處理

如果檢查失敗，請按照以下步驟處理：

1. **TypeScript 錯誤**
   ```bash
   # 查看詳細錯誤信息
   npm run type-check
   
   # 修復類型錯誤後重新檢查
   npm run ci:basic
   ```

2. **測試失敗**
   ```bash
   # 查看測試詳情
   npm test
   
   # 修復測試後重新檢查
   npm run ci:basic
   ```

3. **代碼品質問題**
   ```bash
   # 自動修復 ESLint 問題
   npm run lint:fix
   
   # 手動檢查代碼品質
   npm run lint
   ```

4. **安全審計失敗**
   ```bash
   # 查看安全問題詳情
   npm audit
   
   # 修復安全問題
   npm audit fix
   ```

### 檢查腳本對比

| 檢查項目 | ci:basic | ci:quick | ci:pre-commit | ci:pre-push | ci:local |
|----------|----------|----------|---------------|-------------|----------|
| TypeScript | ✅ | ✅ | ✅ | ✅ | ✅ |
| 單元測試 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 代碼品質 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 安全審計 | ❌ | ✅ | ❌ | ✅ | ✅ |
| 構建檢查 | ❌ | ❌ | ❌ | ✅ | ✅ |

### 性能優化建議

- **開發時**：使用 `npm run ci:basic`，只檢查最重要的項目
- **提交前**：使用 `npm run ci:pre-commit`，確保代碼品質
- **推送前**：使用 `npm run ci:pre-push`，完整檢查
- **CI/CD**：使用 `npm run ci:local`，模擬 GitHub Actions

### 故障排除

#### 常見問題

1. **檢查太慢**
   ```bash
   # 只運行 TypeScript 檢查
   npm run type-check
   
   # 只運行測試
   npm test
   ```

2. **內存不足**
   ```bash
   # 增加 Node.js 內存限制
   NODE_OPTIONS="--max-old-space-size=4096" npm run ci:basic
   ```

3. **依賴問題**
   ```bash
   # 清理並重新安裝依賴
   rm -rf node_modules package-lock.json
   npm install
   ```

#### 跳過檢查（不推薦）

如果緊急情況下需要跳過檢查：

```bash
# 跳過 pre-commit hook
git commit --no-verify -m "緊急修復"

# 跳過 pre-push hook
git push --no-verify
```

**注意**：只有在緊急情況下才使用，平時應該修復問題而不是跳過檢查。

### 代碼品質最佳實踐

#### 1. 使用自動修復
```bash
# 自動修復 ESLint 問題
npm run lint:fix

# 自動格式化代碼
npm run format-fix
```

#### 2. 定期檢查
```bash
# 每日開發結束前
npm run ci:basic

# 每週進行完整檢查
npm run ci:local
```

#### 3. 團隊協作
- 在 Pull Request 前運行完整檢查
- 使用 `npm run ci:pre-push` 確保推送的代碼品質
- 定期更新依賴包以修復安全漏洞

---

**💡 提示**：養成在本地運行檢查的習慣，這將大大提高您的開發效率和代碼品質！