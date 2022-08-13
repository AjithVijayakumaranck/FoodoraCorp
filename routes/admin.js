const e = require('express');
var express = require('express');
const { Db } = require('mongodb');
var router = express.Router();
let adminHelper = require('../Helpers/admin-helpers');
let userHelper = require('../Helpers/userHelpers');
let sAdminHelper=require('../Helpers/RestaurantAdminHelper');
let multer= require('multer');
let moment=require('moment');


const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
      console.log("stage 1");
      cb(null, './public/images/restaurantImages')
  },
  filename: (req, file, cb) => {
      console.log(file);
      cb(null, Date.now() + '--' + file.originalname)
  }
})
const upload = multer({ storage: fileStorageEngine })

const BannerStorageSystem = multer.diskStorage({
  destination: (req, file, cb) => {
      console.log("stage 1");
      cb(null, './public/images/bannerImages')
  },
  filename: (req, file, cb) => {
      console.log(file);
      cb(null, Date.now() + '--' + file.originalname)
  }
})
const uploadBanner = multer({ storage: BannerStorageSystem })


/* GET users listing. */
verifyLogIn = (req, res, next) => {
  if (req.session.admin) {
    res.redirect('/admin/adminHome');
  } else {
    next();

  }
};

router.get('/', verifyLogIn, function (req, res, next) {
  try{

    if(req.session.superAdminLogged){
      loginError=req.session.superAdminLogged
      req.session.superAdminLogged=false
      res.render('admin/Adminlogin', { user: true,loginError});
          // res.render('RestaurantAdmin/restaurantLogin', { user:true,loginError});
    }else{
  
      res.render('admin/Adminlogin', { user: true });
    }
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

});

verifyLoggedIn = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect('/admin');
  }
};


