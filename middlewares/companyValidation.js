const REQUIRED_STRING_FIELDS = {
  // companyCode: 30,
  companyName: 200,
  companyType: 50,
  legalRegisteredName: 200,
  pan: 10,
  country: 60,
  registeredOfficeAddress: null,
  state: 60,
  city: 60,
  pinCode: 10,
};

const OPTIONAL_STRING_FIELDS = {
  description: { maxLength: null },
  website: { maxLength: 255 },
  cinLlpIN: { maxLength: 30 },
  registrationNumber: { maxLength: 50 },
  esiNumber: { maxLength: 30 },
  pfNumber: { maxLength: 30 },
  iec: { maxLength: 20 },
  primaryContactPerson: { maxLength: 100 },
  officialEmail: { maxLength: 150, email: true },
  mobileNumber: { maxLength: 15 },
  financeContact: { maxLength: 100 },
  financeEmail: { maxLength: 150, email: true },
  financeMobile: { maxLength: 15 },
  baseCurrency: { maxLength: 5, nullable: false },
  invoicePrefix: { maxLength: 20 },
  quotationPrefix: { maxLength: 20 },
  purchaseOrderPrefix: { maxLength: 20 },
  defaultPaymentTerms: { maxLength: 60 },
  bankName: { maxLength: 100 },
  accountHolderName: { maxLength: 150 },
  accountNumber: { maxLength: 30 },
  ifscCode: { maxLength: 11 },
  bankAddress: { maxLength: null },
};

const ENUM_FIELDS = {
  status: { values: ["Active", "Inactive"], nullable: false },
};

const UPDATABLE_STRING_FIELDS = {
  companyName: { maxLength: 200, nullable: false },
  companyType: { maxLength: 50, nullable: false },
  description: { maxLength: null },
  website: { maxLength: 255 },
  legalRegisteredName: { maxLength: 200, nullable: false },
  pan: { maxLength: 10, nullable: false },
  cinLlpIN: { maxLength: 30 },
  registrationNumber: { maxLength: 50 },
  esiNumber: { maxLength: 30 },
  pfNumber: { maxLength: 30 },
  iec: { maxLength: 20 },
  country: { maxLength: 60, nullable: false },
  registeredOfficeAddress: { maxLength: null, nullable: false },
  state: { maxLength: 60, nullable: false },
  city: { maxLength: 60, nullable: false },
  pinCode: { maxLength: 10, nullable: false },
  primaryContactPerson: { maxLength: 100 },
  officialEmail: { maxLength: 150, email: true },
  mobileNumber: { maxLength: 15 },
  financeContact: { maxLength: 100 },
  financeEmail: { maxLength: 150, email: true },
  financeMobile: { maxLength: 15 },
  baseCurrency: { maxLength: 5, nullable: false },
  invoicePrefix: { maxLength: 20 },
  quotationPrefix: { maxLength: 20 },
  purchaseOrderPrefix: { maxLength: 20 },
  defaultPaymentTerms: { maxLength: 60 },
  bankName: { maxLength: 100 },
  accountHolderName: { maxLength: 150 },
  accountNumber: { maxLength: 30 },
  ifscCode: { maxLength: 11 },
  bankAddress: { maxLength: null },
  // status: { nullable: false },
};

const DATE_FIELDS = ["dateOfIncorporation", "financialYearStart"];
const COMPANY_UPDATE_FIELDS = [
  ...Object.keys(UPDATABLE_STRING_FIELDS),
  ...DATE_FIELDS,
  "gstRegistrations",
  "documentMetadata",
];

const getCompanyCodePrefix = (companyName) =>
  (companyName.match(/[a-z]/gi) || []).slice(0, 3).join("").toUpperCase();

const addError = (errors, field, message) => {
  errors.push({ field, message });
};

const validateString = (
  value,
  field,
  errors,
  { required = false, nullable = true, maxLength = null } = {}
) => {
  if (value === undefined) {
    if (required) {
      addError(errors, field, `${field} is required.`);
    }
    return;
  }

  if (value === null) {
    if (!nullable) {
      addError(errors, field, `${field} cannot be null.`);
    }
    return;
  }

  if (typeof value !== "string") {
    addError(errors, field, `${field} must be a string.`);
    return;
  }

  if (required && !value.trim()) {
    addError(errors, field, `${field} is required.`);
  }

  if (maxLength !== null && value.length > maxLength) {
    addError(errors, field, `${field} must be at most ${maxLength} characters.`);
  }
};

const validateEnum = (value, field, errors, values, nullable = true) => {
  if (value === undefined || (value === null && nullable)) {
    return;
  }
  if (typeof value !== "string" || !values.includes(value)) {
    addError(errors, field, `${field} must be one of: ${values.join(", ")}.`);
  }
};

