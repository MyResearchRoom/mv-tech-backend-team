const { Op, QueryTypes, literal } = require("sequelize");
const { matchedData } = require("express-validator");
const { sequelize, InventoryItem, InventryStockEntry } = require("../models");
const { validateQueryParams } = require("../utils/validateQueryParams");

const INVENTORY_ITEM_UPDATE_FIELDS = [
  "name",
  "company",
  "unit",
  "hsnCode",
  "category",
  "itemGroup",
  "itemType",
  "barcode",
  "rackBox",
  "price",
  "reorderLevel",
];

const LATEST_STOCK_ENTRY_CONDITION = `
  NOT EXISTS (
    SELECT 1
    FROM inventry_stock_entries AS newer
    WHERE newer.itemId = stock.itemId
      AND (
        newer.createdAt > stock.createdAt
        OR (newer.createdAt = stock.createdAt AND newer.id > stock.id)
      )
  )
`;

const INVENTORY_STOCK_STATUS_FILTERS = {
  lowStock: literal(
    "`InventoryItem`.`currentStock` > 0 AND `InventoryItem`.`currentStock` <= `InventoryItem`.`reorderLevel`"
  ),
  inStock: literal(
    "`InventoryItem`.`currentStock` > `InventoryItem`.`reorderLevel`"
  ),
  outOfStock: literal("`InventoryItem`.`currentStock` <= 0"),
};

const getInventoryStockStatus = (item) => {
  const currentStock = Number(item.currentStock);
  const reorderLevel = Number(item.reorderLevel);

  if (currentStock <= 0) return "outOfStock";
  if (currentStock <= reorderLevel) return "lowStock";
  return "inStock";
};

const generateInventoryItemCode = async (transaction) => {
  const existingItems = await InventoryItem.findAll({
    attributes: ["itemCode"],
    where: {
      itemCode: {
        [Op.like]: "ITEM-%",
      },
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const highestSequence = existingItems.reduce((highest, item) => {
    const match = /^ITEM-(\d+)$/i.exec(item.itemCode);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `ITEM-${String(highestSequence + 1).padStart(5, "0")}`;
};

const generateStockEntryNo = async (transaction) => {
  const existingEntries = await InventryStockEntry.findAll({
    attributes: ["entryNo"],
    where: {
      entryNo: {
        [Op.like]: "STK-IN-%",
      },
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const highestSequence = existingEntries.reduce((highest, entry) => {
    const match = /^STK-IN-(\d+)$/i.exec(entry.entryNo);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `STK-IN-${String(highestSequence + 1).padStart(5, "0")}`;
};

exports.addInventoryItem = async (req, res) => {
  try {
    const {
      name,
      hsnCode,
      category,
      itemGroup,
      itemType,
      barcode,
      rackBox,
      company,
      unit,
      price,
      reorderLevel,
    } = req.body;

    const item = await sequelize.transaction(async (transaction) => {
      const itemCode = await generateInventoryItemCode(transaction);
      return InventoryItem.create(
        {
          itemCode,
          name,
          hsnCode,
          category,
          itemGroup,
          itemType,
          barcode,
          rackBox,
          company,
          unit,
          price,
          reorderLevel,
          createdBy: req.user.id,
        },
        { transaction }
      );
    });

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully.",
      data: item,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Inventory item code conflict. Please retry.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Inventory item details are invalid.",
        errors: error.errors.map((validationError) => validationError.message),
      });
    }

    console.error("Add Inventory Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create inventory item.",
    });
  }
};

exports.getAllInventoryItems = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm, isAll } = validateQueryParams(req.query);
    const where = {};

    if (searchTerm) {
      const like = `%${searchTerm}%`;
      where[Op.or] = [
        { itemCode: { [Op.like]: like } },
        { name: { [Op.like]: like } },
        { hsnCode: { [Op.like]: like } },
        { category: { [Op.like]: like } },
        { itemGroup: { [Op.like]: like } },
        { itemType: { [Op.like]: like } },
        { barcode: { [Op.like]: like } },
        { company: { [Op.like]: like } },
        { price: { [Op.like]: like } },
      ];
    }

    if (req.query.active !== undefined) {
      where.active = req.query.active === "true";
    }

    if (req.query.company) {
      where.company = req.query.company;
    }

    if (req.query.stockStatus) {
      where[Op.and] = INVENTORY_STOCK_STATUS_FILTERS[req.query.stockStatus];
    }

    const queryOptions = {
      where,
      include: [
        {
          association: "createdByUser",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    if (!isAll) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const { rows, count } = await InventoryItem.findAndCountAll(queryOptions);

    return res.status(200).json({
      success: true,
      message: "Inventory items fetched successfully.",
      data: rows.map((item) => ({
        ...item.toJSON(),
        stockStatus: getInventoryStockStatus(item),
      })),
      pagination: {
        totalRecords: count,
        totalPages: isAll ? (count > 0 ? 1 : 0) : Math.ceil(count / limit),
        currentPage: isAll ? 1 : page,
        itemsPerPage: isAll ? count : limit,
        isAll,
      },
    });
  } catch (error) {
    console.error("Get All Inventory Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get inventory items.",
    });
  }
};

exports.getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id, {
      include: [
        {
          association: "createdByUser",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
    });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inventory item fetched successfully.",
      data: item,
    });
  } catch (error) {
    console.error("Get Inventory Item By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get inventory item.",
    });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    const updates = matchedData(req, { locations: ["body"] });
    INVENTORY_ITEM_UPDATE_FIELDS.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        item[field] = updates[field];
      }
    });
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Inventory item updated successfully.",
      data: item,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Inventory item details are invalid.",
        errors: error.errors.map((validationError) => validationError.message),
      });
    }

    console.error("Update Inventory Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update inventory item.",
    });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    await item.destroy();
    return res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully.",
    });
  } catch (error) {
    if (
      error.name === "SequelizeForeignKeyConstraintError" ||
      error.parent?.code === "ER_ROW_IS_REFERENCED_2"
    ) {
      return res.status(409).json({
        success: false,
        message: "Inventory item cannot be deleted because it has stock entries.",
      });
    }

    console.error("Delete Inventory Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory item.",
    });
  }
};

