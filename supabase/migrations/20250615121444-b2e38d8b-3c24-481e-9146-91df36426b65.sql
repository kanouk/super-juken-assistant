
-- "default_pin"をプレーンテキストとして保存するよう修正
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
BEGIN
  -- 注意！#>>'{}'でJSONの中身をそのままテキストで取得
  SELECT setting_value #>> '{}' INTO v_default_pin
    FROM public.admin_settings WHERE setting_key = 'default_pin' LIMIT 1;

  SELECT setting_value #>> '{}' INTO v_common_instruction
    FROM public.admin_settings WHERE setting_key = 'default_common_instruction' LIMIT 1;

  SELECT setting_value INTO v_subject_instructions
    FROM public.admin_settings WHERE setting_key = 'default_subject_instructions' LIMIT 1;

  SELECT setting_value INTO v_mbti_instructions
    FROM public.admin_settings WHERE setting_key = 'mbti_instructions' LIMIT 1;

  INSERT INTO public.profiles (id, passcode)
  VALUES (NEW.id, COALESCE(v_default_pin, NULL));

  INSERT INTO public.settings (
    id,
    common_instruction,
    subject_instructions,
    mbti_instructions
  ) VALUES (
    NEW.id,
    COALESCE(v_common_instruction, NULL),
    COALESCE(v_subject_instructions, NULL),
    COALESCE(v_mbti_instructions, NULL)
  );

  RETURN NEW;
END;
$function$;