const isValidDateOnly = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const parseArrayField = (body, field, errors) => {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    return [];
  }

  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      addError(errors, field, `${field} must be valid JSON.`);
      return [];
    }
  }

  if (!Array.isArray(parsed)) {
    addError(errors, field, `${field} must be an array.`);
    return [];
  }

  return parsed;
};

const getUploadedFiles = (files, field) =>
  Array.isArray(files[field]) ? files[field] : [];

const validateGstAndDocuments = (
  body,
  files,
  errors,
  { requireDocumentFiles = false } = {}
) => {
  const gstRegistrations = parseArrayField(body, "gstRegistrations", errors);
  gstRegistrations.forEach((registration, index) => {
    const prefix = `gstRegistrations[${index}]`;
    if (
      registration === null ||
      typeof registration !== "object" ||
      Array.isArray(registration)
    ) {
      addError(errors, prefix, "Each GST registration must be an object.");
      return;
    }

    validateString(registration.gstin, `${prefix}.gstin`, errors, {
      required: true,
      nullable: false,
      maxLength: 15,
    });
    validateString(registration.state, `${prefix}.state`, errors, {
      required: true,
      nullable: false,
      maxLength: 60,
    });
    validateString(registration.address, `${prefix}.address`, errors);
    validateEnum(
      registration.gstRegistrationStatus,
      `${prefix}.gstRegistrationStatus`,
      errors,
      ["Registered", "Unregistered"]
    );
    validateString(
      registration.gstRegistrationType,
      `${prefix}.gstRegistrationType`,
      errors,
      { maxLength: 100 }
    );
    validateEnum(
      registration.taxCalculationPreference,
      `${prefix}.taxCalculationPreference`,
      errors,
      ["Exclusive", "Inclusive"]
    );
    validateString(
      registration.defaultGstConfiguration,
      `${prefix}.defaultGstConfiguration`,
      errors,
      { maxLength: 60 }
    );
    validateString(
      registration.defaultPlaceOfSupply,
      `${prefix}.defaultPlaceOfSupply`,
      errors,
      { maxLength: 60 }
    );
  });

  const documentMetadata = parseArrayField(body, "documentMetadata", errors);
  documentMetadata.forEach((metadata, index) => {
    const prefix = `documentMetadata[${index}]`;
    if (
      metadata === null ||
      typeof metadata !== "object" ||
      Array.isArray(metadata)
    ) {
      addError(errors, prefix, "Each document metadata entry must be an object.");
      return;
    }

    validateString(metadata.documentName, `${prefix}.documentName`, errors, {
      required: true,
      nullable: false,
      maxLength: 200,
    });
    validateString(metadata.documentKey, `${prefix}.documentKey`, errors, {
      required: true,
      nullable: false,
      maxLength: 100,
    });

    if (
      metadata.isAdditional === null ||
      (metadata.isAdditional !== undefined &&
        typeof metadata.isAdditional !== "boolean" &&
        metadata.isAdditional !== "true" &&
        metadata.isAdditional !== "false")
    ) {
      addError(
        errors,
        `${prefix}.isAdditional`,
        "isAdditional must be a boolean."
      );
    }
  });

  const documentFiles = getUploadedFiles(files || {}, "documents");
  if (
    (documentFiles.length > 0 || requireDocumentFiles) &&
    documentFiles.length !== documentMetadata.length
  ) {
    addError(
      errors,
      "documents",
      "Provide one documentMetadata entry for each uploaded document."
    );
  }

  documentFiles.forEach((file, index) => {
    if (
      !Buffer.isBuffer(file.buffer) ||
      typeof file.mimetype !== "string" ||
      file.mimetype.length > 100
    ) {
      addError(errors, `documents[${index}]`, "The uploaded document is invalid.");
    }
  });

  return { gstRegistrations, documentMetadata, documentFiles };
};

