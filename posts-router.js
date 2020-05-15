const express = require('express');

const db = require('./data/db.js');

const router = express.Router();

router.use(express.json());

// GET	/api/posts	Returns an array of all the post objects contained in the database.
// If there's an error in retrieving the posts from the database:
//     cancel the request.
//     respond with HTTP status code 500.
//     return the following JSON object: { error: "The posts information could not be retrieved." }.
router.get('/', (req, res) => {
    db.find(req.query)
        .then(hubs => {
            res.status(200).json(hubs);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "The posts information could not be retrieved." });
        });
});

// GET	/api/posts/:id	Returns the post object with the specified id.
// If the post with the specified id is not found:
//     return HTTP status code 404 (Not Found).
//     return the following JSON object: { message: "The post with the specified ID does not exist." }.
// If there's an error in retrieving the post from the database:
//     cancel the request.
//     respond with HTTP status code 500.
//     return the following JSON object: { error: "The post information could not be retrieved." }.
router.get('/:id', (req, res) => {
    db.findById(req.params.id)
        .then(post => {
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "The post information could not be retrieved." });
        });
});

// POST	/api/posts	Creates a post using the information sent inside the request body.
// If the request body is missing the title or contents property:
//      cancel the request.
//      respond with HTTP status code 400 (Bad Request).
//      return the following JSON response: { errorMessage: "Please provide title and contents for the post." }.
// If the information about the post is valid:
//      save the new post the the database.
//      return HTTP status code 201 (Created).
//      return the newly created post.
// If there's an error while saving the post:
//      cancel the request.
//      respond with HTTP status code 500 (Server Error).
//      return the following JSON object: { error: "There was an error while saving the post to the database" }.
router.post('/', (req, res) => {
    const postData = req.body;
    if (!postData.title || !postData.contents) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    } else {
        db.insert(postData)
            .then(post => {
                db.findById(post.id)
                    .then(newPost => {
                        res.status(201).json(newPost);
                    })
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({ error: "There was an error while saving the post to the database" });
            });
    }
});

// DELETE	/api/posts/:id	Removes the post with the specified id and returns the deleted post object. You may need to make additional calls to the database in order to satisfy this requirement.
// If the post with the specified id is not found:
//     return HTTP status code 404 (Not Found).
//     return the following JSON object: { message: "The post with the specified ID does not exist." }.
// If there's an error in removing the post from the database:
//     cancel the request.
//     respond with HTTP status code 500.
//     return the following JSON object: { error: "The post could not be removed" }.
router.delete('/:id', (req, res) => {
    let deletedPost = {}
    db.findById(req.params.id)
        .then(deleted => {
            deletedPost = deleted
        })
    
    db.remove(req.params.id)
        .then(count => {
            if (count > 0) {
                res.status(200).json({ message: "The post has been deleted.", deletedPost });
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "The post could not be removed" });
        });
});

// PUT	/api/posts/:id	Updates the post with the specified id using data from the request body. Returns the modified document, NOT the original.
// If the post with the specified id is not found:
//     return HTTP status code 404 (Not Found).
//     return the following JSON object: { message: "The post with the specified ID does not exist." }.
// If the request body is missing the title or contents property:
//     cancel the request.
//     respond with HTTP status code 400 (Bad Request).
//     return the following JSON response: { errorMessage: "Please provide title and contents for the post." }.
// If there's an error when updating the post:
//     cancel the request.
//     respond with HTTP status code 500.
//     return the following JSON object: { error: "The post information could not be modified." }.
// If the post is found and the new information is valid:
//     update the post document in the database using the new information sent in the request body.
//     return HTTP status code 200 (OK).
//     return the newly updated post.
router.put('/:id', (req, res) => {
    const changes = req.body;
    const id = req.params.id;

    db.findById(id)
        .then(post => {
            if (!post) {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            }
        })

    if (!changes.title || !changes.contents) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    } else {
        db.update(id, changes)
            .then(response => {
                db.findById(id)
                    .then(updatedPost => {
                        res.status(200).json(updatedPost);
                    })
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({ error: "The post information could not be modified." });
            });
    }
});

// GET	/api/posts/:id/comments	Returns an array of all the comment objects associated with the post with the specified id.
// If the post with the specified id is not found:
//     return HTTP status code 404 (Not Found).
//     return the following JSON object: { message: "The post with the specified ID does not exist." }.
// If there's an error in retrieving the comments from the database:
//     cancel the request.
//     respond with HTTP status code 500.
//     return the following JSON object: { error: "The comments information could not be retrieved." }.
router.get('/:id/comments', (req, res) => {
    db.findPostComments(req.params.id)
        .then(post => {
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ error: "The comments information could not be retrieved." });
        });
});

// POST	/api/posts/:id/comments	Creates a comment for the post with the specified id using information sent inside of the request body.
// If the post with the specified id is not found:
//     return HTTP status code 404 (Not Found).
//     return the following JSON object: { message: "The post with the specified ID does not exist." }.
// If the request body is missing the text property:
//     cancel the request.
//     respond with HTTP status code 400 (Bad Request).
//     return the following JSON response: { errorMessage: "Please provide text for the comment." }.
// If the information about the comment is valid:
//     save the new comment the the database.
//     return HTTP status code 201 (Created).
//     return the newly created comment.
// If there's an error while saving the comment:
//     cancel the request.
//     respond with HTTP status code 500 (Server Error).
//     return the following JSON object: { error: "There was an error while saving the comment to the database" }.
router.post('/:id/comments', (req, res) => {
    const id = req.params.id;
    const commentData = req.body;

    db.findById(id)
        .then(post => {
            if (!post) {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            }
        })

    if (!commentData.text) {
        res.status(400).json({ errorMessage: "Please provide text for the comment." });
    } else {
        db.insertComment(commentData)
            .then(comment => {
                db.findCommentById(comment.id)
                    .then(newComment => {
                        res.status(201).json(newComment);
                    })
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({ error: "There was an error while saving the comment to the database." });
            });
    }
});


module.exports = router;