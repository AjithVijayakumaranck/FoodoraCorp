var db = require('../database-config/connection')
var collections = require('../database-config/collections')
const client = require('twilio')(collections.accoundSID, collections.authToken);
var bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { toArray } = require('lodash');
const objectId = require("mongodb").ObjectId;

module.exports = {

    addCusines: (cusineDetails, filename, RestaurantDetails) => {

        return new Promise((resolve, reject) => {
            cusineDetails.RestaurantId = ObjectId(RestaurantDetails.admin._id)
            cusineDetails.image = filename;
            cusineDetails.inStock = true;
            cusineDetails.Price = parseInt(cusineDetails.Price)
            cusineDetails.Restaurant = RestaurantDetails
            // cusineDetails.SubCat.toArray()
            db.get().collection(collections.CUSINE_COLLECTION).insertOne(cusineDetails).then(() => {
                resolve({ status: true });
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getCusines: (restaurantId) => {
        let resId = restaurantId.admin._id


        return new Promise(async (resolve, reject) => {
            const cusineDetails = await db.get().collection(collections.CUSINE_COLLECTION).find({ RestaurantId: ObjectId(resId) }).toArray()

            resolve(cusineDetails)

        })
    },
    stockCusine: (cusineId) => {
        return new Promise(async (resolve, reject) => {
            let cusine = await db.get().collection(collections.CUSINE_COLLECTION).findOne({ _id: objectId(cusineId) })
            if (cusine) {
                if (cusine.inStock) {
                    cusine.inStock = false
                    db.get().collection(collections.CUSINE_COLLECTION).updateOne({ _id: objectId(cusineId) }, { $set: { inStock: cusine.inStock } })
                        .then((data) => {
                            resolve({ status: true })
                        })

                } else {
                    cusine.inStock = true
                    db.get().collection(collections.CUSINE_COLLECTION).updateOne({ _id: objectId(cusineId) }, { $set: { inStock: cusine.inStock } })
                        .then((data) => {
                            resolve({ status: false })
                        })
                }
            }
        })
    },
    DeleteCusine: (CusineId) => {
        return new Promise(async (resolve, reject) => {


            db.get().collection(collections.CUSINE_COLLECTION).deleteOne({ _id: objectId(CusineId) }).then((data) => {
                resolve({ status: true })
            })

        })
    },
    addRequest: (advDetails) => {
        return new Promise(async (resolve, reject) => {

        })

    },
    login: (superAdminDetails) => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collections.RESTAURANT_COLLECTION).findOne({ Email: superAdminDetails.Email })

            if (admin) {
                console.log(('admin is here'));
                if (admin.blockStatus) {

                    response = {};
                    bcrypt.compare(superAdminDetails.Password, admin.Password).then((status) => {
                        if (status) {

                            response.admin = admin;
                            response.status = true;
                            resolve(response)
                        } else {

                            resolve({ status: false })

                        }
                    })
                } else {
                    console.log('admin.is ther');
                    resolve({ status: false, blocked: true })
                }
            } else {
                console.log('admin is not here');
                resolve({ status: false, loginError: true })
            }

        })

    },
    getAllOrders: (restaurantDetails) => {

        let restaurantOrders = []
        let restaurantId = restaurantDetails.admin._id

        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        let Todaydate = day + '/' + months[month] + '/' + year;
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.RESTAURANT_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectId(restaurantId)
                    }
                }, {
                    $unwind: '$orders'
                }, {
                    $unwind: '$orders'
                }, {
                    $project: {
                        orderId: '$orders.orderId',
                        item: '$orders.item',
                        quantity: '$orders.quantity'
                    }
                }, {

                    $lookup: {
                        from: collections.CUSINE_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "Products"
                    }
                }, {
                    $lookup: {
                        from: collections.ORDER_COLLECTION,
                        localField: 'orderId',
                        foreignField: '_id',
                        as: "orderDetails"
                    }
                }
            ]).toArray()
            //    console.log('hello');g
            resolve(products)
            // let products =




        })
    },

    totalOrdersCheckOuts: (restaurantDetails) => {

        let restaurantOrders = []
        let restaurantId = restaurantDetails

        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        let Todaydate = day + '/' + months[month] + '/' + year;
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.RESTAURANT_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectId(restaurantId)
                    }
                }, {
                    $unwind: '$orders'
                }, {
                    $unwind: '$orders'
                }, {
                    $project: {
                        orderId: '$orders.orderId',
                        item: '$orders.item',
                        quantity: '$orders.quantity'
                    }
                }, {

                    $lookup: {
                        from: collections.CUSINE_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "Products"
                    }
                }, {
                    $lookup: {
                        from: collections.ORDER_COLLECTION,
                        localField: 'orderId',
                        foreignField: '_id',
                        as: "orderDetails"
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1
                    }
                }, {
                    $group: {
                        _id: null,
                        total: { $sum: '$quantity' }
                    }
                }
            ]).toArray()
            console.log(products);
            resolve(products)
            // let products =




        })
    },
    totalrazorPay: (restaurantDetails) => {

        let restaurantOrders = []
        let restaurantId = restaurantDetails

        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        let Todaydate = day + '/' + months[month] + '/' + year;
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.RESTAURANT_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectId(restaurantId)
                    }
                }, {
                    $unwind: '$orders'
                }, {
                    $unwind: '$orders'
                }, {
                    $project: {
                        orderId: '$orders.orderId',
                        item: '$orders.item',
                        quantity: '$orders.quantity'
                    }
                }, {

                    $lookup: {
                        from: collections.CUSINE_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "Products"
                    }
                }, {
                    $lookup: {
                        from: collections.ORDER_COLLECTION,
                        localField: 'orderId',
                        foreignField: '_id',
                        as: "orderDetails"
                    }
                },
                {
                    $project: {
                        orderDetails: 1
                    }
                }, {
                    $unwind: '$orderDetails'
                },
                {
                    $project: { paymentMethod: '$orderDetails.paymentMethod', total: '$orderDetails.total' }

                }

                , {
                    $group: {
                        _id: '$paymentMethod',
                        total: {
                            $sum: '$total'
                        }

                    }
                }, {
                    $sort: { _id: -1 }
                }
            ]).toArray()
            console.log(products);
            resolve(products)
            // let products =




        })
    },
    changeStatus: (status, orderId) => {
        console.log('boom baam bigil');
        console.log(orderId);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                $set: {

                    orderStatus: status

                }
            }, { upsert: true })
            resolve({ success: true })
        })

    },
    salesReport: (restaurantDetails) => {

        let restaurantOrders = []
        let restaurantId = restaurantDetails.admin._id

        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        let Todaydate = day + '/' + months[month] + '/' + year;
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.RESTAURANT_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectId(restaurantId)
                    }
                }, {
                    $unwind: '$orders'
                }, {
                    $unwind: '$orders'
                }, {
                    $project: {
                        orderId: '$orders.orderId',
                        item: '$orders.item',
                        quantity: '$orders.quantity'
                    }
                }, {

                    $lookup: {
                        from: collections.CUSINE_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: "Products"
                    }
                }, {
                    $lookup: {
                        from: collections.ORDER_COLLECTION,
                        localField: 'orderId',
                        foreignField: '_id',
                        as: "orderDetails"
                    }
                }, {
                    $unwind: '$Products'
                },
                {
                    $unwind: '$orderDetails'
                }, {
                    $group: {
                        _id: { productName: '$Products.cusineName', Price: '$Products.Price', date: '$orderDetails.Orderdate' },
                        totalAmount: { $sum: { $multiply: [{ $toInt: "$Products.Price" }, '$quantity'] } },
                        total: {
                            $sum: '$quantity'
                        }
                    }
                }
            ]).toArray()
            console.log(products, 'hello dear')
            resolve(products)
            // let products =




        })
    }


}