const validateCompanyRequest = (req) => {
  const errors = [];
  const isBodyObject =
    req.body !== null &&
    typeof req.body === "object" &&
    !Array.isArray(req.body);
  const body = isBodyObject ? req.body : {};

  if (!isBodyObject) {
    addError(errors, "body", "Request body must be an object.");
  }

  Object.entries(REQUIRED_STRING_FIELDS).forEach(([field, maxLength]) => {
    validateString(body[field], field, errors, {
      required: true,
      nullable: false,
      maxLength,
    });
  });

  if (
    typeof body.companyName === "string" &&
    !getCompanyCodePrefix(body.companyName)
  ) {
    addError(
      errors,
      "companyName",
      "Company name must contain at least one letter to generate a company code."
    );
  }

  Object.entries(OPTIONAL_STRING_FIELDS).forEach(([field, options]) => {
    validateString(body[field], field, errors, options);
    if (
      options.email &&
      body[field] !== undefined &&
      body[field] !== null &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body[field])
    ) {
      addError(errors, field, `${field} must be a valid email address.`);
    }
  });

  Object.entries(ENUM_FIELDS).forEach(([field, options]) => {
    validateEnum(
      body[field],
      field,
      errors,
      options.values,
      options.nullable
    );
  });

  ["dateOfIncorporation", "financialYearStart"].forEach((field) => {
    const value = body[field];
    if (
      value !== undefined &&
      value !== null &&
      !isValidDateOnly(value)
    ) {
      addError(errors, field, `${field} must be a valid YYYY-MM-DD date.`);
    }
  });

  const logoFiles = getUploadedFiles(req.files || {}, "logo");
  if (logoFiles.length > 1) {
    addError(errors, "logo", "Only one logo file can be uploaded.");
  }

  const logoFile = logoFiles[0];
  if (
    logoFile &&
    (!Buffer.isBuffer(logoFile.buffer) ||
      typeof logoFile.mimetype !== "string" ||
      logoFile.mimetype.length > 100)
  ) {
    addError(errors, "logo", "The uploaded logo file is invalid.");
  }

  const { gstRegistrations, documentMetadata, documentFiles } =
    validateGstAndDocuments(body, req.files, errors);

  return {
    errors,
    body,
    gstRegistrations,
    documentMetadata,
    logoFile,
    documentFiles,
  };
};

const validateCompany = (req, res, next) => {
  const { errors } = validateCompanyRequest(req);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Company details are invalid.",
      errors,
    });
  }

  return next();
};

const validateCompanyUpdateRequest = (req) => {
  const errors = [];
  const isBodyObject =
    req.body !== null &&
    typeof req.body === "object" &&
    !Array.isArray(req.body);
  const body = isBodyObject ? req.body : {};
  const allowedFields = new Set(COMPANY_UPDATE_FIELDS);

  if (!isBodyObject) {
    addError(errors, "body", "Request body must be an object.");
  }

  Object.keys(body).forEach((field) => {
    if (!allowedFields.has(field)) {
      addError(errors, field, `${field} cannot be updated through this endpoint.`);
    }
  });

  Object.entries(UPDATABLE_STRING_FIELDS).forEach(([field, options]) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      validateString(body[field], field, errors, options);
      if (
        options.email &&
        body[field] !== undefined &&
        body[field] !== null &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body[field])
      ) {
        addError(errors, field, `${field} must be a valid email address.`);
      }
    }
  });
  
  Object.entries(ENUM_FIELDS).forEach(([field, options]) => {
    validateEnum(
      body[field],
      field,
      errors,
      options.values,
      options.nullable
    );
  });

  DATE_FIELDS.forEach((field) => {
    if (
      Object.prototype.hasOwnProperty.call(body, field) &&
      body[field] !== null &&
      !isValidDateOnly(body[field])
    ) {
      addError(errors, field, `${field} must be a valid YYYY-MM-DD date.`);
    }
  });

  const logoFiles = getUploadedFiles(req.files || {}, "logo");
  const logoFile = logoFiles[0];
  if (
    logoFile &&
    (!Buffer.isBuffer(logoFile.buffer) ||
      typeof logoFile.mimetype !== "string" ||
      logoFile.mimetype.length > 100)
  ) {
    addError(errors, "logo", "The uploaded logo file is invalid.");
  }

  const hasGstRegistrations = Object.prototype.hasOwnProperty.call(
    body,
    "gstRegistrations"
  );
  const hasDocumentMetadata = Object.prototype.hasOwnProperty.call(
    body,
    "documentMetadata"
  );
  const { gstRegistrations, documentMetadata, documentFiles } =
    validateGstAndDocuments(
      body,
      req.files,
      errors,
      { requireDocumentFiles: hasDocumentMetadata }
    );

  if (Object.keys(body).length === 0 && !logoFile && documentFiles.length === 0) {
    addError(errors, "body", "Provide at least one company field or a logo.");
  }

  return {
    errors,
    body,
    logoFile,
    gstRegistrations: hasGstRegistrations ? gstRegistrations : null,
    documentMetadata: hasDocumentMetadata ? documentMetadata : null,
    documentFiles,
  };
};

const validateCompanyUpdate = (req, res, next) => {
  const { errors } = validateCompanyUpdateRequest(req);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Company update details are invalid.",
      errors,
    });
  }

  return next();
};

module.exports = {
  validateCompany,
  validateCompanyRequest,
  validateCompanyUpdate,
  validateCompanyUpdateRequest,
  getCompanyCodePrefix,
  COMPANY_UPDATE_FIELDS,
};
