const express = require("express");
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

//Image Upload


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    
    filename: function (req, file, callback) 
    { 
        // let extArray = file.mimetype.split("/");
        // let extension = extArray[extArray.length - 1];
        // callback(null,file.originalname + '-' + Date.now() + "." + extension);

        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        //callback(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");


//Insert Database

router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        image: req.file.filename
    });
    user.save((err) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: "success",
                message: "User added successfully"
            };
            res.redirect("/")
        }
    })
})

//Index page
// router.get("/", (req,res)=>{
//     res.render('index', {title: 'Home'});
// });

// Get all user Route

router.get("/", (req, res) => {
    User.find().exec((err, users) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("index", {
                title: "Home page",
                users: users,
            });
        }
    });
});

router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add User" });
});


//Edit user

router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id, (err, user) => {
        if (err) {
            res.redirect('/');
        } else {
            if (user == null) {
                res.redirect('/');
            } else {
                res.render("edit_users", {
                    title: "Edit User",
                    user: user,
                });
            }
        }
    });
});

//Update User

router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        image: new_image,
    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'User updated successfully'
            };
            res.redirect('/');
        }
    })
});

//Delete Router

router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    User.findByIdAndRemove(id, (err, result) => {
        if (result.image != '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        if (err) {
            res.json({ message: err.message });
        } else {
            req.session.message = {
                type: 'success',
                message: 'User deleted successfully'
            };
            res.redirect('/');
        }
    });
})

module.exports = router;