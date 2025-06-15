
export function buildSystemMessage(settings: any, subject: string) {
  let msg = settings?.common_instruction || 'あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。数学や化学の問題ではLaTeX記法を使って数式を表現してください。LaTeX記法を使用する際は、インライン数式は$...$、ブロック数式は$$...$$で囲んでください。';
  let customInstruction = '';
  if (Array.isArray(settings?.subject_configs)) {
    const foundConfig = settings.subject_configs.find((conf: any) => conf.id === subject);
    if (foundConfig && foundConfig.instruction && foundConfig.instruction.length > 0) {
      customInstruction = foundConfig.instruction;
    }
  }
  if (!customInstruction && settings?.subject_instructions && settings.subject_instructions[subject]) {
    customInstruction = settings.subject_instructions[subject];
  }
  if (customInstruction) msg += '\n\n' + customInstruction;
  return msg;
}
