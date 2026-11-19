exports.parsePositiveInteger = (value, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (!/^[1-9]\d*$/.test(String(value))) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
};
