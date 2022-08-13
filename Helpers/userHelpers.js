var db = require('../database-config/connection')
var collections = require('../database-config/collections')
const client = require('twilio')(collections.accoundSID, collections.authToken);
var bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const { ObjectId } = require('mongodb');
let Razorpay = require('razorpay');
let moment = require('moment');
const { log } = require('node:console');
const { resolve } = require('node:path');
var instance = new Razorpay({
    key_id: 'rzp_test_fpNxRVRbM7kSGz',
    key_secret: 'AVXkAaGJPgZoVlxr8s0gbeXU',
});
let _ = require('lodash');

module.exports = {



    Signup: (userBody) => {
        console.log(userBody);

        return new Promise(async (resolve, reject) => {


            let response = {};
            let userExist = await db.get().collection(collections.USER_COLLECTION).findOne({ $or: [ {Email:userBody.Email},{Phone: userBody.Phone,} ] })



            if (userExist ) {
                if (userExist.Email == userBody.Email) {
                    console.log("email already Exist");
                    response.status = 'userExist'
                    response.signupStatus = false
                    response.emailExist = true
                    resolve({ emailExist: true })
                } else {
                    resolve({ phoneNumber: true })
                }
            } else {



                console.log("user entered otp");
                userBody.blockStatus = true
                userBody.Password = await bcrypt.hash(userBody.Password, 10)
                response.status = true;
                response = userBody;

                client.verify.services(collections.ServiceId).verifications.create(
                    {
                        to: `+91${response.Phone}`,
                        channel: 'sms'
                    }).then((data) => {

                    }).catch((err) => {
                        reject(err)
                    })
                }
                resolve(response)
                
        })


    },
    signupOtp: (otp, userDetails) => {

        return new Promise((resolve, reject) => {

            let response = {};
            client.verify.services(collections.ServiceId)
                .verificationChecks
                .create({
                    to: `+91${userDetails.Phone}`,
                    code: otp.otp
                })
                .then((verification_check) => {

                    if (verification_check.status == 'approved') {

                        db.get().collection(collections.USER_COLLECTION).insertOne(userDetails).then(async (data) => {
                            let wallet = {
                                userId: data.insertedId,
                                amount: 0
                            }
                            await db.get().collection(collections.WALLET_COLLECTION).insertOne(wallet).then
                            resolve(userDetails)
                        })
                    } else {
                        response.err = 'Otp Is Not Valid';

                        resolve(response)
                    }
                });
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {

                if (user.blockStatus) {
                    bcrypt.compare(userData.Password, user.Password).then((status) => {
                        if (status) {

                            response.user = user;
                            response.status = true;
                            resolve(response)
                        } else {

                            resolve({ status: false })
                        }
                    })
                } else {
                    response.blockStatus = "user is blocked";
                    resolve(response)
                }
            } else {
                resolve({ status: false, notExist: true })
            }
        })
    },
    getAllCusines: () => {

        return new Promise(async (resolve, reject) => {
            let cusines = await db.get().collection(collections.CUSINE_COLLECTION).find({ inStock: true }).toArray()
            resolve(cusines);

        })
    },
    getSelectedCusines: (restaurantId) => {
        console.log(restaurantId);
        console.log('ha ve a ');
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CUSINE_COLLECTION).find({ RestaurantId: ObjectId(restaurantId) }).toArray().then((cusines) => {
                console.log('im still here');
                console.log(cusines), 'have a nide day';
                resolve(cusines);
            }).catch((err) => {
                console.log('error is here');
                reject(err)
            })








        })
    },
    addToCart: (productId, userId) => {
        let productObj = {
            item: ObjectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
            if (userCart) {
                let productExist = userCart.Products.findIndex(Products => Products.item == productId)
                if (productExist != -1) {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ userId: ObjectId(userId), 'Products.item': ObjectId(productId) },
                        {
                            $inc: { 'Products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {

                    db.get().collection(collections.CART_COLLECTION).updateOne({ userId: ObjectId(userId) }, {

                        $push: {
                            Products: productObj
                        }
                    })

                        .then(() => {
                            resolve()

                        })
                }
            }
            else {
                let cartObj = {
                    userId: ObjectId(userId),
                    Products: [productObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((data) => {
                    resolve()
                })

            }

        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let Cart = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { userId: ObjectId(userId) }

                }, {
                    $unwind: '$Products'
                },
                {
                    $project: {
                        userId: ObjectId(userId),
                        item: '$Products.item',
                        quantity: '$Products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collections.CUSINE_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "Products"
                    }
                }, {
                    $project: {
                        item: 1, quantity: 1, Products: { $arrayElemAt: ['$Products', 0] },
                    }
                }

            ]).toArray()
            // Cart='have a nice day'

            if (Cart.length != 0) {
                resolve(Cart)
            } else {

                resolve()
            }
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            count = null;
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
            if (cart) {
                count = cart.Products.length
            }
            resolve(count)
        })
    },
    changeCusineQuantity: (details) => {

        details.quantity = parseInt(details.quantity)
        details.count = parseInt(details.count)
        return new promise(async (resolve, reject) => {
            let carti = db.get().collection(collections.CART_COLLECTION).updateOne({ _Id: ObjectId(details.cart), 'Products.item': ObjectId(details.product) },
                {
                    $inc: { 'Products.$.quantity': details.count }
                }).then((response) => {
                    resolve({ status: true })
                })
        })
    },
    changeProductCount: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {

                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart) },
                        {
                            $pull: { Products: { item: ObjectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeproduct: true })
                    })
                // if (details.count == -1 && details.quantity == 1) {
                //     db.get().collection(collections.CART_COLLECTON)
                //         .updateOne({ _id: ObjectId(details.cart) },

                //             {
                //                 $pull: { Products: { item: ObjectId(details.product) } }
                //             }
                //         ).then((response) => {
                //             resolve({ removeproduct: true })
                //         })
            } else {
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart), 'Products.item': ObjectId(details.product) },
                        {
                            $inc: { 'Products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }

        })
    },
    getTotalAmount: (userId, couponId = 0) => {
        return new Promise(async (resolve, reject) => {
            if (couponId == 0) {
                console.log('coupon is o');

                let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                    {
                        $match: { userId: ObjectId(userId) }

                    }, {
                        $unwind: '$Products'
                    },
                    {
                        $project: {
                            userId: ObjectId(userId),
                            item: '$Products.item',
                            quantity: '$Products.quantity'
                        }
                    }, {
                        $lookup: {
                            from: collections.CUSINE_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: "Products",

                        }
                    }, {
                        $project: {
                            item: 1, quantity: 1, Products: { $arrayElemAt: ['$Products', 0] },
                        }
                    },

                    {
                        $group: {
                            _id: null,

                            total: { $sum: { $multiply: ['$quantity', '$Products.Price'] } }
                        }
                    }

                ]).toArray()

                resolve(total)
            } else {
                console.log('coupon is not zero');

                let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                    {
                        $match: { userId: ObjectId(userId) }

                    }, {
                        $unwind: '$Products'
                    },
                    {
                        $project: {
                            userId: ObjectId(userId),
                            item: '$Products.item',
                            quantity: '$Products.quantity'
                        }
                    }, {
                        $lookup: {
                            from: collections.CUSINE_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: "Products",

                        }
                    }, {
                        $project: {
                            item: 1, quantity: 1, Products: { $arrayElemAt: ['$Products', 0] },
                        }
                    },

                    {
                        $group: {
                            _id: null,

                            total: { $sum: { $multiply: ['$quantity', '$Products.Price'] } }
                        }
                    }

                ]).toArray()

                await db.get().collection(collections.COUPON_COLLECTION).findOne({ couponId: couponId }).then(async (response) => {

                    console.log(response.usedUser.length, 'have dead day');


                    if (response.usedUser.length != 0) {

                        let ExistUser = response.usedUser.includes(userId)

                        console.log(ExistUser);

                        if (!ExistUser) {

                            if (response.count >= 0) {

                                resolve({ status: false })
                            } else {
                                if (moment().format() > response.expiryDate) {

                                    resolve({ expiration: false })
                                } else {
                                    total[0].discount = response

                                    resolve({ total, status: true })
                                }
                            }
                        } else {
                            resolve({ userExist: true, status: false })
                        }
                    } else {

                        if (response.count >= 0) {

                            resolve({ status: false })
                        } else {
                            if (moment().format() > response.expiryDate) {

                                resolve({ expiration: false })
                            } else {
                                total[0].discount = response

                                resolve({ total, status: true })
                            }
                        }
                    }

                }).catch((err) => {
                    console.log(err);
                    resolve({ status: false })
                })



            }


        })
    },

    placeOrder: (order, products, total, couponDetails) => {

        return new Promise(async (resolve, reject) => {
            let status = order.paymentMethod === 'COD' ? 'Placed' : 'Pending';
            date = new Date()
            year = date.getFullYear()
            month = date.getMonth()
            date = date.getDate()
            let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            let orderId
            orderObj = {
                Orderdate: date + '/' + months[month] + '/' + year,
                total: total,
                address: {
                    customer: order.customer,
                    place: order.place,
                    district: order.district,
                    pincode: order['Pin-zip'],

                },
                contact: order.mobile,
                userId: ObjectId(order.userId),
                paymentMethod: order.paymentMethod,
                Products: products,
                status: status,
                cancelStatus: true,
                orderStatus: "Complete payment"

            }
            await db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then(async (response) => {

                orderId = response.insertedId

                if (order.paymentMethod === 'COD') {
                    await db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: orderId }, {
                        $set: {
                            cancelStatus: false,
                            orderStatus: "being prepared"
                        }

                    })

                    if (couponDetails.couponStatus) {
                        let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({ couponId: couponDetails.couponDetails.couponId })

                        await db.get().collection(collections.COUPON_COLLECTION).updateOne({ couponId: couponDetails.couponDetails.couponId }, {

                            $inc: {
                                Count: -1
                            },
                            $push: {
                                usedUser: couponDetails.user
                            }

                        })
                    }

                    db.get().collection(collections.CART_COLLECTION).deleteOne({ userId: ObjectId(order.userId) })


                }


                let restaurantOrders = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: ObjectId(orderId) },
                    },
                    {
                        $unwind: '$Products'
                    }, {
                        $project: {
                            item: '$Products.item',
                            quantity: '$Products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.CUSINE_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: "Products"
                        }
                    }, {
                        $project: {
                            item: 1, quantity: 1, Products: { $arrayElemAt: ['$Products', 0] },
                        }
                    },

                ]).toArray();


                const restaurantOrdersIds = await restaurantOrders.map((order) => ObjectId(order.Products.RestaurantId))


                var restaurantOrdersArray = _(restaurantOrders)
                    .groupBy('Products.RestaurantId')
                    .map(function (items, id) {
                        return {
                            restaurantId: id,
                            products: _.map(items, (item) => { return { orderId, item: item.item, quantity: item.quantity } })

                        };
                    }).value()
                console.log(restaurantOrdersArray, 'have a nice arrayu');
                restaurantOrdersArray.map(order => {
                    db.get().collection(collections.RESTAURANT_COLLECTION).updateOne({
                        _id: ObjectId(order.restaurantId)
                    },
                        {
                            $push: { orders: order.products }
                        },
                        { upsert: true })
                })
            })

            resolve(orderId);
        })


    },
    getCartProlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.CART_COLLECTION).findOne({ userId: ObjectId(userId) })

            if (products != null) {

                resolve(products.Products)
            }
            else {

                resolve()
            }
        })

    },
    addAddress: (address, userId, addressId) => {

        return new Promise(async (resolve, reject) => {
            let userAddress = await db.get().collection(collections.ADDRESS_COLLECTION).findOne({ userId: ObjectId(userId) })

            if (userAddress) {

                address.def = false
                address.addressId = ObjectId(address._id);


                db.get().collection(collections.ADDRESS_COLLECTION).updateOne({ userId: ObjectId(userId) }, {

                    $push: {
                        address: address
                    }
                })

                    .then(() => {
                        resolve()

                    })

            }
            else {
                address.def = true;
                address.addressId = ObjectId(addressId);
                let addressObj = {
                    userId: ObjectId(userId),
                    address: [address]
                }

                db.get().collection(collections.ADDRESS_COLLECTION).insertOne(addressObj).then((data) => {
                    resolve()
                })

            }

        })
    },
    getUserAddress: (userId) => {

        return new Promise(async (resolve, reject) => {
            let userAddress = await db.get().collection(collections.ADDRESS_COLLECTION).aggregate([
                {
                    $match: {
                        userId: ObjectId(userId)
                    }
                }, {
                    $unwind: {
                        path: "$address"
                    }
                }, {
                    $match: {
                        'address.def': true
                    }
                }
            ]).toArray()


            resolve(userAddress);


        })
    },
    getUserAllAddress: (userId) => {

        return new Promise(async (resolve, reject) => {
            let userAddress = await db.get().collection(collections.ADDRESS_COLLECTION).aggregate([
                {
                    $match: {
                        userId: ObjectId(userId)
                    }
                }, {
                    $unwind: {
                        path: "$address"
                    }
                }
            ]).toArray()


            resolve(userAddress);


        })
    },
    getUserAllAddressOrders: (userId) => {

        return new Promise(async (resolve, reject) => {
            let userAddress = await db.get().collection(collections.ADDRESS_COLLECTION).aggregate([
                {
                    $match: {
                        userId: ObjectId(userId)
                    }
                }, {
                    $unwind: {
                        path: "$address"
                    }
                }
            ]).toArray()


            resolve(userAddress);


        })
    },
    changeDefault: (address, arrayIndex, userId) => {

        return new Promise(async (resolve, reject) => {
            let userAddress = await db.get().collection(collections.ADDRESS_COLLECTION).findOne({ userId: ObjectId(userId) })

            if (userAddress) {
                db.get().collection(collections.ADDRESS_COLLECTION).updateOne({ userId: ObjectId(userId), 'address.def': true }, {
                    $set: {
                        "address.$.def": false
                    }
                })
                db.get().collection(collections.ADDRESS_COLLECTION).updateOne({ userId: ObjectId(userId), 'address.addressId': ObjectId(address.addressId) }, {
                    $set: {
                        "address.$.def": true
                    }
                })


                //      address.def=true;


                //       db.get().collection(collections.ADDRESS_COLLECTION).updateOne({ userId: ObjectId(userId) }, {

                //           $push: {
                //               address: address
                //           }
                //       })

                //           .then(() => {
                //               resolve()

                //           })

                resolve()
            }







        })
    },
    generateRazorPay: (orderId, total) => {

        // total = total + total * .05
        total = parseFloat(total)

        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }).then((response) => {

                resolve(response)
            }).catch((err) => {

                resolve(err)
            })
        })
    },
    verifyPayment: (orderDetails, userId, couponDetails) => {

        return new Promise(async (resolve, reject) => {
            const hash = crypto.createHmac('sha256', 'AVXkAaGJPgZoVlxr8s0gbeXU')
                .update(orderDetails['payment[razorpay_order_id]'] + '|' + orderDetails['payment[razorpay_payment_id]'])
                .digest('hex');

            if (hash === orderDetails['payment[razorpay_signature]']) {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderDetails['order[receipt]']) }, {
                    $set: {
                        cancelStatus: false,
                        orderStatus: 'Being Prepared'
                    }
                })
                db.get().collection(collections.CART_COLLECTION).deleteOne({ userId: ObjectId(userId) })
                resolve()

                if (couponDetails.couponStatus) {
                    let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({ couponId: couponDetails.couponDetails.couponId })

                    await db.get().collection(collections.COUPON_COLLECTION).updateOne({ couponId: couponDetails.couponDetails.couponId }, {

                        $inc: {
                            Count: -1
                        },
                        $push: {
                            usedUser: couponDetails.user
                        }

                    })
                }
            }
            else {
                reject()
            }
        })
    },
    changePaymentStatus: (receipt) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(receipt) }, {
                $set: {
                    status: "Placed"
                }
            }).then(() => {
                resolve();
            })
        })
    },
    DeleteAddress: (addressId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userExist = await db.get().collection(collections.ADDRESS_COLLECTION).findOne({ userId: ObjectId(userId) })
            if (userExist) {
                db.get().collection(collections.ADDRESS_COLLECTION).updateOne({ userId: ObjectId(userId) }, {
                    $pull: {
                        address: { addressId: ObjectId(addressId) }
                    }

                }).then(() => {
                    resolve()
                })
            } else {
                resolve({ userExist: false })
            }
        })
    },
    userDetails: (userId) => {

        return new Promise(async (resolve, reject) => {
            let userExist = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) })

            resolve(userExist)

        })
    },
    getAllOrders: (userId) => {

        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.get().collection(collections.ORDER_COLLECTION).find({ userId: ObjectId(userId) }).toArray();
            // orderDetails.toArray()
            resolve(orderDetails);
        })
    },
    forgotPassword: (userId) => {

        return new Promise(async (resolve, reject) => {
            let userExist = await db.get().collection(collections.USER_COLLECTION).findOne({ Email: userId.Email })
            if (userExist) {
                client.verify.services(collections.ServiceId).verifications.create(
                    {
                        to: `+91${userExist.Phone}`,
                        channel: 'sms'
                    }).then((data) => {

                    })
                resolve({ userExist, status: true })
            } else {
                resolve({ status: false })
            }

        })
    },
    verifyOtpPass: (passOtp, phone) => {
        return new Promise(async (resolve, reject) => {
            client.verify.services(collections.ServiceId)
                .verificationChecks
                .create({
                    to: `+91${phone}`,
                    code: passOtp.otp
                })
                .then(async (verification_check) => {

                    if (verification_check.status == 'approved') {

                        let userExist = await db.get().collection(collections.USER_COLLECTION).findOne({ Phone: phone })

                        resolve({ userExist, status: true })

                    } else {
                        response.err = 'Otp Is Not Valid';

                        resolve(response)
                    }
                });
        })
    },
    updatePassword: (password, phone) => {

        return new Promise(async (resolve, reject) => {
            password.Password = await bcrypt.hash(password.Password, 10)


            await db.get().collection(collections.USER_COLLECTION).updateOne({ Phone: phone }, {
                $set: {
                    Password: password.Password
                }
            }).then(() => {

                resolve({ status: true })
            }).catch((err) => {

                resolve({ status: false })
            })
        })
    },
    changeOrderStatus: (orderId, totalAmount, userId, paymentMethod, status) => {
        totalAmount = parseInt(totalAmount);

        onlinePayment = 'onlinePayment'


        return new Promise((resolve, reject) => {
            if (paymentMethod == onlinePayment) {

                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                    $set: {
                        status: "Refunded",
                        orderStatus: "Cancelled",
                        cancelStatus: true
                    }
                }, { upsert: true }).then(async () => {

                    await db.get().collection(collections.WALLET_COLLECTION).updateOne({ userId: ObjectId(userId) }, {
                        $inc: { amount: totalAmount }
                    })
                    resolve();
                })
            } else {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                    $set: {
                        status: "COD",
                        orderStatus: "Cancelled",
                        cancelStatus: true
                    }
                }, { upsert: true }).then(async () => {
                    resolve()
                })
            }
        })

    },
    viewOrderdProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderedItems = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: '$Products'
                },
                {
                    $project: {
                        item: '$Products.item',
                        quantity: '$Products.quantity',
                        total: 1,
                        paymentMethod: 1

                    }
                },

                {
                    $lookup: {
                        from: collections.CUSINE_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'Products'
                    }
                }, {
                    $unwind: '$Products'
                }




            ]).toArray()

            resolve(orderedItems)
        })

    },
    viewUserId: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
                .then((userDetails) => {
                    resolve(userDetails)
                }).catch((err) => {
                    resolve({ err, userStatus: false })
                })

        })

    },
    confirmUser: (Password, userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            if (user) {
                bcrypt.compare(Password.Password, user.Password).then((status) => {
                    if (status) {
                        console.log('password matched');
                        resolve({ status: true })
                    } else {
                        console.log('password not matched');
                        resolve({ status: false })
                    }
                })
            }
        })
    },
    authenticatePassword: (userExist) => {

        return new Promise(async (resolve, reject) => {


            client.verify.services(collections.ServiceId).verifications.create(
                {
                    to: `+91${userExist.Phone}`,
                    channel: 'sms'
                }).then((data) => {

                })
            resolve({ userExist, status: true })


        })
    }, verifyOtpEditProfile: (otp, userDetails, userId) => {

        return new Promise(async (resolve, reject) => {

            client.verify.services(collections.ServiceId)
                .verificationChecks
                .create({
                    to: `+91${userDetails.Phone}`,
                    code: otp.Otp
                })
                .then(async (verification_check) => {

                    if (verification_check.status == 'approved') {

                        await db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                            $set: {
                                FirstName: userDetails.FirstName,
                                LastName: userDetails.LastName,
                                Email: userDetails.Email,
                                Phone: userDetails.Phone,
                            }
                        })


                        resolve({ status: true })

                    } else {


                        resolve({ status: false })
                    }
                });

        })
    },
    changePasswordProfile: (newPass, userId) => {

        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            bcrypt.compare(newPass.Password, user.Password).then(async (status) => {
                if (status) {
                    newPass.newPassword = await bcrypt.hash(newPass.newPassword, 10)
                    db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                        $set: {
                            Password: newPass.newPassword
                        }
                    }).then(() => {
                        resolve({ status: true })
                    })
                } else {

                    resolve({ status: false })
                }
            })
        })
    },
    getWalletAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let Wallet = await db.get().collection(collections.WALLET_COLLECTION).findOne({ userId: ObjectId(userId) })
            resolve(Wallet)
        })
    },
    getRestaurantCount: () => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collections.RESTAURANT_COLLECTION).count()

            resolve(count)
        })
    },
    getRestaurantDet: () => {
        return new Promise(async (resolve, reject) => {
            let det = await db.get().collection(collections.RESTAURANT_COLLECTION).find().toArray()

            resolve(det)
        })

    },
    getBanners: () => {
        return new Promise(async (resolve, reject) => {
            let banners = await db.get().collection(collections.BANNER_COLLECTION).find().toArray()
            resolve(banners)
        })
    },
    deleteCusineCart: (productId, userId) => {


        console.log(productId, userId, 'hello mornign');
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION)
                .updateOne({ userId: ObjectId(userId) },
                    {
                        $pull: { Products: { item: ObjectId(productId) } }
                    }
                ).then((response) => {
                    resolve({ removeproduct: true })
                }).catch((error) => {
                    reject(error)
                })

        })

    }
}
