const router = require("express").Router();
const authenticate = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validations");
const {
  createInventoryItemRules,
  addInventoryStockRules,
  changeInventoryItemStatusRules,
  inventoryItemIdRule,
  inventoryListRules,
  inventoryStockQueryRules,
  updateInventoryItemRules,
} = require("../middlewares/inventoryValidation");
const inventoryController = require("../controllers/inventoryController");
const { ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER } = require("../utils/constants");

router.post(
  "/add",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  createInventoryItemRules,
  validate,
  inventoryController.addInventoryItem
);

router.get(
  "/getAllInventoryItems",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  inventoryListRules,
  validate,
  inventoryController.getAllInventoryItems
);

router.get(
  "/getInventoryItemById/:id",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  inventoryItemIdRule,
  validate,
  inventoryController.getInventoryItemById
);

router.put(
  "/edit/:id",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  updateInventoryItemRules,
  validate,
  inventoryController.updateInventoryItem
);

router.patch(
  "/changeInventoryItemStatus/:id",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  changeInventoryItemStatusRules,
  validate,
  inventoryController.changeInventoryItemStatus
);

router.delete(
  "/deleteInventoryItem/:id",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  inventoryItemIdRule,
  validate,
  inventoryController.deleteInventoryItem
);

router.post(
  "/addInventoryStock",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  addInventoryStockRules,
  validate,
  inventoryController.addInventoryStock
);

router.get(
  "/getLatestInventoryStock",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  inventoryStockQueryRules,
  validate,
  inventoryController.getLatestInventoryStock
);

router.get(
  "/getInventoryStockByItemId/:id",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  inventoryItemIdRule,
  inventoryStockQueryRules,
  validate,
  inventoryController.getInventoryStockByItemId
);

router.delete(
  "/deleteInventryStockEntry/:id",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  inventoryController.deleteInventoryStockEntry
);

module.exports = router;