router.get('/adminHome', verifyLoggedIn, async(req, res, next) => {
  try{

    let restaurantCount= await userHelper.getRestaurantCount()
    let totalOrders= await adminHelper.totalOrdersCheckOuts()
    let totalCancell= await adminHelper.totalOrdersCancelled()
    let totalSales= await adminHelper.totalOrdersSales()
    
    let totalCount=totalOrders.length
    let totalCancelled=totalCancell.length
    console.log(totalCancelled);
    console.log(totalSales);
    let totalsales=totalSales.total
    console.log(totalsales);
  
    let adminDetails = req.session.admin
    res.render('admin/index', { admin: true, adminDetails,restaurantCount,totalCount,totalCancelled,totalsales});
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

});

router.post("/Adminlogin", function (req, res, next) {
  try{

    console.log(req.body);
    adminHelper.loginAdmin(req.body).then((code) => {
      console.log(code);
      if (code.status) {
        req.session.admin = code;
        console.log('have a nice admin');
        console.log(req.session.admin);
  
        console.log("logged in");
        res.redirect("/admin/adminHome");
      } else {
        req.session.superAdminLogged=true
        
        res.redirect("/admin");
      }
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

});

router.get("/addAdmin",verifyLoggedIn, (req, res, next) => {
  try{

    res.render('admin/add-admin', { user: true, admin: true })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

})

router.get("/viewUsers",verifyLoggedIn, (req, res, next) => {
  try{

    adminHelper.getAllUsers().then((response)=>{
  
      res.render('admin/viewUser', { user: true, admin: true,response})
    } )
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

})

router.post("/addAdmin",upload.single('restauratImage'),(req, res, next) => {
  try{

    console.log(req.body);
    
    let filename = req.file.filename
     req.body.image=filename
    adminHelper.addAdmin(req.body,filename).then((response) => {
      res.redirect("/admin/adminHome");
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

})

router.get("/viewRestaurants", (req, res, next) => {
  try{

    adminHelper.getAllRestaurants().then((response) => {
      console.log(response);
      res.render('admin/ViewRestaurants', { response, admin: true })
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

})


router.get("/addCoupons", (req, res, next) => {
  try{

    if(req.session.couponExist){
      couponExist=req.session.couponExist
      req.session.couponExist=false
      res.render('admin/addCoupons', { user: true, admin: true,couponExist})
    }else{
      res.render('admin/addCoupons', { user: true, admin: true})
    }
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }


})

router.post("/addCoupons", (req, res, next) => {
  try{

    
    adminHelper.addCoupons(req.body).then((response)=>{
      if(response.status){
    couponExist=false
    req.session.couponExist=false
        res.redirect('/admin/addCoupons')
      }else{
  
    req.session.couponExist=true
        res.redirect('/admin/addCoupons')
      }
  
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

})



router.get('/viewCoupon',verifyLoggedIn,async(req, res) => {
  try{

    let coupon=await adminHelper.getAllcoupons()
    res.render('admin/viewCoupons',{coupon,admin: true})
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

})

// router.get('/viewCoupon', (req, res, next) => {
//   adminHelper.getAllCoupon().then((response) => {
//     console.log(response);

//     res.render('admin/viewCoupons', { admin: true, response })
//     // }
//   })
// })

router.get("/resBlockStatus/:id", (req, res, next) => {
  try{

    let resId = req.params.id;
    adminHelper.blockStatusres(resId).then((response) => {
      if (response.status) {
  
        res.redirect('/admin/viewRestaurants');
      }
      else {
  
        res.redirect('/admin/viewRestaurants');
      }
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }


})

router.get("/adminBlockStatus/:id", (req, res, next) => {
  try{

    let AgentId = req.params.id;
    adminHelper.blockStatus(AgentId).then((response) => {
      if (response.status) {
  
        res.redirect('/admin/viewCoupon');
      }
      else {
  
        res.redirect('/admin/viewCoupon');
      }
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }


})

router.get("/userBlockStatus/:id", (req, res, next) => {
  try{

    let userId = req.params.id;
    console.log('code is here have anic');
    adminHelper.blockStatusUser(userId).then((response) => {
      if (response.status) {
  
        res.redirect('/admin/viewUsers');
      }
      else {
  
        res.redirect('/admin/viewUsers');
      }
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }


})

router.get("/adminDelete/:id", (req, res, next) => {
  try{

    let ResId = req.params.id;
    adminHelper.DeleteRestaurants(ResId).then((response) => {
      if (response.status) {
  
        res.redirect('/admin/viewRestaurants');
      }
      else {
  
        res.redirect('/admin/viewRestaurants');
      }
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }


})
router.get("/DeleteUser/:id", (req, res, next) => {
  try{

    let ResId = req.params.id;
    console.log('code is hereeee');
    adminHelper.DeleteUser(ResId).then((response) => {
      if (response.status) {
  
        res.redirect('/admin/viewUsers');
      }
      else {
  
        res.redirect('/admin/viewUsers');
      }
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }


})

router.get('/logOut', (req, res) => {
  try{

    req.session.admin = null;
    res.redirect('/admin')
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

})



router.get('/banners', (req, res) => {
  try{

    res.render('admin/addBanners',{admin:true})
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

})


  router.get('/banners',(req, res) => {
    try{

      let filename = req.file.filename
      req.body.image=filename
      res.render('admin/addBanners',{admin:true})
    }catch(err){
      res.render('admin/ServerError',{err:true})
    }
  
  })



  router.post('/banners',uploadBanner.array('bannerImages'),(req, res) => {
    try{

      console.log(req.files);
      let filename=[];
      filename[0] = req.files[0].filename
      filename[1] = req.files[1].filename
      filename[2] = req.files[2].filename
  
          req.body.image=filename
          adminHelper.addBanners(filename).then((response)=>{
            res.redirect('/admin')
          })
  
      res.render('admin/addBanners',{admin:true})
    }catch(err){
      res.render('admin/ServerError',{err:true})
    }
  
  })
  


   
 router.get('/deleteCoupon/:id',(req, res)=>{
  try{

    adminHelper.deleteCoupon(req.params.id).then((response)=>{
      res.redirect('/admin/viewCoupon')
  
    })
  }catch(err){
    res.render('admin/ServerError',{err:true})
  }

 })




module.exports = router;
