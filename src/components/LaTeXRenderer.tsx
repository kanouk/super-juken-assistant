
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LaTeXRendererProps {
  content: string;
  className?: string;
}

const LaTeXRenderer = ({ content, className = '' }: LaTeXRendererProps) => {
  const processedContent = useMemo(() => {
    const parts = content.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/);
    
    return parts.map((part, index) => {
      if ((part.startsWith('\\[') && part.endsWith('\\]')) || 
          (part.startsWith('$$') && part.endsWith('$$') && part.length > 4)) {
        let math = '';
        if (part.startsWith('\\[')) {
          math = part.slice(2, -2).trim();
        } else {
          math = part.slice(2, -2).trim();
        }
        
        if (math) {
          try {
            return (
              <div key={index} className="my-2 flex justify-center"> {/* Reduced margin for tighter layout */}
                <BlockMath math={math} />
              </div>
            );
          } catch (error) {
            console.error('LaTeX Block Math Error:', error, 'Input:', math);
            return <span key={index} className="text-red-500 bg-red-50 px-2 py-1 rounded">LaTeX Error</span>;
          }
        }
      }
      
      if ((part.startsWith('\\(') && part.endsWith('\\)')) ||
          (part.startsWith('$') && part.endsWith('$') && part.length > 2 && !part.includes('\n'))) {
        let math = '';
        if (part.startsWith('\\(')) {
          math = part.slice(2, -2).trim();
        } else {
          math = part.slice(1, -1).trim();
        }
        
        if (math) {
          try {
            return (
              <InlineMath key={index} math={math} />
            );
          } catch (error) {
            console.error('LaTeX Inline Math Error:', error, 'Input:', math);
            return <span key={index} className="text-red-500 bg-red-50 px-1 rounded">LaTeX Error</span>;
          }
        }
      }
      
      // 通常のテキストをReactMarkdownで処理
      // remarkGfmを追加して、テーブルや打ち消し線などのGitHub Flavored Markdownをサポート
      // whitespace-pre-wrap は ReactMarkdown が改行を処理するため、ここでは不要かもしれません。
      // ReactMarkdown のデフォルトの挙動で問題ないか確認が必要です。
      // 通常、ReactMarkdownコンポーネント内で `prose` クラスなどを使ってスタイルを当てることが多いです。
      // ここではclassNameを直接渡せるようにしています。
      if (part.trim()) { // 空の文字列や空白のみの文字列をレンダリングしない
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            // proseクラスなどTailwind Typography Pluginのクラスを適用すると見栄えが良くなりますが、
            // ここでは基本的なレンダリングに留めます。
            // className prop は ChatScreenから渡される text-sm などが適用されることを期待
            className="prose prose-sm max-w-none dark:prose-invert" // proseクラスで基本的なスタイルを適用
                                                                    // prose-smで少し小さめに
                                                                    // max-w-noneで親の幅に合わせる
                                                                    // dark:prose-invertでダークモード対応(必要に応じて)
          >
            {part}
          </ReactMarkdown>
        );
      }
      return null; // 空のパートは何もレンダリングしない
    });
  }, [content]);

  // classNameはTypewriterEffectから渡ってくる `text-sm` などを含む
  // leading-relaxedは全体の行間を調整
  return (
    <div className={`${className} leading-relaxed`}>
      {processedContent.filter(Boolean)} {/* nullを除去 */}
    </div>
  );
};

export default LaTeXRenderer;
