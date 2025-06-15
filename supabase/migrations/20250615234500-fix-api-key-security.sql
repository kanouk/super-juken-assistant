
-- セキュリティ修正: 新規ユーザーにAPIキーをコピーしないよう修正
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_default_pin text;
  v_common_instruction text;
  v_subject_instructions jsonb;
  v_mbti_instructions jsonb;
  v_subject_configs jsonb;
BEGIN
  -- 管理者設定から取得（APIキーは除く）
  SELECT setting_value #>> '{}' INTO v_default_pin
    FROM public.admin_settings WHERE setting_key = 'default_pin' LIMIT 1;

  SELECT replace(setting_value #>> '{}', E'\\n', E'\n') INTO v_common_instruction
    FROM public.admin_settings WHERE setting_key = 'default_common_instruction' LIMIT 1;

  -- カスタムインストラクション（id→文）map
  SELECT setting_value INTO v_subject_instructions
    FROM public.admin_settings WHERE setting_key = 'default_subject_instructions' LIMIT 1;

  -- MBTIインストラクション
  SELECT setting_value INTO v_mbti_instructions
    FROM public.admin_settings WHERE setting_key = 'mbti_instructions' LIMIT 1;

  -- subject_configs配列
  SELECT setting_value INTO v_subject_configs
    FROM public.admin_settings WHERE setting_key = 'default_subject_configs' LIMIT 1;

  -- profilesテーブルに行を挿入
  INSERT INTO public.profiles (id, passcode, exam_settings)
  VALUES (NEW.id, COALESCE(v_default_pin, NULL), NULL);

  -- settingsテーブルに行を挿入（APIキーは空のオブジェクトに固定）
  INSERT INTO public.settings (
    id,
    common_instruction,
    subject_instructions,
    mbti_instructions,
    subject_configs,
    api_keys  -- 空のオブジェクトを明示的に設定
  ) VALUES (
    NEW.id,
    COALESCE(v_common_instruction, NULL),
    COALESCE(v_subject_instructions, NULL),
    COALESCE(v_mbti_instructions, NULL),
    COALESCE(v_subject_configs, NULL),
    '{}'::jsonb  -- 空のJSONオブジェクト
  );

  RETURN NEW;
END;
$function$;
