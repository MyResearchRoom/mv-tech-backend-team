const { matchedData } = require("express-validator");
const { Op, literal } = require("sequelize");
const prospectService = require("../services/prospectService");
const { validateQueryParams } = require("../utils/validateQueryParams");
const { sequelize, Prospect, ProspectProject, Document, ActivityLog } = require("../models");

const CLEARABLE_PROSPECT_FIELDS = [
  "designation", "alternateContact", "website", "gstin", "pan",
  "registeredAddress", "city", "state", "pinCode", "remarks",
];
const CLEARABLE_PROJECT_FIELDS = [
  "projectName", "projectType", "projectLocation", "projectStatus", "builtUpArea",
  "towers", "floors", "basements", "siteAddress", "expectedTimeline", "fireAuthority", "fireRequirements",
];

const nullifyBlanks = (source = {}, target, keys) => {
  keys.forEach((k) => {
    if (source[k] === "") target[k] = null;
  });
};

exports.createProspect = async (req, res) => {
  try {
    const { project, ...prospect } = matchedData(req, { locations: ["body"] });
    const files = req.files?.drawings || [];

    const prospectId = await prospectService.createProspect(
      { prospect, project, files },
      req.user
    );
    await prospectService.getProspectById(prospectId);

    return res.status(201).json({
      success: true,
      message: "Prospect created successfully",
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "Duplicate record found" });
    }
    console.error("createProspect error:", err);
    return res.status(500).json({ success: false, message: "Failed to create prospect" });
  }
};

exports.getAllProspects = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm, isAll } = validateQueryParams(req.query);
    const { status, prospectType } = req.query;

    const whereClause = { companyId: Number(req.query.companyId) };

    if (searchTerm) {
      const like = `%${searchTerm}%`;
      whereClause[Op.or] = [
        { prospectCode: { [Op.like]: like } },
        { companyName: { [Op.like]: like } },
        { contactPerson: { [Op.like]: like } },
        { mobile: { [Op.like]: like } },
        { email: { [Op.like]: like } },  
        literal(
          `EXISTS (SELECT 1 FROM prospect_projects pp WHERE pp.prospectId = Prospect.id AND pp.projectName LIKE ${Prospect.sequelize.escape(like)})`
        ),
      ];
    }

    if (status && status !== "all") {
      if (!Prospect.rawAttributes.status.values.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status filter." });
      }
      whereClause.status = status;
    }

    if (prospectType && prospectType !== "all") {
      whereClause.prospectType = prospectType;
    }

    const queryOptions = {
      where: whereClause,
      attributes: {
        include: [
          [
            literal(`(SELECT COUNT(*) FROM documents d WHERE d.ownerType = 'prospect' AND d.ownerId = Prospect.id)`),
            "documentsCount",
          ],
        ],
      },
      include: [
        { association: "creator", attributes: ["id", "name"] },
        {
          association: "project",
          required: false,
          attributes: ["id", "projectName", "projectType", "projectLocation", "projectStatus"],
        },
        { association: "convertedClient", attributes: ["id", "clientCode", "name"], required: false },
        { association: "convertedProject", attributes: ["id", "projectCode", "projectName"], required: false },
      ],
      order: [["createdAt", "DESC"]],
      distinct: true, 
    };

    if (!isAll) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const { rows, count } = await Prospect.findAndCountAll(queryOptions);

    return res.status(200).json({
      success: true,
      message: "Prospects fetched successfully.",
      data: rows.map((r) => r.toJSON()),
      pagination: {
        totalRecords: count,
        totalPages: isAll ? 1 : Math.ceil(count / limit),
        currentPage: isAll ? 1 : page,
        itemsPerPage: isAll ? count : limit,
        isAll,
      },
    });
  } catch (error) {
    console.error("Get All Prospects Error:", error);
    return res.status(500).json({ success: false, message: "Failed to get prospects." });
  }
};

