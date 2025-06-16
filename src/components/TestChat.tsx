
import React from 'react';
import ChatMessageRenderer from './ChatMessageRenderer';

const testMessages = [
  {
    id: 1,
    content: `# 数学の基礎

## 1. ピタゴラスの定理

直角三角形において、$a^2 + b^2 = c^2$ が成り立ちます。

## 2. 相加相乗平均

任意の正の数 $a, b$ に対して：

$$\\frac{a + b}{2} \\geq \\sqrt{ab}$$

等号成立は $a = b$ のときです。

## 3. ベクトルの演算

### 内積
$$\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta$$

### 外積
3次元空間で $\\vec{a} = (a_1, a_2, a_3)$ のとき：

$$\\vec{a} \\times \\vec{b} = \\begin{pmatrix}
a_2b_3 - a_3b_2 \\\\
a_3b_1 - a_1b_3 \\\\
a_1b_2 - a_2b_1
\\end{pmatrix}$$

## 4. 積分

ガウス積分：
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

---

## 表の例

| 関数 | 導関数 | 積分 |
|------|---------|------|
| $x^n$ | $nx^{n-1}$ | $\\frac{x^{n+1}}{n+1} + C$ |
| $e^x$ | $e^x$ | $e^x + C$ |
| $\\sin x$ | $\\cos x$ | $-\\cos x + C$ |
| $\\cos x$ | $-\\sin x$ | $\\sin x + C$ |

## コードの例

\`\`\`python
import numpy as np

def quadratic_formula(a, b, c):
    """二次方程式の解を求める"""
    discriminant = b**2 - 4*a*c
    if discriminant >= 0:
        x1 = (-b + np.sqrt(discriminant)) / (2*a)
        x2 = (-b - np.sqrt(discriminant)) / (2*a)
        return x1, x2
    else:
        return None
\`\`\`

## タスクリスト

- [x] MarkdownとLaTeXの統合
- [x] 表のレンダリング
- [ ] グラフの描画機能
- [ ] インタラクティブな数式

> **注意**: このレンダラーはKaTeXを使用しているため、一部のLaTeXコマンドはサポートされていない場合があります。`
  }
];

export default function TestChat() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">チャットメッセージレンダリングテスト</h1>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">AIメッセージ（通常）</h2>
            <ChatMessageRenderer content={testMessages[0].content} colorScheme="assistant" />
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-white">ユーザーメッセージ（青背景）</h2>
            <ChatMessageRenderer content={testMessages[0].content} colorScheme="user" />
          </div>
        </div>
      </div>
    </div>
  );
}
