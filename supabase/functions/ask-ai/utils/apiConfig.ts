
import { safeParseJson } from "./parse.ts";

export function getApiConfig(settings: any, adminSettingMap: any, userId: string) {
  let freeUserApiKeys = adminSettingMap['free_user_api_keys'] || {};
  let freeUserModels = adminSettingMap['free_user_models'] || {};
  
  freeUserApiKeys = safeParseJson(freeUserApiKeys, {});
  freeUserModels = safeParseJson(freeUserModels, {});

  let apiKeys = settings?.api_keys || {};
  let models = settings?.models || {};
  let selectedProvider = settings?.selected_provider || "openai";
  let usedFreeApi = false;

  let anyUserKeySet =
    (apiKeys.openai && apiKeys.openai.trim() !== "") ||
    (apiKeys.google && apiKeys.google.trim() !== "") ||
    (apiKeys.anthropic && apiKeys.anthropic.trim() !== "");

  if (!anyUserKeySet) {
    apiKeys = {
      openai: freeUserApiKeys.openai || "",
      google: freeUserApiKeys.google || "",
      anthropic: freeUserApiKeys.anthropic || "",
    };
    models = {
      openai: freeUserModels.openai || "gpt-4o",
      google: freeUserModels.google || "gemini-1.5-pro",
      anthropic: freeUserModels.anthropic || "claude-3-sonnet",
    };
    usedFreeApi = true;
  }

  console.log("getApiConfig result", { 
    apiKeys, 
    models, 
    selectedProvider, 
    usedFreeApi, 
    rawAdminSettingMap: adminSettingMap,
    rawFreeUserApiKeys: adminSettingMap['free_user_api_keys']
  });

  return { apiKeys, models, selectedProvider, usedFreeApi };
}