exports.addInventoryStock = async (req, res) => {
  const {
    itemId,
    entryDate,
    quantity,
    rate = 0,
    supplierName,
    remarks,
  } = matchedData(req, { locations: ["body"] });

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const item = await InventoryItem.findByPk(itemId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!item) {
        return null;
      }

      if (!item.active) {
        const error = new Error("Cannot add stock to an inactive inventory item.");
        error.status = 409;
        throw error;
      }

      const entryNo = await generateStockEntryNo(transaction);
      const updatedStock = Number(item.currentStock) + quantity;
      if (updatedStock > 99999999.99) {
        const error = new Error("The stock quantity exceeds the maximum supported for this item.");
        error.status = 400;
        throw error;
      }

      const stockEntry = await InventryStockEntry.create(
        {
          entryNo,
          itemId,
          entryDate,
          quantity,
          rate,
          amount: Number((quantity * rate).toFixed(2)),
          supplierName,
          remarks,
          createdBy: req.user.id,
        },
        { transaction }
      );

      item.currentStock = updatedStock.toFixed(2);
      await item.save({ transaction });

      return { stockEntry, currentStock: item.currentStock };
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Inventory stock added successfully.",
      data: result.stockEntry,
      currentStock: result.currentStock,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Stock entry number conflict. Please retry.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Inventory stock details are invalid.",
        errors: error.errors.map((validationError) => validationError.message),
      });
    }

    console.error("Add Inventory Stock Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add inventory stock.",
    });
  }
};

exports.changeInventoryItemStatus = async (req, res) => {
  try {
    const item = await sequelize.transaction(async (transaction) => {
      const inventoryItem = await InventoryItem.findByPk(req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!inventoryItem) {
        return null;
      }


      inventoryItem.active = !inventoryItem.active;

      await inventoryItem.save({ transaction });

      return inventoryItem;
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Inventory item ${
        item.active ? "activated" : "deactivated"
      } successfully.`,
     
    });
  } catch (error) {
    console.error("Change Inventory Item Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change inventory item status.",
    });
  }
};

exports.getLatestInventoryStock = async (req, res) => {
  try {
    const { page, limit, offset, isAll, searchTerm } = validateQueryParams(req.query);
    const paginationSql = isAll ? "" : " LIMIT :limit OFFSET :offset";
    const replacements = isAll ? {} : { limit, offset };
    const filters = [];

    if (searchTerm) {
      filters.push(`(
        stock.entryNo LIKE :searchTerm
        OR stock.supplierName LIKE :searchTerm
        OR CAST(creator.id AS CHAR) LIKE :searchTerm
        OR creator.name LIKE :searchTerm
        OR creator.email LIKE :searchTerm
        OR item.itemCode LIKE :searchTerm
        OR item.name LIKE :searchTerm
        OR item.unit LIKE :searchTerm
        OR CAST(item.price AS CHAR) LIKE :searchTerm
        OR CAST(item.currentStock AS CHAR) LIKE :searchTerm
      )`);
      replacements.searchTerm = `%${searchTerm}%`;
    }

    if (req.query.entryDate) {
      filters.push("stock.entryDate = :entryDate");
      replacements.entryDate = req.query.entryDate;
    }

    const joins = `
      LEFT JOIN inventory_items AS item ON item.id = stock.itemId
      LEFT JOIN users AS creator ON creator.id = stock.createdBy
    `;
    const filterSql = filters.length ? ` AND ${filters.join(" AND ")}` : "";
    const [countRows, latestRows] = await Promise.all([
      sequelize.query(
        `SELECT COUNT(*) AS totalRecords
         FROM inventry_stock_entries AS stock
         ${joins}
         WHERE ${LATEST_STOCK_ENTRY_CONDITION}${filterSql}`,
        { replacements, type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT stock.id
         FROM inventry_stock_entries AS stock
         ${joins}
         WHERE ${LATEST_STOCK_ENTRY_CONDITION}${filterSql}
         ORDER BY stock.createdAt DESC, stock.id DESC${paginationSql}`,
        { replacements, type: QueryTypes.SELECT }
      ),
    ]);

    const count = Number(countRows[0]?.totalRecords || 0);
    const ids = latestRows.map((row) => row.id);
    const rows = ids.length
      ? await InventryStockEntry.findAll({
        where: { id: { [Op.in]: ids } },
        include: [
          {
            association: "createdByUser",
            attributes: ["id", "name", "email"],
            required: false,
          },
          {
            association: "item",
            attributes: ["id", "itemCode", "name", "unit", "price", "currentStock"],
            required: true,
          },
        ],
        order: [
          ["createdAt", "DESC"],
          ["id", "DESC"],
        ],
      })
      : [];

    return res.status(200).json({
      success: true,
      message: "Latest inventory stock entries fetched successfully.",
      data: rows,
      pagination: {
        totalRecords: count,
        totalPages: isAll ? (count > 0 ? 1 : 0) : Math.ceil(count / limit),
        currentPage: isAll ? 1 : page,
        itemsPerPage: isAll ? count : limit,
        isAll,
      },
    });
  } catch (error) {
    console.error("Get Latest Inventory Stock Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get the latest inventory stock entries.",
    });
  }
};

