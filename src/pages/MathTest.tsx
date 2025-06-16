
import React from 'react';
import UnifiedMarkdownLatexRenderer from '../components/UnifiedMarkdownLatexRenderer';
import '../styles/math-display.css';

const sampleContent = `# 数学の例

これは$E = mc^2$というアインシュタインの有名な式です。

## 1. ベクトルの内積

$$\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta$$

ここで$\\theta$は2つのベクトルのなす角度です。

## 2. 複雑な積分

$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

## 3. 無限級数

$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$

## 4. 行列

$$\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}$$

## 5. ベクトルの外積

3次元空間で

$$\\vec{a} = (a_1, a_2, a_3)$$

のとき、外積は

$$\\vec{a} \\times \\vec{b} = \\begin{pmatrix}
a_2b_3 - a_3b_2 \\\\
a_3b_1 - a_1b_3 \\\\
a_1b_2 - a_2b_1
\\end{pmatrix}$$

## 6. 分数の例

分数は$\\frac{a}{b}$のように表示されます。

より複雑な例：
$$\\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}||\\vec{b}|} = \\cos\\theta$$`;

const chemistryContent = `# 化学式の例

## 1. 基本的な化学式

水の分子式：$\\ce{H2O}$

硫酸：$\\ce{H2SO4}$

## 2. 化学反応式

燃焼反応：
$$\\ce{CH4 + 2O2 -> CO2 + 2H2O}$$

酸塩基反応：
$$\\ce{HCl + NaOH -> NaCl + H2O}$$

## 3. イオン

硫酸イオン：$\\ce{SO4^{2-}}$

アンモニウムイオン：$\\ce{NH4+}$

## 4. 複雑な反応

平衡反応：
$$\\ce{N2 + 3H2 <=> 2NH3}$$

沈殿反応：
$$\\ce{AgNO3(aq) + NaCl(aq) -> AgCl(s) v + NaNO3(aq)}$$

## 5. 有機化学

エタノール：$\\ce{C2H5OH}$

ベンゼン環：$\\ce{C6H6}$

エステル化反応：
$$\\ce{CH3COOH + C2H5OH ->[\\ce{H+}] CH3COOC2H5 + H2O}$$

## 6. 錯体

ヘキサアクア鉄(III)イオン：$\\ce{[Fe(H2O)6]^{3+}}$

## 7. 同位体

重水：$\\ce{^2H2O}$ または $\\ce{D2O}$

炭素14：$\\ce{^{14}C}$

## 8. 結晶構造

塩化ナトリウム：$\\ce{NaCl}$の結晶構造は面心立方格子

## 9. 数学と化学の混在

反応速度定数：$k = A e^{-\\frac{E_a}{RT}}$

ここで$\\ce{H2}$の解離エネルギーは$E_a = 436\\text{ kJ/mol}$`;

const MathTest = () => {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Unified Math Display Test</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">数学（Assistant色スキーム）</h2>
        <UnifiedMarkdownLatexRenderer content={sampleContent} colorScheme="assistant" />
      </div>
      
      <div className="mb-12 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-white">数学（User色スキーム）</h2>
        <UnifiedMarkdownLatexRenderer content={sampleContent} colorScheme="user" />
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">化学（Assistant色スキーム）</h2>
        <UnifiedMarkdownLatexRenderer content={chemistryContent} colorScheme="assistant" />
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-white">化学（User色スキーム）</h2>
        <UnifiedMarkdownLatexRenderer content={chemistryContent} colorScheme="user" />
      </div>
    </div>
  );
};

export default MathTest;
