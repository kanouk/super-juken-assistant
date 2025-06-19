
export interface SettingsType {
  passcode: string;
  apiKeys: {
    openai: string;
    google: string;
    anthropic: string;
  };
  models: {
    openai: string;
    google: string;
    anthropic: string;
  };
  selectedProvider: string;
  commonInstruction: string;
  subjectInstructions: {
    [key: string]: string;
  };
  subjectConfigs: SubjectConfig[];
  mbtiInstructions?: { [key: string]: string };
  adminDefaults?: any;
  availableModels?: any;
  freeUserModels?: any;
  freeUserApiKeys?: any;
}

export interface SubjectConfig {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  instruction: string;
  color: string;
}
