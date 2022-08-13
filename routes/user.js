const { Router } = require('express');
var express = require('express');
var router = express.Router();
let session = require('express-session');
const { Db } = require('mongodb');
const TaskRouterCapability = require('twilio/lib/jwt/taskrouter/TaskRouterCapability');
const { response, routes } = require('../app');
const { login } = require('../Helpers/RestaurantAdminHelper');
const { userDetails } = require('../Helpers/userHelpers');
const userHelpers = require('../Helpers/userHelpers');
const userHelper = require("../Helpers/userHelpers");


// router.get('/error',(req, res, next)=>{
//   res.render('serverError',{err:true})
// })
let verifyLogin = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/home');
  }
  else {
    next();
  }

}
/* GET home page. */
router.get('/', verifyLogin, function (req, res, next) {
 try {
  if(req.session.userLogged){
  let loginError=req.session.userLogged
  req.session.userLogged = false
  res.render('index', { user: true,loginError,logged: true });
}
  else if(req.session.userNotExist){
    let notError=req.session.userNotExist
     req.session.userNotExist= false
    res.render('index', { user: true,notError})
  }else{
    res.render('index', { user: true, logged: true });
  }
 }catch (err) {}
 res.render('logged/ServerError',{err:true})
});

verifyLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
};


router.get('/home', async(req, res, next)=>{
  try {
    let restaurantCount= await userHelper.getRestaurantCount()
    let restaurantNames= await userHelper.getRestaurantDet()
    let banners =await userHelper.getBanners()
    console.log('hello banners',banners,'have a nice banners');
    let Carousal=banners[0].name
    console.log(banners,'have a nice banners');
    console.log(restaurantNames,'have eeee asjndas sdj');
      if (req.session.user) {
        let cartCount = await userHelper.getCartCount(req.session.user.user._id)
        userHelper.getAllCusines().then((response) => {
          res.render('logged/logged', { user: true, log: req.session.user, response, cartCount,restaurantCount,restaurantNames,Carousal})
        })
    
      }
      else {
        userHelper.getAllCusines().then((response) => {
          res.render('logged/logged', { user: true, guest: true, response,restaurantCount,restaurantNames,Carousal})
    
        })
      }

   }catch (err) {
    res.render('logged/ServerError',{err:true})
   }
  
})

