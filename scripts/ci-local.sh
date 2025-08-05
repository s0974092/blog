#!/bin/bash

# 本機 CI 檢查腳本
# 在推送代碼到 GitHub 之前運行此腳本來確保所有檢查通過

set -e  # 遇到錯誤時退出

echo "🚀 開始本機 CI 檢查..."
echo "=================================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查函數
check_step() {
    local step_name="$1"
    local command="$2"
    
    echo -e "${BLUE}📋 執行: $step_name${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✅ $step_name 通過${NC}"
    else
        echo -e "${RED}❌ $step_name 失敗${NC}"
        return 1
    fi
    echo ""
}

# 1. 檢查 Node.js 版本
echo -e "${BLUE}📋 檢查 Node.js 版本${NC}"
node_version=$(node --version)
echo "Node.js 版本: $node_version"
echo ""

# 2. 檢查依賴安裝
echo -e "${BLUE}📋 檢查依賴安裝${NC}"
if [ ! -d "node_modules" ]; then
    echo "安裝依賴..."
    npm install
else
    echo "依賴已安裝"
fi
echo ""

# 3. TypeScript 類型檢查
check_step "TypeScript 類型檢查" "npm run type-check"

# 4. 代碼格式化檢查
check_step "代碼格式化檢查" "npm run format-check"

# 5. ESLint 檢查
check_step "ESLint 代碼品質檢查" "npm run lint"

# 6. 測試執行
check_step "單元測試" "npm run test"

# 7. 安全審計
check_step "安全審計" "npm run security-audit"

# 8. 構建檢查
check_step "Next.js 構建" "npm run build"

echo "=================================="
echo -e "${GREEN}🎉 所有檢查通過！可以安全地推送代碼到 GitHub。${NC}"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo "  - 使用 'npm run ci:local' 快速運行所有檢查"
echo "  - 使用 'npm run ci:pre-commit' 在提交前運行基本檢查"
echo "  - 使用 'npm run ci:pre-push' 在推送前運行完整檢查"
echo "" 