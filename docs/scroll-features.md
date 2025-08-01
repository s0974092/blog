# 博客文章滾動功能

## 功能概述

在博客文章頁面新增了兩個重要的滾動相關功能：

### 1. 置頂按鈕 (ScrollToTop)

- **觸發條件**: 當用戶向下滾動超過 100px 時出現（可配置）
- **位置**: 固定在右下角
- **功能**: 
  - 點擊後平滑滾動到頁面頂部
  - 包含閱讀進度指示器
  - 按鈕邊框顏色會根據閱讀進度變化
  - 右上角小圓點顯示當前閱讀進度
  - 使用 `z-[60]` 確保在其他元素之上

### 2. 閱讀進度條 (ReadingProgressBar)

- **位置**: 頁面頂部橫幅
- **功能**:
  - 實時顯示閱讀進度
  - 漸變色彩和陰影效果
  - 平滑動畫過渡

### 3. 進度條設置切換 (ProgressBarToggle)

- **位置**: 左下角設置按鈕
- **功能**:
  - 可以切換顯示頂部進度條或僅使用按鈕進度指示器
  - 點擊外部自動關閉設置面板
  - 設置會即時生效

## 組件結構

```
components/blog/
├── ScrollToTop.tsx          # 置頂按鈕組件
├── ReadingProgressBar.tsx   # 頂部進度條組件
└── ProgressBarToggle.tsx    # 設置切換組件
```

## 使用方式

在博客文章頁面 (`app/(public)/blog/[id]/page.tsx`) 中：

```tsx
import ScrollToTop from '@/components/blog/ScrollToTop';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import ProgressBarToggle from '@/components/blog/ProgressBarToggle';

// 在組件中使用
<>
  {/* 頂部進度條（可選） */}
  {showTopProgressBar && <ReadingProgressBar variant="top" />}
  
  {/* 頁面內容 */}
  <div>...</div>
  
  {/* 置頂按鈕 */}
  <ScrollToTop triggerDistance={100} />
  
  {/* 設置切換 */}
  <ProgressBarToggle 
    onToggle={setShowTopProgressBar}
    defaultShowTopBar={true}
  />
</>
```

## 技術特點

1. **響應式設計**: 所有組件都適配桌面和移動端
2. **性能優化**: 使用防抖和節流技術
3. **無障礙支持**: 包含適當的 ARIA 標籤
4. **視覺反饋**: 豐富的動畫和過渡效果
5. **用戶體驗**: 平滑滾動和直觀的進度指示

## 修復的問題

### 原始問題
- ScrollToTop 組件沒有在滾動一小段距離後就出現
- 觸發距離設置為 300px，太長了

### 解決方案
1. **調整觸發距離**: 從 300px 改為 100px
2. **改進狀態管理**: 確保組件正確初始化
3. **優化 z-index**: 使用 `z-[60]` 避免與其他組件衝突
4. **簡化邏輯**: 移除複雜的條件判斷，使用簡單的 `if (!isVisible) return null`

### 測試頁面
創建了 `/test-scroll` 頁面來驗證功能：
- 顯示當前滾動位置
- 顯示觸發條件
- 實時調試信息

## 自定義選項

- 可以調整觸發滾動的距離（目前是 100px）
- 可以修改進度條顏色和樣式
- 可以調整按鈕位置和大小
- 可以自定義動畫效果

## 測試方法

1. 訪問任何博客文章頁面
2. 向下滾動超過 100px
3. 觀察右下角是否出現置頂按鈕
4. 點擊按鈕測試回到頂部功能
5. 使用左下角設置按鈕切換進度條顯示方式 