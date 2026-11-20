const { Op } = require("sequelize");
const {
  sequelize, Prospect, ProspectProject, Document, ActivityLog,
} = require("../models");

const PREFIX = "PROS-MVT";

const nextProspectCode = async (t) => {
  const last = await Prospect.findOne({
    attributes: ["prospectCode"],
    where: {
      prospectCode: {
        [Op.like]: `${PREFIX}-%`,
      },
    },
    order: [
      [
        sequelize.literal(
          "CAST(SUBSTRING_INDEX(prospectCode, '-', -1) AS UNSIGNED)"
        ),
        "DESC",
      ],
    ],
    transaction: t,
    lock: t ? t.LOCK.UPDATE : undefined,
  });

  const lastNumber = last
    ? parseInt(last.prospectCode.split("-").pop(), 10)
    : 0;

  return `${PREFIX}-${String(lastNumber + 1).padStart(3, "0")}`;
};

const httpError = (status, message) => Object.assign(new Error(message), { status });


const createInTransaction = ({ prospect, project, files }, user) =>
  sequelize.transaction(async (t) => {
    const prospectCode = await nextProspectCode(t);

    const created = await Prospect.create(
      { ...prospect, prospectCode, status: "PROSPECT_CREATED", createdBy: user.id },
      { transaction: t }
    );

    if (project && Object.keys(project).length) {
      await ProspectProject.create({ ...project, prospectId: created.id }, { transaction: t });
    }

    const versionByName = {};
    for (const file of files) {
      versionByName[file.originalname] = (versionByName[file.originalname] || 0) + 1;

      await Document.create(
        {
          ownerType: "prospect",
          ownerId: created.id,
          category: "Drawing",
          fileName: file.originalname,
          version: versionByName[file.originalname],
          document: file.buffer,
          documentContentType: file.mimetype,
          uploadedBy: user.id,
        },
        { transaction: t }
      );
    }

    await ActivityLog.create(
      {
        entityType: "prospect",
        entityId: created.id,
        action: "CREATED",
        details: files.length ? `Prospect created with ${files.length} document(s)` : "Prospect created",
      },
      { transaction: t }
    );

    return created.id;
  });

const isCodeCollision = (err) => err.name === "SequelizeUniqueConstraintError" &&
  Object.keys(err.fields || {}).some((k) => k.includes("prospectCode"));

exports.createProspect = async ({ prospect, project, files = [] }, user) => {
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; ; attempt++) {
    try {
      return await createInTransaction({ prospect, project, files }, user);
    } catch (err) {
      if (!isCodeCollision(err) || attempt === MAX_ATTEMPTS) throw err;
    }
  }
};

exports.getProspectById = (id) =>
    Prospect.findByPk(id, {
        include: [
        { association: "creator", attributes: ["id", "name"] },
        { association: "project" },
        {
            association: "documents",
            attributes: { exclude: ["document"] },
        },
        ],
    });

exports.getDocumentsByOwner = (
  ownerId,
  ownerType,
  { limit, offset, isAll, searchTerm }
) => {
  const queryOptions = {
    where: {
      ownerType,
      ownerId,
    },
    attributes: {
      exclude: ["document"],
    },
    include: [
      {
        association: "uploader",
        attributes: ["id", "name"],
      
      },
    ],
    order: [["createdAt", "DESC"]],
    distinct: true,
  };

  if (searchTerm) {
    queryOptions.where[Op.or] = [
      { category: { [Op.like]: `%${searchTerm}%` } },
      { fileName: { [Op.like]: `%${searchTerm}%` } },
      { remarks: { [Op.like]: `%${searchTerm}%` } },
      
    ];
  }

  if (!isAll) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  return Document.findAndCountAll(queryOptions);
};

exports.uploadProspectDrawings = async (id, files, user) =>
  sequelize.transaction(async (t) => {
    const prospect = await Prospect.findByPk(id, {
      attributes: ["id", "status", "convertedClientId"],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!prospect) throw httpError(404, "Prospect not found.");
    if (prospect.status === "CONVERTED" || prospect.convertedClientId) {
      throw httpError(409, "A converted prospect is read-only. Its documents cannot be uploaded.");
    }

    const existingDocuments = await Document.findAll({
      where: { ownerType: "prospect", ownerId: id },
      attributes: ["fileName", "version"],
      transaction: t,
    });
    const latestVersionByName = new Map();
    for (const document of existingDocuments) {
      latestVersionByName.set(
        document.fileName,
        Math.max(latestVersionByName.get(document.fileName) || 0, document.version)
      );
    }

    const createdDocuments = [];
    for (const file of files) {
      const version = (latestVersionByName.get(file.originalname) || 0) + 1;
      latestVersionByName.set(file.originalname, version);

      createdDocuments.push(await Document.create(
        {
          ownerType: "prospect",
          ownerId: id,
          category: "Drawing",
          fileName: file.originalname,
          version,
          document: file.buffer,
          documentContentType: file.mimetype,
          uploadedBy: user.id,
        },
        { transaction: t }
      ));
    }

    if (files.length) {
      prospect.status = "DRAWINGS_UPLODED";
      await prospect.save({ transaction: t });
    }

    await ActivityLog.create(
      {
        entityType: "prospect",
        entityId: id,
        action: "DOCUMENT_UPLOADED",
        details: `${files.length} drawing document(s) uploaded`,
      },
      { transaction: t }
    );

    return createdDocuments;
  });


exports.updateProspect = async (id, { prospect, project = {}, files = [] }, user) =>
  sequelize.transaction(async (t) => {
    const record = await Prospect.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!record) throw httpError(404, "Prospect not found");
    if (record.status === "CONVERTED" || record.convertedClientId) {
      throw httpError(409, "A converted prospect is read-only and cannot be edited");
    }

    const changes = [];

    record.set(prospect);
    changes.push(...(record.changed() || []));
    await record.save({ transaction: t });

    

    if (Object.keys(project).length) {
      const existing = await ProspectProject.findOne({ where: { prospectId: id }, transaction: t });
      if (existing) {
        existing.set(project);
        changes.push(...(existing.changed() || []).map((f) => `project.${f}`));
        await existing.save({ transaction: t });
      } else if (Object.values(project).some((v) => v !== null)) {
        await ProspectProject.create({ ...project, prospectId: id }, { transaction: t });
        changes.push("project added");
      }
    }

    if (files.length) {

      const versionByName = {};
      for (const file of files) {
        versionByName[file.originalname] = (versionByName[file.originalname] || 0) + 1;

        await Document.create(
          {
            ownerType: "prospect",
            ownerId: id,
            category: "Drawing",
            fileName: file.originalname,
            version: versionByName[file.originalname],   
            document: file.buffer,
            documentContentType: file.mimetype,
            uploadedBy: user.id,
          },
          { transaction: t }
        );
      }
    }

    const parts = [];
    if (changes.length) parts.push(`Updated: ${changes.join(", ")}`);
    if (files.length) parts.push(`documents ${files.length} added)`);

    if (parts.length) {
      await ActivityLog.create(
        {
          entityType: "prospect",
          entityId: id,
          action: "UPDATED",
          details: parts.join("; ").slice(0, 500),
        },
        { transaction: t }
      );
    }

    return id;
  });

exports.httpError = httpError;