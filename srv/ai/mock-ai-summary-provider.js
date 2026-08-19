const normalizeText = (value) => value.replace(/\s+/g, " ").trim();

const shorten = (value, maxLength) =>
  value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 1).trimEnd()}…`;

module.exports = {
  name: "mock",

  async generateSummary({ title, description, requestType, priority }) {
    const normalizedTitle = normalizeText(title);
    const normalizedDescription = shorten(
      normalizeText(description),
      400,
    );

    const context = [
      requestType && `type ${requestType}`,
      priority && `priority ${priority}`,
    ].filter(Boolean);

    return {
      summary: `${normalizedTitle}: ${normalizedDescription}${
        context.length > 0 ? ` (${context.join(", ")})` : ""
      }`,
      provider: this.name,
    };
  },
};