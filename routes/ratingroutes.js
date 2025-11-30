const express = require('express');
const router = express.Router();
const commentController = require('../controllers/rating_controller');

// Create
router.post('/createcomments', commentController.createComment);

// Read
router.get('/view allcomments', commentController.getAllComments);
router.get('/viewcomment/:id', commentController.getCommentById);



module.exports = router;
