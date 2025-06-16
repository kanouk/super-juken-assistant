
import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const testMessages = [
  {
    id: 1,
    content: `# 数学と化学のテスト

## 数学

### 1. ピタゴラスの定理
直角三角形において、$a^2 + b^2 = c^2$ が成り立ちます。

### 2. 相加相乗平均
任意の正の数 $a, b$ に対して：

$$
\\frac{a + b}{2} \\geq \\sqrt{ab}
$$

### 3. ベクトルの内積
$$
\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta
$$

### 4. 行列
$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$

### 5. ベクトルの外積
3次元空間で $\\vec{a} = (a_1, a_2, a_3)$ のとき、外積は

$$
\\vec{a} \\times \\vec{b} = \\begin{pmatrix}
a_2b_3 - a_3b_2 \\\\
a_3b_1 - a_1b_3 \\\\
a_1b_2 - a_2b_1
\\end{pmatrix}
$$

### 6. 分数の例
分数は$\\frac{a}{b}$のように表示されます。

より複雑な例：
$$
\\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}||\\vec{b}|} = \\cos\\theta
$$

## 化学

### 1. 基本的な化学式
水の分子式：$\\ce{H2O}$

硫酸：$\\ce{H2SO4}$

### 2. 化学反応式
燃焼反応：
$$
\\ce{CH4 + 2O2 -> CO2 + 2H2O}
$$

酸塩基反応：
$$
\\ce{HCl + NaOH -> NaCl + H2O}
$$

### 3. イオン
硫酸イオン：$\\ce{SO4^{2-}}$

アンモニウムイオン：$\\ce{NH4+}$

---

## 表の例

| 関数 | 導関数 | 積分 |
|------|---------|------|
| $x^n$ | $nx^{n-1}$ | $\\frac{x^{n+1}}{n+1} + C$ |
| $e^x$ | $e^x$ | $e^x + C$ |
| $\\sin x$ | $\\cos x$ | $-\\cos x + C$ |

## コード例

\`\`\`python
import numpy as np

def solve_quadratic(a, b, c):
    discriminant = b**2 - 4*a*c
    if discriminant >= 0:
        x1 = (-b + np.sqrt(discriminant)) / (2*a)
        x2 = (-b - np.sqrt(discriminant)) / (2*a)
        return x1, x2
    return None
\`\`\``
  }
];

export default function TestChat() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">統一されたMarkdownレンダリングテスト</h1>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">AIメッセージ（通常）</h2>
            <MarkdownRenderer content={testMessages[0].content} colorScheme="assistant" />
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-white">ユーザーメッセージ（青背景）</h2>
            <MarkdownRenderer content={testMessages[0].content} colorScheme="user" />
          </div>
        </div>
      </div>
    </div>
  );
}
