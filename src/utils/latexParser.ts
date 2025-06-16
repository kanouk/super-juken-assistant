
export interface LaTeXMatch {
  content: string;
  type: 'block' | 'inline';
  startIndex: number;
  endIndex: number;
  delimiter: string;
  placeholder: string;
}

export interface LaTeXParseResult {
  processedContent: string;
  latexMatches: LaTeXMatch[];
}

export class LaTeXParser {
  private static readonly BLOCK_DELIMITERS = [
    { start: '\\begin{equation}', end: '\\end{equation}' },
    { start: '\\begin{align}', end: '\\end{align}' },
    { start: '\\begin{pmatrix}', end: '\\end{pmatrix}' },
    { start: '\\[', end: '\\]' },
    { start: '$$', end: '$$' }
  ];

  private static readonly INLINE_DELIMITERS = [
    { start: '\\(', end: '\\)' },
    { start: '$', end: '$' }
  ];

  private static debugMode = false;

  static setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  private static log(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(`[LaTeXParser] ${message}`, ...args);
    }
  }

  static parse(content: string): LaTeXParseResult {
    this.log('Starting parse of content:', content.substring(0, 100) + '...');
    
    // 日本語の¥記号を\に正規化
    let normalizedContent = content.replace(/¥/g, '\\');
    this.log('After ¥ normalization:', normalizedContent.substring(0, 100) + '...');

    const latexMatches: LaTeXMatch[] = [];
    let processedContent = normalizedContent;

    // ブロック数式を最初に処理（優先度が高い）
    for (const delimiter of this.BLOCK_DELIMITERS) {
      const matches = this.findMatches(processedContent, delimiter, 'block');
      latexMatches.push(...matches);
    }

    // インライン数式を処理（$$の後に$を処理するため、ブロック処理後）
    for (const delimiter of this.INLINE_DELIMITERS) {
      const matches = this.findMatches(processedContent, delimiter, 'inline');
      latexMatches.push(...matches);
    }

    // マッチをソート（位置順）
    latexMatches.sort((a, b) => a.startIndex - b.startIndex);

    this.log('Found LaTeX matches:', latexMatches.length);

    // 重複を除去（長いマッチを優先）
    const filteredMatches = this.removeDuplicates(latexMatches);
    this.log('After removing duplicates:', filteredMatches.length);

    // プレースホルダーで置換
    let offset = 0;
    for (let i = 0; i < filteredMatches.length; i++) {
      const match = filteredMatches[i];
      const placeholder = `__LATEX_PLACEHOLDER_${i}__`;
      match.placeholder = placeholder;

      const beforeReplacement = processedContent.substring(
        match.startIndex - offset, 
        match.endIndex - offset
      );
      
      processedContent = 
        processedContent.substring(0, match.startIndex - offset) +
        placeholder +
        processedContent.substring(match.endIndex - offset);

      offset += beforeReplacement.length - placeholder.length;

      this.log(`Replaced LaTeX ${i}:`, {
        original: beforeReplacement,
        placeholder: placeholder,
        content: match.content
      });
    }

    this.log('Final processed content:', processedContent);
    this.log('LaTeX matches:', filteredMatches);

    return {
      processedContent,
      latexMatches: filteredMatches
    };
  }

  private static findMatches(
    content: string, 
    delimiter: { start: string; end: string }, 
    type: 'block' | 'inline'
  ): LaTeXMatch[] {
    const matches: LaTeXMatch[] = [];
    let searchIndex = 0;

    while (true) {
      const startIndex = content.indexOf(delimiter.start, searchIndex);
      if (startIndex === -1) break;

      // インライン数式の場合、$...$$の誤認識を防ぐ
      if (delimiter.start === '$' && content.substring(startIndex, startIndex + 2) === '$$') {
        searchIndex = startIndex + 1;
        continue;
      }

      const contentStart = startIndex + delimiter.start.length;
      const endIndex = content.indexOf(delimiter.end, contentStart);
      
      if (endIndex === -1) {
        searchIndex = startIndex + 1;
        continue;
      }

      const mathContent = content.substring(contentStart, endIndex);
      
      // 空の数式は無視
      if (!mathContent.trim()) {
        searchIndex = endIndex + delimiter.end.length;
        continue;
      }

      // インライン数式では改行を含む場合はスキップ
      if (type === 'inline' && (mathContent.includes('\n') || mathContent.includes('\r'))) {
        searchIndex = startIndex + 1;
        continue;
      }

      matches.push({
        content: mathContent,
        type,
        startIndex,
        endIndex: endIndex + delimiter.end.length,
        delimiter: `${delimiter.start}...${delimiter.end}`,
        placeholder: ''
      });

      searchIndex = endIndex + delimiter.end.length;
    }

    return matches;
  }

  private static removeDuplicates(matches: LaTeXMatch[]): LaTeXMatch[] {
    const filtered: LaTeXMatch[] = [];
    
    for (const match of matches) {
      const hasOverlap = filtered.some(existing => 
        (match.startIndex >= existing.startIndex && match.startIndex < existing.endIndex) ||
        (match.endIndex > existing.startIndex && match.endIndex <= existing.endIndex) ||
        (match.startIndex <= existing.startIndex && match.endIndex >= existing.endIndex)
      );

      if (!hasOverlap) {
        filtered.push(match);
      }
    }

    return filtered;
  }

  static restoreLatex(
    processedHtml: string, 
    latexMatches: LaTeXMatch[]
  ): string {
    let result = processedHtml;

    for (let i = latexMatches.length - 1; i >= 0; i--) {
      const match = latexMatches[i];
      const latexHtml = this.renderLatexToHtml(match);
      result = result.replace(match.placeholder, latexHtml);
    }

    return result;
  }

  private static renderLatexToHtml(match: LaTeXMatch): string {
    try {
      // KaTeXで直接HTMLをレンダリング
      const katex = require('katex');
      
      const options = {
        displayMode: match.type === 'block',
        throwOnError: false,
        strict: false,
        trust: true,
        output: 'html'
      };

      return katex.renderToString(match.content, options);
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      return `<span class="latex-error">${match.content}</span>`;
    }
  }
}
