const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/Cliente_resena");

router.post("/", reviewController.createReview);
router.get("/product/:id_producto", reviewController.getReviewsByProduct);
router.get("/user/:id_usuario", reviewController.getReviewsByUser);
router.put("/:id_comentario", reviewController.updateReview);
router.delete("/:id_comentario", reviewController.deleteReview);
router.get("/", reviewController.getAllReviews);

module.exports = router;