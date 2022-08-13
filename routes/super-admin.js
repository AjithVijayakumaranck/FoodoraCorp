const e = require('express');
var express = require('express');
const { Db } = require('mongodb');
var router = express.Router();
let sAdminHelper = require('../Helpers/RestaurantAdminHelper');
let multer = require('multer');
const { response } = require('../app');
const adminHelpers = require('../Helpers/admin-helpers');
const { json } = require('express');

// multer ---->

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("stage 1");
        cb(null, './public/images/cusineImages')
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + '--' + file.originalname)
    }
})
const upload = multer({ storage: fileStorageEngine })



verifyLogIn = (req, res, next) => {
    if (req.session.Restaurant) {
      res.redirect('/RestaurantAdmin/RestaurantAdminLoggedin');
    } else {
      next();
  
    }
};

verifyLoggedIn = (req, res, next) => {
    if (req.session.Restaurant) {
        next();
    
    } else {
        res.redirect('/RestaurantAdmin');
    }
  };

router.get('/',verifyLogIn,function (req, res, next) {
    try{

        if(req.session.adminLogged){
        loginError=req.session.adminLogged
        req.session.adminLogged=false
            res.render('RestaurantAdmin/restaurantLogin', { user:true,loginError});
        }else if(req.session.adminBlocked){
            blockedError=req.session.adminBlocked;
            req.session.adminBlocked=false;
            res.render('RestaurantAdmin/restaurantLogin', { user:true,blockedError});
    
        }else{
            res.render('RestaurantAdmin/restaurantLogin', { user:true});
        }
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
    
})

router.get('/RestaurantAdminLoggedin',verifyLoggedIn,async(req, res, next)=>{
    try{

        let adminDetails=req.session.Restaurant
        console.log(adminDetails);
        let totalCheckouts = adminDetails.admin.orders.length
        console.log(totalCheckouts);
       let totalOrders= await sAdminHelper.totalOrdersCheckOuts(adminDetails.admin._id)
       
       let totalrazorPay= await sAdminHelper.totalrazorPay(adminDetails.admin._id)
       let allorders=await sAdminHelper.getAllOrders(req.session.Restaurant)
       let salesReport=await sAdminHelper.salesReport(req.session.Restaurant)
       console.log(salesReport,'sales is here');
       console.log('restaurant orders',allorders);
       console.log(totalrazorPay,'hello hh');
       if(totalrazorPay.length==0){
          console.log('hello length');
          let totalcodPay=0
       totalrazorPay=0
       let totalPrice=0
       let total={total:0}
       totalOrders.push(total)
       let OutDelivery='Out For Delivery'
       console.log(totalOrders,'have  kkk');
          res.render('RestaurantAdmin/index', { Restaurant:true,adminDetails,totalOrders,totalCheckouts,totalcodPay,totalrazorPay,totalPrice,allorders,salesReport,OutDelivery});
       }else{
          console.log(totalrazorPay,'have arazor pay');
          console.log('hello length is not null');
          let  totalcodPay
          let totalrazoPay
      
          if(!totalrazorPay[0]){
              totalcodPay=0
          }else{
              totalcodPay=totalrazorPay[0].total
          }
          if(!totalrazorPay[1]){
              totalrazoPay=0
          }else{
              totalrazoPay=totalrazorPay[1].total
          }
          
          let totalPrice=totalrazoPay+totalcodPay
          +totalcodPay
      
          
          res.render('RestaurantAdmin/index', { Restaurant:true,adminDetails,totalOrders,totalCheckouts,totalcodPay,totalrazoPay,totalPrice,allorders,salesReport});
          
       }
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
})


router.post('/login', function (req, res, next) {
    try{

        sAdminHelper.login(req.body).then((response)=>{
            console.log(response,'hello boyya')
            if(response.status){
            req.session.Restaurant=response
            console.log("restautrantant  sessioon");
             console.log(req.session.Restaurant);
           res.redirect('/RestaurantAdmin/RestaurantAdminLoggedin')
            }else{
                if(response.blocked){
                    req.session.adminBlocked=true
                    res.redirect('/RestaurantAdmin')
                }else{
                    req.session.adminLogged=true
                    res.redirect('/RestaurantAdmin')

                }
            }
        })
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
})

router.get('/viewCusines', verifyLoggedIn,function (req, res, next) {
    try{

        console.log(req.session.Restaurant);
        sAdminHelper.getCusines(req.session.Restaurant).then((response)=>{
            console.log("have a nice day");
            console.log(response);
            res.render('RestaurantAdmin/viewCusines', { Restaurant: true,response});
    
        })
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
})
router.get('/addCusines',verifyLoggedIn,(req, res, next) => {
    try{
        res.render('RestaurantAdmin/addCusines', { Restaurant: true });
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
})
router.post('/addCusines', upload.single('cusineImage'), (req, res, next) => {
    try{

        console.log(req.file);
        let filename = req.file.filename
        console.log('filename');
        console.log(filename);
       
    
         console.log('code came hete');
    
         console.log(req.session.Restaurant);
        
        sAdminHelper.addCusines(req.body,filename,req.session.Restaurant).then((response) => {
            if (response.status = true) {
                res.redirect('/RestaurantAdmin/addCusines')
            } else {
                res.send("cusinenot added ")
            }
        }).catch((error) => {
            res.render('RestaurantAdmin/ServerError',{err:true})
        })
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
})

router.get('/inStock/:id', (req, res, next) => {
    try{

        cusineId=req.params.id;
        sAdminHelper.stockCusine(cusineId).then((response)=>{
    
            res.redirect('/RestaurantAdmin/viewCusines');
        })
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
})

router.get('/ordersToday',verifyLoggedIn,async (req, res, next) => {
    try{

        console.log(req.session.Restaurant.admin);
        let allorders=await sAdminHelper.getAllOrders(req.session.Restaurant)
        console.log('hello orders is heree',allorders);
        
        res.render('RestaurantAdmin/ordersToday', { Restaurant: true,allorders});
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
})

router.get('/outForDelivery', (req, res, next) => {
    try{
        
        res.render('RestaurantAdmin/outForDelivery', { Restaurant: true });
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
})

router.get("/deleteCusine/:id",(req, res, next) => {
    try{

        let cusineId = req.params.id;
        sAdminHelper.DeleteCusine(cusineId).then((response)=>{
          if(response.status){
           
            res.redirect('/RestaurantAdmin/viewCusines');
          }
          else{
            
            res.redirect('/RestaurantAdmin/viewCusines');
          }
        })
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
  
  })

  router.get('/applyAds',(req, res, next) => {
    try{

        res.render('RestaurantAdmin/applyAds', { Restaurant: true });
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }

   })

   router.post('/advApplication',(req, res, next) => {
    try{

        res.render('RestaurantAdmin/PaymentForm', { payment:true});
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
   })
   router.post('/advRequest',(req, res, next) => {
    try{

        sAdminHelper.addRequest(req.body).then((response)=>{
    
        })
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }

   })



   router.get('/logOut',(req, res, next) => {
    try{
        console.log("hello bro");
        req.session.Restaurant=null;
        res.redirect('/RestaurantAdmin')
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }
   })
  router.post('/changeOrderStatus',(req, res, next) => {
    try{

        let status=req.body.status
         console.log(req.body,'have a great day');
       sAdminHelper.changeStatus(status,req.body.orderId).then((response)=>{
         res.json({ status: true })
       })
    }catch(err){
        res.render('RestaurantAdmin/ServerError',{err:true})
      }

  })


module.exports = router;