router.get('/signup', function (req, res, next) {
  try{
      if(req.session.phoneExist){
        console.log('user email phone');
          let phoneExist=req.session.phoneExist
          req.session.phoneExist=false
          res.render('logged/otp', { user: true,phoneExist})
      }else if(req.session.emailExist){
        console.log('user email exist');
        let emailExist=req.session.emailExist
        req.session.emailExist=false
         res.render('logged/otp', { user: true,emailExist})
      }
    else{
      res.render('logged/otp', { user: true })
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
let userdata;
router.post('/signup', (req, res, next) => {
  try{

    userHelper.Signup(req.body).then((response) => {
      userdata = response;
      console.log(response);
    
        if(response.emailExist){
          console.log('sigup prosess');
          req.session.emailExist=true
           res.redirect('/signup')
        }else if(response.phoneNumber){
          req.session.phoneExist=true
          res.redirect('/signup')
        }
      else{
         console.log('hello');
        res.redirect('/verify')
      }
  })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }


})

router.get('/verify', (req, res, next) => {
  try{

    res.render('logged/otpVerify', { user: true })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
router.get('/verifyOtp', (req, res, next) => {
  try{

    res.render('logged/otpVerify', { user: true })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})

router.post('/verify', (req, res, next) => {
  try{

    userHelper.signupOtp(req.body, userdata).then((response) => {
  
      res.redirect('/home')
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})

router.get('/log', (req, res, next) => {
  try{

    if(req.session.userLogged){
       let loginError=req.session.userLogged
       req.session.userLogged = false
      res.render('logged/login', { user: true,loginError})
    }else if(req.session.userNotExist){
      let notError=req.session.userNotExist
       req.session.userNotExist= false
      res.render('logged/login', { user: true,notError})
    }
    else{
  
      res.render('logged/login', { user: true })
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
router.post('/log', (req, res, next) => {
  try{

    userHelper.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.user = response
        res.redirect('/home')
      } else {
        if(response.notExist){
  
          req.session.userNotExist=true
          res.redirect('/log')
        }else{
          req.session.userLogged=true
          res.redirect('/log')
        }
      }
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
router.post('/logFromHead', (req, res, next) => {
  try{

    userHelper.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.user = response
        res.redirect('/home')
      } else {
        if(response.notExist){
  
          req.session.userNotExist=true
          res.redirect('/')
        }else{
          req.session.userLogged=true
          res.redirect('/')
        }
      }
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})

router.get('/addToCart/:id',(req, res, next) => {
  try {
    if(req.session.user.user){

      userHelper.addToCart(req.params.id, req.session.user.user._id).then(() => {
        res.json({ status: true })
  
      })
    }else{
      res.redirect('/')
    }
  } catch (err) {
    res.render('logged/ServerError',{err:true})
  }
})




router.get('/logOut', (req, res, next) => {
  try{

    req.session.user = null;
    res.redirect('/home');
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})



router.get('/orders', verifyLoggedIn, async (req, res, next) => {
  try{

    let Cusines = await userHelper.getCartProducts(req.session.user.user._id)
    if (req.session.user.user) {
      let totalValue = await userHelper.getTotalAmount(req.session.user.user._id)
  
      let address = await userHelper.getUserAddress(req.session.user.user._id)
      if (totalValue.length != 0) {
        if (address.length != 0) {
          userData = req.session.user.user._id
          totalValue = totalValue[0].total;
          totalDeliveryCharge = totalValue * .05
          grossCharge = totalValue + totalDeliveryCharge
  
          if (Cusines) {
  
            address = address[0].address;
            res.render('logged/Orders', { Cusines, orders: true, totalValue, totalDeliveryCharge, grossCharge, userData, address })
          } else {
            res.render('logged/Orders', { noCusines: true, orders: true })
  
          }
        } else {
          res.redirect('/addAddress')
        }
      } else {
        res.render('logged/Orders', { noCusines: true, orders: true })
      }
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }



})
router.get('/ordersCoupon', verifyLoggedIn, async (req, res, next) => {
  try{

    let Cusines = await userHelper.getCartProducts(req.session.user.user._id)
    if (req.session.user.user) {
      let totalValue = await userHelper.getTotalAmount(req.session.user.user._id)
  
      let address = await userHelper.getUserAddress(req.session.user.user._id)
      if (totalValue.length != 0) {
        if (address.length != 0) {
          userData = req.session.user.user._id
          totalValue = totalValue[0].total;
          totalDeliveryCharge = totalValue * .05
          grossCharge = totalValue + totalDeliveryCharge
  
          if (Cusines) {
  
            address = address[0].address;
            res.render('logged/Orders', { Cusines, orders: true, totalValue, totalDeliveryCharge, grossCharge, userData, address,couponNotExist:true})
          } else {
            res.render('logged/Orders', { noCusines: true, orders: true })
  
          }
        } else {
          res.redirect('/addAddress')
        }
      } else {
        res.render('logged/Orders', { noCusines: true, orders: true })
      }
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }



})


router.post('/changeProductQuantity', (req, res) => {
  try{

    userHelper.changeProductCount(req.body).then(async (response) => {
  
      total = await userHelper.getTotalAmount(req.body.user)
  
      if (response.removeproduct) {
        res.json(response)
      }
      else if (total.length != 0) {
        response.total = total[0].total
        response.totalGross = response.total + response.total * .05
        response.totalDeliveryCharge = response.total * .05
        res.json(response)
      } else {
        response.total = 0
        response.totalGross = 0
        response.totalDeliveryCharge = 0
        res.json(response)
      }
  
  
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
let finalPrice={}

router.post('/placeOrderCoupon', verifyLoggedIn , async (req, res) => {
  try{

    console.log(req.body);
      let couponId = req.body.CouponId
    
      console.log(couponId,'have a nice coupon');
      let total = await userHelper.getTotalAmount(req.session.user.user._id,couponId)
      let address = await userHelper.getUserAddress(req.session.user.user._id)
      address = address[0].address
      console.log(total);
      // console.log(total.total[0]);
      if(total.status){
        
        if (total.length != 0) {
    
          discount = total.total[0].discount
          total = total.total[0].total
          grossTotal = total + total * .05
          deliveryCharge = total * .05
          discountPrice=grossTotal*discount.Discount/100
          discountPercentage=discount.Discount
    
          finalPrice.couponDetails=discount
          finalPrice.total=discountPrice
          finalPrice.couponStatus=true
          finalPrice.user=req.session.user.user._id
            
          res.render('logged/placeOrder', { orders: true, checkout: true, total, grossTotal, deliveryCharge, userId: req.session.user.user._id, address,discountPrice,discountPercentage})
        } else {
          res.redirect('/home');
        }
      }else{
        res.redirect('/ordersCoupon')
      }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})
router.get('/PlaceOrder', verifyLoggedIn , async (req, res) => {
  try{

    let total = await userHelper.getTotalAmount(req.session.user.user._id)
    let address = await userHelper.getUserAddress(req.session.user.user._id)
    address = address[0].address
    if (total.length != 0) {
  
      total = total[0].total
  
      grossTotal = total + total * .05
      deliveryCharge = total * .05
  
      finalPrice.couponDetails=null
      finalPrice.total=grossTotal
      finalPrice.couponStatus=false
      finalPrice.user=req.session.user.user._id
  
      res.render('logged/placeOrder', { orders: true, checkout: true, total, grossTotal, deliveryCharge, userId: req.session.user.user._id, address })
    } else {
      res.redirect('/home');
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})


router.post('/placeOrderCoupon', async (req, res) => {
  try{

    console.log('your placing order right now');
    let products = await userHelper.getCartProlist(req.body.userId)
    console.log('product came here');
    let total = await userHelper.getTotalAmount(req.session.user.user._id)
    console.log(total);
    if (total.length != 0) {
  
      total = total[0].total
     await userHelper.placeOrder(req.body, products, total,).then((orderId) => {
  
        console.log('order placed')
        console.log(orderId);
        if (req.body.paymentMethod === 'COD') {
          res.json({ codSuccess: true })
        } else {
          console.log("hello motto");
         userHelper.generateRazorPay(orderId, total).then((response) => {
            console.log('have  a nice day baby');
            console.log(response);
            res.json(response)
          })
        }
      })
    } else {
      res.json({ status: false })
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }




})

router.post('/PlaceOrder', async (req, res) => {
  try{

    console.log(finalPrice);
    console.log('your placing order right now');
    let products = await userHelper.getCartProlist(req.body.userId)
    console.log('product came here');
    let total = await userHelper.getTotalAmount(req.session.user.user._id)
    total = finalPrice.total
    console.log(total);
    if (total.length != 0) {
  
      // total = total[0].total
     await userHelper.placeOrder(req.body, products, total,finalPrice).then((orderId) => {
  
        console.log('order placed')
        console.log(orderId);
        if (req.body.paymentMethod === 'COD') {
          res.json({ codSuccess: true })
        } else {
          console.log("hello motto");
         userHelper.generateRazorPay(orderId, total).then((response) => {
            console.log('have  a nice day baby');
            console.log(response);
            res.json(response)
          })
        }
      })
    } else {
      res.json({ status: false })
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }




})




router.get('/deleteCusineCart/:productId', (req, res, next) => {
  // try{
      userHelper.deleteCusineCart(req.params.productId,req.session.user.user._id).then((response)=>{
        res.redirect('/orders')
      }).catch((err)=>{
        res.render('logged/ServerError',{err:true})
      })
        
  // }catch(e) {
  //   res.render('logged/ServerError',{err:true})
  // }
  

})


router.get('/addAddress', verifyLoggedIn, (req, res, next) => {
try{

  res.render('logged/addAddress', { orders: true })
}catch(err){
  res.render('logged/ServerError',{err:true})
}
})
router.get('/addAddressProfile', verifyLoggedIn, (req, res, next) => {
try{

  res.render('logged/addAddress', { orders: true, fromProfile: true })
}catch(err){
  res.render('logged/ServerError',{err:true})
}
})
router.post('/addAddress', verifyLoggedIn, (req, res, next) => {
  try{

    userHelper.addAddress(req.body, req.session.user.user._id).then(() => {
      res.redirect('/orders')
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})
router.post('/addAddressProfile', verifyLoggedIn, (req, res, next) => {
  try{

    userHelper.addAddress(req.body, req.session.user.user._id).then(() => {
      res.redirect('/Profile')
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})
router.get('/placed', verifyLoggedIn, (req, res, next) => {
  try{

    res.render('logged/orderPlaced', { orders: true })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
router.get('/viewAddress', verifyLoggedIn, async (req, res, next) => {
  try{

    let address = await userHelper.getUserAllAddress(req.session.user.user._id)
    res.render('logged/showAddress', { orders: true, address, orderAddress: true })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
router.get('/viewAddressOrders', verifyLoggedIn, async (req, res, next) => {
  try {

    console.log('  hello motto');
    let address = await userHelper.getUserAllAddressOrders(req.session.user.user._id)
    res.render('logged/showAddress', { orders: true, address, profileAddress: true })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})

router.post('/chageDefault/:id', verifyLoggedIn, (req, res, next) => {
  try{

    userHelper.changeDefault(req.body, req.params.id, req.session.user.user._id).then(() => {
      res.redirect('/Profile')
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
router.post('/chageDefaultProfile/:id', verifyLoggedIn, (req, res, next) => {
  try{

    userHelper.changeDefault(req.body, req.params.id, req.session.user.user._id).then(() => {
      res.redirect('/orders')
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})

router.post('/verifyPayment', (req, res) => {
  try{

    console.log('verifyPayment')
    console.log(req.body);
    userHelper.verifyPayment(req.body, req.session.user.user._id,finalPrice).then(() => {
      userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
        console.log('payment done happy ayee');
        res.json({ status: true })
  
      })
    }).catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: '' })
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})

router.get('/userProfile', verifyLoggedIn, (req, res) => {
  try{

    res.render('logged/ProfileDashBoard', { Profile: true })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
router.get('/Profile', verifyLoggedIn, async (req, res) => {
  try{

    let userDetails = await userHelper.userDetails(req.session.user.user._id)
    console.log('have a nice');
    console.log(userDetails);
    let address = await userHelper.getUserAddress(req.session.user.user._id)
    address = address[0];
    console.log(address);
    let WalletAmount=await userHelpers.getWalletAmount(req.session.user.user._id)
    walletAmount=WalletAmount.amount
    console.log('have a wallet in your pocket');
    console.log(walletAmount);
    res.render('logged/Profile', { Profile: true, userDetails, address,walletAmount})
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
router.get('/finalOrders', verifyLoggedIn, async (req, res) => {
  try{

    let ordersHistory = await userHelper.getAllOrders(req.session.user.user._id)
    console.log('have a nice ORDER BABY');
    console.log(ordersHistory);
    res.render('logged/finOrders', { Profile: true, ordersHistory })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})

router.get("/deleteAddress/:id", verifyLoggedIn, (req, res) => {
  try{

    userHelper.DeleteAddress(req.params.id, req.session.user.user._id).then(() => {
      res.redirect('/viewAddress')
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})
router.get("/deleteAddressProfile/:id", verifyLoggedIn, (req, res) => {
  try{

    console.log(req.params.id);
    userHelper.DeleteAddress(req.params.id, req.session.user.user._id).then(() => {
      res.redirect('/viewAddress')
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})

router.get("/editUser", verifyLoggedIn, async (req, res) => {
  try{

    console.log(req.session.user.user._id);
    let userDetails = await userHelper.userDetails(req.session.user.user._id)
  
    console.log(userDetails);
    res.render('logged/editUser', { Profile: true, userDetails })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})

router.post("/forgotPass", async (req, res) => {
  try{

    let userdetails = await userHelper.forgotPassword(req.body)
    console.log('user ja ga habasd');
    console.log(userdetails);
    if (userdetails.status === true) {
      res.render('logged/otpVerify', { user: true, userdetails, password: true })
    }
  
    else {
      res.redirect('/editUser')
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})

router.post("/verifyPassOtp/:Phone", async (req, res) => {
  try{

    let phone = req.params.Phone
    let userdetails = await userHelper.verifyOtpPass(req.body, phone)
  
    if (userdetails.status === true) {
      console.log('otp verified');
  
      res.render('logged/resetPasss', { user: true, userdetails })
    } else {
      console.log(userdetails);
      console.log('otp not verified')
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})

router.post("/reEnterPassword/:phone", (req, res) => {
  try{

    let phone = req.params.phone;
    userHelper.updatePassword(req.body, phone).then((response) => {
      if (response.status === true) {
        res.redirect('/')
      } else {
        res.redirect('/profile')
      }
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})

router.get('/cancelOrder/:id/:total/:user/:paymentMethod/:status', (req, res) => {
  try{

    let orderId = req.params.id;
    let totalAmount = req.params.total;
    let userId = req.params.user;
    let paymentMethod = req.params.paymentMethod
    let status = req.params.status;
    console.log(totalAmount);
    console.log(orderId);
  
    userHelper.changeOrderStatus(orderId, totalAmount, userId, paymentMethod, status).then(() => {
      console.log('order Return ayache');
      res.redirect('/finalOrders')
  
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
})

router.get('/productsViewOrders/:productsId',verifyLoggedIn, async(req, res) => {
  try{

    let orderedid = req.params.productsId;
    console.log('productsid');
    let userDetails = await userHelpers.viewOrderdProducts(orderedid)
    if (userDetails) {
      console.log('have detti sunday');
      console.log(userDetails);
      res.render('logged/viewOrderedProducts', { orders: true, userDetails })
    } else {
      res.render('logged/viewOrderedProducts', { orders: true })
    }
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})
router.get('/editUserDetails',verifyLoggedIn,async (req, res) => {
  try{

    let userid = req.session.user.user._id
    console.log(userid);
    await userHelpers.viewUserId(userid).then((userDetails) => {
  
      if (!userDetails.err) {
        console.log(userDetails);
        res.render('logged/editUserDetails', { user: true, userDetails })
      } else {
        res.render('logged/editUserDetails', { order: true, userNotExist: false })
      }
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }

})


router.post('/confirmUser/:userId',async(req, res) => {
  try{

    userHelper.confirmUser(req.body,req.params.userId).then((response)=>{
      if(response.status) {
      res.redirect('/editUserDetails')
      }
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
});

let userEditDetails
router.post('/verifyAcc',(req, res) => {
  try{

    console.log('have a nice dat');
    userEditDetails=req.body
    console.log('have a nice day');
    console.log(userEditDetails);
  userHelpers.authenticatePassword(req.body)
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
});

router.post('/authenticateOtp',(req, res) => {
  try{

    userHelpers.verifyOtpEditProfile(req.body,userEditDetails,req.session.user.user._id).then((response)=>{
     if(response.status) {
      res.redirect('/Profile')
     }else{
      res.send('have  a beaty dead day')
     }
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
});

router.get('/changePassword',verifyLoggedIn,(req, res) => {
  try{

    res.render('logged/editPass', { user: true })
  }
  catch(err){
    res.render('logged/ServerError',{err:true})
  }

})

router.post('/changePassword',(req, res) => {
  try{

    userHelpers.changePasswordProfile(req.body,req.session.user.user._id).then((response)=>{
     if(response.status) {
      // req.session.user.user=null;
      res.redirect('/home')
     }else{
      res.send('have  a beaty dead day')
     }
    })
  }catch(err){
    res.render('logged/ServerError',{err:true})
  }
  });

  
    router.get('/selectRestaurant/:id',async(req, res, next)=>{
      try{
        let RestaurantId=req.params.id
        let restaurantCount= await userHelper.getRestaurantCount()
        let restaurantNames= await userHelper.getRestaurantDet()
        let banners =await userHelper.getBanners()
        console.log('hello banners',banners,'have a nice banners');
        let Carousal=banners[0].name
        console.log(banners,'have a nice banners');   
        console.log(restaurantNames,'have eeee asjndas sdj');
          if (req.session.user) {
            let cartCount = await userHelper.getCartCount(req.session.user.user._id)
            userHelper.getSelectedCusines(RestaurantId).then((response) => {
              console.log(response);
              res.render('logged/logged', { user: true, log: req.session.user, response, cartCount,restaurantCount,restaurantNames,Carousal,selectedRestaurant:true})
            }).catch((err)=>{
              res.render('logged/ServerError',{err:true})
            })

          }
          else {
            userHelper.getSelectedCusines(RestaurantId).then((response) => {
              res.render('logged/logged', { user: true, guest: true, response,restaurantCount,restaurantNames,Carousal,selectedRestaurant:true})
            }).catch((err)=>{
              res.render('logged/ServerError',{err:true})
            })
          }
      }catch(err){
        res.render('logged/ServerError',{err:true})
      }
      })








module.exports = router;
