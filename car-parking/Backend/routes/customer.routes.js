const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");

router.post("/", customerController.createCustomer);
router.get("/", customerController.getAllCustomers);
router.get("/unpaid-services", customerController.getUnpaidServices);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.get(
  "/:customerId/cars/:carId/services/:serviceId",
  customerController.getServiceDetail
);
router.put(
  "/:customerId/cars/:carId/services/:serviceId/pay",
  customerController.payService
);
router.get(
  "/:id/service-history",
  customerController.getCustomerWithServiceHistory
);

module.exports = router;
