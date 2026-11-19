exports.toDataUrl = (value, contentType) =>
  value
    ? `data:${contentType || "application/octet-stream"};base64,${Buffer.from(
        value
      ).toString("base64")}`
    : null;