exports.getProspectById = async (req, res) => {
  try {
    const prospect = await Prospect.findByPk(req.params.id, {
      include: [
        { association: "creator", attributes: ["id", "name"] },
        { association: "convertor", attributes: ["id", "name"] },
        { association: "project" },
        {
          association: "documents",
          attributes: { exclude: ["document"] }, 
        },
        { association: "activities", separate: true, order: [["createdAt", "DESC"]] },
        { association: "convertedClient", attributes: ["id", "clientCode", "name"] },
        { association: "convertedProject", attributes: ["id", "projectCode", "projectName"] },
      ],
    });

    if (!prospect) {
      return res.status(404).json({ success: false, message: "Prospect not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Prospect fetched successfully.",
      data: prospect,
    });
  } catch (error) {
    console.error("Get Prospect By Id Error:", error);
    return res.status(500).json({ success: false, message: "Failed to get prospect." });
  }
};

exports.updateProspect = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { project, ...prospect } = matchedData(req, { locations: ["body"] });
    // const projectData = project || {};

    nullifyBlanks(req.body, prospect, CLEARABLE_PROSPECT_FIELDS);
    nullifyBlanks(req.body.project, projectData, CLEARABLE_PROJECT_FIELDS);

    await prospectService.updateProspect(
      id,
      { prospect, project: projectData, files: req.files?.drawings || [] },
      req.user
    );

  //  await prospectService.getProspectById(id);

    return res.status(200).json({
      success: true,
      message: "Prospect updated successfully.",
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "Duplicate record found." });
    }
    console.error("Update Prospect Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update prospect." });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findOne({
      where: { id: req.params.id, ownerType: "prospect" },
      include: [{ association: "uploader", attributes: ["id", "name"] }],
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    const data = doc.toJSON();

    data.document = data.document
      ? `data:${data.documentContentType || "application/octet-stream"};base64,${data.document.toString("base64")}`
      : null;

    return res.status(200).json({
      success: true,
      message: "Document fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("Get Document By Id Error:", error);
    return res.status(500).json({ success: false, message: "Failed to get document." });
  }
};

exports.getDocumentsByOwner = async (req, res) => {
  try {
    const { page, limit, offset, isAll, searchTerm = "" } = validateQueryParams(req.query);
    const { rows, count } = await prospectService.getDocumentsByOwner(
      Number(req.query.ownerId),
      req.query.ownerType,
      { limit, offset, isAll,searchTerm: searchTerm.trim(), }
    );
    return res.status(200).json({
      success: true,
      message: "Documents fetched successfully.",
      data: rows.map((document) => document.toJSON()),
      pagination: {
        totalRecords: count,
        totalPages: isAll ? 1 : Math.ceil(count / limit),
        currentPage: isAll ? 1 : page,
        itemsPerPage: isAll ? count : limit,
        isAll,
      },
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Get Documents By Owner Error:", error);
    return res.status(500).json({ success: false, message: "Failed to get documents." });
  }
};

exports.uploadProspectDrawings = async (req, res) => {
  try {
    const files = req.files?.drawings || [];
    if (!files.length) {
      return res.status(400).json({ success: false, message: "Upload at least one drawing." });
    }

    const documents = await prospectService.uploadProspectDrawings(
      Number(req.params.id),
      files,
      req.user
    );
    return res.status(201).json({
      success: true,
      message: "Drawing documents uploaded successfully.",
      data: documents.map((document) => {
        const data = document.toJSON();
        delete data.document;
        return data;
      }),
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Upload Prospect Drawings Error:", error);
    return res.status(500).json({ success: false, message: "Failed to upload drawing documents." });
  }
};

exports.deleteDocumentById = async (req, res) => {
  try {
    await sequelize.transaction(async (t) => {
      // BLOB excluded: we only need the row's details to delete it
      const doc = await Document.findOne({
        where: { id: req.params.id, ownerType: "prospect" },
        attributes: { exclude: ["document"] },
        transaction: t,
      });
      if (!doc) throw prospectService.httpError(404, "Document not found.");

      const prospect = await Prospect.findByPk(doc.ownerId, {
        attributes: ["id", "status", "convertedClientId"],
        transaction: t,
      });
      if (prospect && (prospect.status === "CONVERTED" || prospect.convertedClientId)) {
        throw prospectService.httpError(409, "A converted prospect is read-only. Its documents cannot be deleted.");
      }

      await doc.destroy({ transaction: t });

      await ActivityLog.create(
        {
          entityType: "prospect",
          entityId: doc.ownerId,
          action: "DOCUMENT_DELETED",
          details: `Document deleted: ${doc.fileName} (v${doc.version})`.slice(0, 500),
        },
        { transaction: t }
      );
    });

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Delete Document Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete document." });
  }
}

exports.deleteProspect = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const deletedCode = await sequelize.transaction(async (t) => {
      const prospect = await Prospect.findByPk(id, {
        attributes: ["id", "prospectCode", "status", "convertedClientId", "convertedProjectId"],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!prospect) throw prospectService.httpError(404, "Prospect not found.");

      if (prospect.status === "CONVERTED" || prospect.convertedClientId || prospect.convertedProjectId) {
        throw prospectService.httpError(409, "A converted prospect cannot be deleted.");
      }

      await Document.destroy({ where: { ownerType: "prospect", ownerId: id }, transaction: t });
      await ActivityLog.destroy({ where: { entityType: "prospect", entityId: id }, transaction: t });

      await ProspectProject.destroy({ where: { prospectId: id }, transaction: t });
      await prospect.destroy({ transaction: t });

      return prospect.prospectCode;
    });

    return res.status(200).json({
      success: true,
      message: `Prospect ${deletedCode} deleted successfully.`,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Delete Prospect Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete prospect." });
  }
};