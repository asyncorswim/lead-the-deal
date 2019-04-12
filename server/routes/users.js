const express = require('express');
const router = express.Router();
const db = require('../../database/index.js')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


router.post('/:id/upload',(req,res)=>{
  const userId = req.params.id
  const upload = req.body
  db.Contact.create({
    name: upload.name,
    position: upload.position,
    company: upload.company,
    industry: upload.industry,
    phone: upload.phone,
    email: upload.email,
    Address: upload.address,
    times_purchased: 0,
    userId: userId
  })
    .then((result) => {
      console.log(result)
    })
    .catch((err) => {
      console.log(err)
    })
})

router.get('/:id/uploaded_contacts', (req, res) => {
  db.User.findAll({ where: { id: req.params.id } })
    .then((result) => {
      result[0].getUploads()
        .then((result) => {
          res.send(result);
        }).catch((err) => {
          res.send('there was an error locating uploaded users');
        });
    }).catch((err) => {
      res.send(err);
    });
})

router.get('/:id/purchased_contacts', (req, res) => {
  let userId = req.params.id
  db.purchasedContacts(function (contacts) {
    res.send(contacts)
  }, userId)
})

router.post('/search/:id', (req, res) => {
  const query = req.body;
  ////// SETTING LOGIC TO HANDLE UNDEFINED VALUES ///////////////////////////
  if (!query.name) {
    query.name = { [Op.ne]: 'UNDEFINED' }
  }
  else {
    query.name = { [Op.substring]: query.name }
  }
  //------------------------------------------------
  if (!query.company) {
    query.company = { [Op.ne]: 'UNDEFINED' }
  }
  else {
    query.company = { [Op.eq]: query.company }
  }
  //------------------------------------------------
  if (!query.industry) {
    query.industry = { [Op.ne]: 'UNDEFINED' }
  }
  else {
    query.industry = { [Op.eq]: query.industry }
  }
  //----------------------------------------------------
  if (!query.position) {
    query.position = { [Op.ne]: 'UNDEFINED' }
  }
  else {
    query.position = { [Op.eq]: query.position }
  }
  //------------------------------------------------------
  if (!query.address) {
    query.address = { [Op.ne]: 'UNDEFINED' }
  }
  else {
    query.address = { [Op.substring]: query.address }
  }
  db.Purchase.findAll({
    where: {
      user_id: req.params.id
    }
  })
    .then((contacts) => {
      let contactId = contacts.map((contact) => contact.contact_id)
      db.Contact.findAll({
        where: {
          name: query.name,
          company: query.company,
          industry: query.industry,
          position: query.position,
          Address: query.address,
          id: { [Op.notIn]: contactId }
        }
      })
        .then((contacts) => {
          const noContactInfo = contacts.map((contact) => {
            const searchRes = {};
            searchRes.name = contact.name;
            searchRes.id = contact.id;
            searchRes.company = contact.company
            searchRes.industry = contact.industry;
            searchRes.position = contact.position;
            return searchRes;
          })
          res.send(noContactInfo)
        })
        .catch((err) => {
          res.send(err)
        })
    })
});

router.post(`/purchase_contact/:id/:contactId`, (req, res) => {
  const userId = req.params.id;
  const contactId = req.params.contactId
  db.Purchase.create({
    user_id: userId, /////------------------------------------------------------------passport todo
    contact_id: contactId,
  })
    .then((result) => {
      console.log(result)
    })
    .catch((err) => {
      console.log(err)
    })
})

module.exports = router;