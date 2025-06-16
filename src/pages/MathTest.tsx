
import React from 'react';
import MathDisplay from '../components/MathDisplay';
import '../styles/math-display.css';

const sampleContent = `# 数学の例

これは$a^2 + b^2 = c^2$というピタゴラスの定理です。

## 1. ベクトルの内積

$$\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta$$

ここで$\\theta$は2つのベクトルのなす角度です。

## 2. 向き

外積は「新しいベクトル」になります。

その向きは$\\vec{a}$から$\\vec{b}$へ"右ねじ"を回す方向、つまり2つのベクトルが作る面に垂直な向きになります。

## 3. 成分表示

3次元空間で

$$\\vec{a} = (a_1, a_2, a_3)$$

のとき、外積は

$$\\vec{a} \\times \\vec{b} = \\begin{pmatrix}
a_2b_3 - a_3b_2 \\\\
a_3b_1 - a_1b_3 \\\\
a_1b_2 - a_2b_1
\\end{pmatrix}$$

## 4. 分数の例

分数は$\\frac{a}{b}$のように表示されます。

より複雑な例：
$$\\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}||\\vec{b}|} = \\cos\\theta$$`;

const MathTest = () => {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Math Display Test</h1>
      <MathDisplay content={sampleContent} />
    </div>
  );
};

export default MathTest;
