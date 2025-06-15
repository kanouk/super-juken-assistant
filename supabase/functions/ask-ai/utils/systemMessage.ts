
export function buildSystemMessage(settings: any, subject: string) {
  // ユーザーの全般インストラクションが空なら管理者設定を参照
  let msg = settings?.common_instruction || settings?.default_common_instruction || 'あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。数学や化学の問題ではLaTeX記法を使って数式を表現してください。LaTeX記法を使用する際は、インライン数式は$...$、ブロック数式は$$...$$で囲んでください。';
  
  let customInstruction = '';
  
  // 教科別インストラクション - ユーザー設定が空なら管理者設定を参照
  if (Array.isArray(settings?.subject_configs)) {
    const foundConfig = settings.subject_configs.find((conf: any) => conf.id === subject);
    if (foundConfig && foundConfig.instruction && foundConfig.instruction.length > 0) {
      customInstruction = foundConfig.instruction;
    }
  }
  
  // ユーザーのsubject_instructionsをチェック
  if (!customInstruction && settings?.subject_instructions && settings.subject_instructions[subject]) {
    customInstruction = settings.subject_instructions[subject];
  }
  
  // 管理者のデフォルト教科別インストラクションを参照
  if (!customInstruction && settings?.default_subject_instructions && settings.default_subject_instructions[subject]) {
    customInstruction = settings.default_subject_instructions[subject];
  }
  
  if (customInstruction) msg += '\n\n' + customInstruction;
  
  // MBTIインストラクション - ユーザー設定が空なら管理者設定を参照
  const userMbti = settings?.user_mbti || settings?.mbti;
  if (userMbti && userMbti !== '不明') {
    let mbtiInstruction = '';
    
    // ユーザーのMBTIインストラクション
    if (settings?.mbti_instructions && settings.mbti_instructions[userMbti]) {
      mbtiInstruction = settings.mbti_instructions[userMbti];
    }
    // 管理者のMBTIインストラクション
    else if (settings?.default_mbti_instructions && settings.default_mbti_instructions[userMbti]) {
      mbtiInstruction = settings.default_mbti_instructions[userMbti];
    }
    
    if (mbtiInstruction) {
      msg += '\n\n' + mbtiInstruction;
    }
  }
  
  return msg;
}
