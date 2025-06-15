
-- 1. 全体インストラクションをダブルクォート除去＆改行修正
UPDATE public.settings
SET common_instruction = replace(trim(BOTH '"' FROM common_instruction), E'\\n', E'\n')
WHERE common_instruction IS NOT NULL AND common_instruction LIKE '"%"';

-- 2. 教科ごとカスタムインストラクションがNULL/空の場合、admin_settingsからコピー
UPDATE public.settings
SET subject_instructions = a.setting_value
FROM (
  SELECT setting_value
  FROM public.admin_settings
  WHERE setting_key = 'default_subject_instructions'
  LIMIT 1
) a
WHERE (subject_instructions IS NULL OR subject_instructions::text = '{}' OR subject_instructions::text = 'null');
