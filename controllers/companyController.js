const {
  Company,
  CompanyDocument,
  CompanyGstRegistration,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

const {
  COMPANY_UPDATE_FIELDS,
  getCompanyCodePrefix,
  validateCompanyRequest,
  validateCompanyUpdateRequest,
} = require("../middlewares/companyValidation");
const { toDataUrl } = require("../utils/getBase64File");
const { validateQueryParams } = require("../utils/validateQueryParams");
const { parsePositiveInteger } = require("../utils/getPositiveInteger");

const generateCompanyCode = async (companyName, transaction) => {
  const prefix = getCompanyCodePrefix(companyName);
  const existingCompanies = await Company.findAll({
    attributes: ["companyCode"],
    where: {
      companyCode: {
        [Op.like]: `${prefix}-%`,
      },
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const sequencePattern = new RegExp(`^${prefix}-(\\d+)$`);
  const highestSequence = existingCompanies.reduce((highest, company) => {
    const match = sequencePattern.exec(company.companyCode.toUpperCase());
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `${prefix}-${String(highestSequence + 1).padStart(3, "0")}`;
};

exports.addCompany = async (req, res) => {
  const validation = validateCompanyRequest(req);
  if (validation.errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Company details are invalid.",
      errors: validation.errors,
    });
  }

  const {
    body,
    gstRegistrations,
    documentMetadata,
    logoFile,
    documentFiles,
  } = validation;

  try {
    const company = await sequelize.transaction(async (transaction) => {
      const companyCode = await generateCompanyCode(
        body.companyName,
        transaction
      );
      const createdCompany = await Company.create(
        {
          companyCode,
          companyName: body.companyName.trim(),
          companyType: body.companyType.trim(),
          status: body.status,
          description: body.description,
          website: body.website,
          logo: logoFile ? logoFile.buffer : null,
          logoContentType: logoFile ? logoFile.mimetype : null,
          legalRegisteredName: body.legalRegisteredName.trim(),
          pan: body.pan.trim(),
          cinLlpIN: body.cinLlpIN,
          registrationNumber: body.registrationNumber,
          esiNumber: body.esiNumber,
          pfNumber: body.pfNumber,
          iec: body.iec,
          dateOfIncorporation: body.dateOfIncorporation,
          country: body.country.trim(),
          registeredOfficeAddress: body.registeredOfficeAddress.trim(),
          state: body.state.trim(),
          city: body.city.trim(),
          pinCode: body.pinCode.trim(),
          primaryContactPerson: body.primaryContactPerson,
          officialEmail: body.officialEmail,
          mobileNumber: body.mobileNumber,
          financeContact: body.financeContact,
          financeEmail: body.financeEmail,
          financeMobile: body.financeMobile,
          financialYearStart: body.financialYearStart,
          baseCurrency: body.baseCurrency,
          invoicePrefix: body.invoicePrefix,
          quotationPrefix: body.quotationPrefix,
          purchaseOrderPrefix: body.purchaseOrderPrefix,
          defaultPaymentTerms: body.defaultPaymentTerms,
          bankName: body.bankName,
          accountHolderName: body.accountHolderName,
          accountNumber: body.accountNumber,
          ifscCode: body.ifscCode,
          bankAddress: body.bankAddress,
        },
        { transaction }
      );

      if (gstRegistrations.length > 0) {
        await CompanyGstRegistration.bulkCreate(
          gstRegistrations.map((registration) => ({
            companyId: createdCompany.id,
            gstin: registration.gstin.trim(),
            state: registration.state.trim(),
            address: registration.address,
            gstRegistrationStatus: registration.gstRegistrationStatus,
            gstRegistrationType: registration.gstRegistrationType,
            taxCalculationPreference: registration.taxCalculationPreference,
            defaultGstConfiguration: registration.defaultGstConfiguration,
            defaultPlaceOfSupply: registration.defaultPlaceOfSupply,
          })),
          { transaction }
        );
      }

      if (documentMetadata.length > 0) {
        await CompanyDocument.bulkCreate(
          documentMetadata.map((metadata, index) => ({
            companyId: createdCompany.id,
            documentName: metadata.documentName.trim(),
            documentKey: metadata.documentKey.trim(),
            isAdditional: metadata.isAdditional === undefined
              ? false
              : metadata.isAdditional === true ||
                metadata.isAdditional === "true",
            document: documentFiles[index]
              ? documentFiles[index].buffer
              : null,
            documentContentType: documentFiles[index]
              ? documentFiles[index].mimetype
              : null,
          })),
          { transaction }
        );
      }

      return createdCompany;
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully.",
      data: {
        id: company.id,
        companyCode: company.companyCode,
        companyName: company.companyName,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message:
          "A company, GSTIN, or PAN with these values already exists.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Company details are invalid.",
        errors: error.errors.map(
          (validationError) => validationError.message
        ),
      });
    }

    console.error("Add Company Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create company.",
    });
  }
};

exports.getAllCompanies = async (req, res) => {
    try {
        const {
            page,
            limit,
            offset,
            searchTerm,
            isAll
        } = validateQueryParams(req.query);

        const { companyType, status } = req.query;

        const whereClause = {};

        if (searchTerm) {
            whereClause[Op.or] = [
                { companyName: { [Op.like]: `%${searchTerm}%` } },
                { companyCode: { [Op.like]: `%${searchTerm}%` } },
                { legalRegisteredName: { [Op.like]: `%${searchTerm}%` } },
                { officialEmail: { [Op.like]: `%${searchTerm}%` } },
                { mobileNumber: { [Op.like]: `%${searchTerm}%` } },
                { pan: { [Op.like]: `%${searchTerm}%` } }
            ];
        }

        if (companyType && companyType !== "all") {
            whereClause.companyType = companyType;
        }

        if (status && status !== "all") {
            if (!["Active", "Inactive"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Status must be Active, Inactive, or all."
                });
            }

            whereClause.status = status;
        }

        const queryOptions = {
            where: whereClause,
            order: [["createdAt", "DESC"]]
        };

        if (!isAll) {
            queryOptions.limit = limit;
            queryOptions.offset = offset;
        }

        const { rows, count } = await Company.findAndCountAll(queryOptions);

        const companies = rows.map((company) => {
            const data = company.toJSON();

            data.logo = data.logo
                ? toDataUrl(data.logo, data.logoContentType)
                : null;

            return data;
        });

        return res.status(200).json({
            success: true,
            message: "Companies fetched successfully.",
            data: companies,
            pagination: {
                totalRecords: count,
                totalPages: isAll ? (count > 0 ? 1 : 0) : Math.ceil(count / limit),
                currentPage: isAll ? 1 : page,
                itemsPerPage: isAll ? count : limit,
                isAll
            }
        });

    } catch (error) {
        console.error("Get All Companies Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get companies."
        });
    }
};

exports.getCompanyById = async (req, res) => {
  const companyId = parsePositiveInteger(req.params.id, null);
  if (companyId === null) {
    return res.status(400).json({
      success: false,
      message: "Company ID must be a positive integer.",
    });
  }

  try {
    const company = await Company.findByPk(companyId, {
      include: [
        {
          model: CompanyGstRegistration,
          as: "gstRegistrations",
        },
        {
          model: CompanyDocument,
          as: "documents",
        },
      ],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    const data = company.toJSON();
    data.logo = toDataUrl(data.logo, data.logoContentType);
    data.documents = data.documents.map((document) => ({
      ...document,
      document: toDataUrl(document.document, document.documentContentType),
    }));

    return res.status(200).json({
      success: true,
      message: "Company details fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get Company By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get company details.",
    });
  }
};

exports.updateCompany = async (req, res) => {
  const companyId = parsePositiveInteger(req.params.id, null);
  if (companyId === null) {
    return res.status(400).json({
      success: false,
      message: "Company ID must be a positive integer.",
    });
  }

  const validation = validateCompanyUpdateRequest(req);
  if (validation.errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Company update details are invalid.",
      errors: validation.errors,
    });
  }

  try {
    const updated = await sequelize.transaction(async (transaction) => {
      const company = await Company.findByPk(companyId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!company) {
        return false;
      }

      const updates = {};
      COMPANY_UPDATE_FIELDS.forEach((field) => {
        if (
          field !== "gstRegistrations" &&
          field !== "documentMetadata" &&
          Object.prototype.hasOwnProperty.call(validation.body, field)
        ) {
          const value = validation.body[field];
          updates[field] = typeof value === "string" ? value.trim() : value;
        }
      });

      if (validation.logoFile) {
        updates.logo = validation.logoFile.buffer;
        updates.logoContentType = validation.logoFile.mimetype;
      }

      await company.update(updates, { transaction });

      if (validation.gstRegistrations !== null) {
        await CompanyGstRegistration.destroy({
          where: { companyId },
          transaction,
        });
        if (validation.gstRegistrations.length > 0) {
          await CompanyGstRegistration.bulkCreate(
            validation.gstRegistrations.map((registration) => ({
              companyId,
              gstin: registration.gstin.trim(),
              state: registration.state.trim(),
              address: registration.address,
              gstRegistrationStatus: registration.gstRegistrationStatus,
              gstRegistrationType: registration.gstRegistrationType,
              taxCalculationPreference: registration.taxCalculationPreference,
              defaultGstConfiguration:
                registration.defaultGstConfiguration,
              defaultPlaceOfSupply: registration.defaultPlaceOfSupply,
            })),
            { transaction }
          );
        }
      }

      if (validation.documentMetadata !== null) {
        await CompanyDocument.destroy({
          where: { companyId },
          transaction,
        });
        if (validation.documentMetadata.length > 0) {
          await CompanyDocument.bulkCreate(
            validation.documentMetadata.map((metadata, index) => ({
              companyId,
              documentName: metadata.documentName.trim(),
              documentKey: metadata.documentKey.trim(),
              isAdditional:
                metadata.isAdditional === undefined
                  ? false
                  : metadata.isAdditional === true ||
                    metadata.isAdditional === "true",
              document: validation.documentFiles[index].buffer,
              documentContentType: validation.documentFiles[index].mimetype,
            })),
            { transaction }
          );
        }
      }

      return true;
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    const company = await Company.findByPk(companyId, {
      include: [
        { model: CompanyGstRegistration, as: "gstRegistrations" },
        { model: CompanyDocument, as: "documents" },
      ],
    });
    const data = company.toJSON();
    data.logo = toDataUrl(data.logo, data.logoContentType);
    data.documents = data.documents.map((document) => ({
      ...document,
      document: toDataUrl(document.document, document.documentContentType),
    }));

    return res.status(200).json({
      success: true,
      message: "Company updated successfully.",
      data,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "A company, GSTIN, or PAN with these values already exists.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Company update details are invalid.",
        errors: error.errors.map(
          (validationError) => validationError.message
        ),
      });
    }

    console.error("Update Company Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update company.",
    });
  }
};

exports.toggleCompanyStatus = async (req, res) => {
  const companyId = parsePositiveInteger(req.params.id, null);
  if (companyId === null) {
    return res.status(400).json({
      success: false,
      message: "Company ID must be a positive integer.",
    });
  }

  try {
    const company = await sequelize.transaction(async (transaction) => {
      const currentCompany = await Company.findByPk(companyId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!currentCompany) {
        return null;
      }

      currentCompany.status =
        currentCompany.status === "Active" ? "Inactive" : "Active";
      await currentCompany.save({ transaction });
      return currentCompany;
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company status updated successfully.",
      data: {
        id: company.id,
        status: company.status,
      },
    });
  } catch (error) {
    console.error("Toggle Company Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change company status.",
    });
  }
};

exports.deleteCompany = async (req, res) => {
  const companyId = parsePositiveInteger(req.params.id, null);
  if (companyId === null) {
    return res.status(400).json({
      success: false,
      message: "Company ID must be a positive integer.",
    });
  }

  try {
    const deletedCompanyId = await sequelize.transaction(async (transaction) => {
      const company = await Company.findByPk(companyId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!company) {
        return null;
      }

      await company.destroy({ transaction });
      return company.id;
    });

    if (deletedCompanyId === null) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Company Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete company.",
    });
  }
};
