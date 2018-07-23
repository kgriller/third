const express = require('express')
const router = express.Router()
 
router.get('/', (req, res) => {
    if (req.session.username) {
        res.redirect('/reg/dashboard')
    } else {
        res.render('index')
    }
})
 
module.exports = router