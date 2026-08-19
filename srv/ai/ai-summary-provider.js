const mockProvider = require("./mock-ai-summary-provider");
const geminiProvider = require("./gemini-ai-summary-provider");

const providers = {
  mock: mockProvider,
  gemini: geminiProvider,
};

const getAiSummaryProvider = () => {
  const runningInCloudFoundry = Boolean(process.env.VCAP_APPLICATION);
  const defaultProvider = runningInCloudFoundry ? "disabled" : "mock";

  const providerName =
    process.env.AI_SUMMARY_PROVIDER || defaultProvider;

  const provider = providers[providerName];

  if (!provider) {
    const error = new Error(
      `AI summary provider '${providerName}' is not configured.`,
    );

    error.code = "AI_SUMMARY_PROVIDER_NOT_CONFIGURED";
    throw error;
  }

  return provider;
};

module.exports = {
  getAiSummaryProvider,
};