exports.getInventoryStockByItemId = async (req, res) => {
  try {
    const { page, limit, offset, isAll, searchTerm } = validateQueryParams(req.query);
    const item = await InventoryItem.findByPk(req.params.id, {
      include: [
        {
          association: "createdByUser",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
    });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    const where = { itemId: item.id };
    if (searchTerm) {
      const like = `%${searchTerm}%`;
      where[Op.or] = [
        { entryNo: { [Op.like]: like } },
        { entryDate: { [Op.like]: like } },
        { quantity: { [Op.like]: like } },
        { rate: { [Op.like]: like } },
        { amount: { [Op.like]: like } },
        { supplierName: { [Op.like]: like } },
        { remarks: { [Op.like]: like } },
        { "$createdByUser.name$": { [Op.like]: like } },
        { "$createdByUser.email$": { [Op.like]: like } },
        { "$createdByUser.id$": { [Op.like]: like } },
      ];
    }

    if (req.query.entryDate) {
      where.entryDate = req.query.entryDate;
    }

    const queryOptions = {
      where,
      include: [
        {
          association: "createdByUser",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [
        ["createdAt", "DESC"],
      ],
      distinct: true,
    };

    if (!isAll) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const [{ rows, count }, totalStockAddedResult] = await Promise.all([
      InventryStockEntry.findAndCountAll(queryOptions),
      InventryStockEntry.sum("quantity", { where: { itemId: item.id } }),
    ]);

    const inventoryItem = item.toJSON();

    return res.status(200).json({
      success: true,
      message: "Inventory stock entries fetched successfully.",
      data: rows,
      inventoryItem: {
        ...inventoryItem,
        totalStockAdded: Number(totalStockAddedResult || 0),
      },
    
      pagination: {
        totalRecords: count,
        totalPages: isAll ? (count > 0 ? 1 : 0) : Math.ceil(count / limit),
        currentPage: isAll ? 1 : page,
        itemsPerPage: isAll ? count : limit,
        isAll,
      },
    });
  } catch (error) {
    console.error("Get Inventory Stock By Item ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get inventory stock entries.",
    });
  }
};

exports.deleteInventoryStockEntry = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const stockEntry = await InventryStockEntry.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!stockEntry) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Inventory stock entry not found.",
      });
    }


    const inventoryItem = await InventoryItem.findByPk(
      stockEntry.itemId,
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (!inventoryItem) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Associated inventory item not found.",
      });
    }

    const currentStock = Number(inventoryItem.currentStock);
    const entryQuantity = Number(stockEntry.quantity);

    if (currentStock < entryQuantity) {
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "Cannot delete this stock entry because the available stock is less than the entry quantity. Some stock may have already been consumed.",
      });
    }

    await inventoryItem.decrement("currentStock", {
      by: entryQuantity,
      transaction: t,
    });


    await stockEntry.destroy({
      transaction: t,
    });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Inventory stock entry deleted successfully.",
    });

  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }

    console.error("Delete Inventory Stock Entry Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory stock entry.",
    });
  }
};
