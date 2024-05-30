const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const fetchuser = require('../middleware/fetchuser');

// Create a post
router.post('/createpost',fetchuser, async (req, res) => {
  try {

    const { content} = req.body;

    const post = new Post({
        content,
        user:req.user.id

    },
    );
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Read all posts
router.get('/getallposts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).send(posts);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Read a single post
router.get('/singlepost/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send();
    res.status(200).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a post
router.put('/updatepost/:id',fetchuser, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id)

    if (!post) return res.status(404).send("Post not found");
    
    if (post.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed")
    }

     post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // post = await Post.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
    res.status(200).send(post);

  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a post
router.delete('/deletepost/:id',fetchuser, async (req, res) => {
  try {

    let post = await Post.findById(req.params.id)

    if (!post) return res.status(404).send("Post not found");

    if (post.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed")
    }

     post = await Post.findByIdAndDelete(req.params.id);

    res.status(200).send("Post deleted");
  } catch (error) {
    res.status(400).send(error);
  }
});

// Like a post
router.post('/like/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).send();

    post.likes += 1;

    await post.save();

    res.status(200).send(post);

  } catch (error) {
    res.status(400).send(error);
  }
});

// Add a comment to a post
router.post('/comment/:id',fetchuser, async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).send();

    // post.comments.push({ text: req.body.text });
// console.log(req.user.id);
    post.comments.push({ 
        user: req.user.id,
        text: req.body.text 
      });
  

    await post.save();

    res.status(200).send(post);

  } catch (error) {
    res.status(400).send(error);
  }
});


// Update a comment
// router.put('/comment/:id/:commentId', fetchuser, async (req, res) => {
//     try {
//       const post = await Post.findById(req.params.id);
//       if (!post) return res.status(404).send("Post not found");
  
//       const comment = post.comments.id(req.params.commentId);
//       if (!comment) return res.status(404).send("Comment not found");
  
//       if (comment.user.toString() !== req.user.id) {
//         return res.status(401).send("Not allowed");
//       }
  
//       comment.text = req.body.text;
  
//       await post.save();
//       res.status(200).send(post);
//     } catch (error) {
//       res.status(400).send(error);
//     }
//   });
  
//   // Delete a comment
//   router.delete('/deletecomment/:id/:commentId', fetchuser, async (req, res) => {
//     try {
//       const post = await Post.findById(req.params.id);
//       if (!post) return res.status(404).send("Post not found");
  
//       const comment = post.comments.id(req.params.commentId);
//       if (!comment) return res.status(404).send("Comment not found");
//   console.log(comment);
//       if (comment.user.toString() !== req.user.id) {
//         console.log("error");
//         return res.status(401).send("Not allowed");
//       }
//       if (comment.user.toString() == req.user.id) {
//         console.log("succes");
//       }
  
//       comment.remove();
  
//       await post.save();
//       res.status(200).send(post);
//     } catch (error) {
//       res.status(400).send(error);
//     }
//   });

module.exports = router;
