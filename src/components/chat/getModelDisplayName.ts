
/**
 * モデル名をユーザー向けに分かりやすく変換
 */
export const getModelDisplayName = (modelValue?: string) => {
  if (!modelValue) return '';
  const modelMap: { [key: string]: string } = {
    "gpt-4.1-2025-04-14": "GPT-4.1",
    "o3-2025-04-16": "O3",
    "o4-mini-2025-04-16": "O4 Mini",
    "gpt-4o": "GPT-4o",
    "gemini-2.5-pro": "Gemini 2.5 Pro",
    "gemini-1.5-pro": "Gemini 1.5 Pro",
    "gemini-1.5-flash": "Gemini 1.5 Flash",
    "claude-sonnet-4-20250514": "Sonnet 4",
    "claude-opus-4-20250514": "Opus 4",
    "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
    "claude-3-7-sonnet-20250219": "Claude 3.7 Sonnet",
    "claude-3-sonnet": "Claude 3 Sonnet",
    "claude-3-haiku": "Claude 3 Haiku",
    "claude-3-opus": "Claude 3 Opus",
  };
  return modelMap[modelValue] || modelValue;
};
