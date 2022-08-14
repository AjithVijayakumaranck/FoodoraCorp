const { response } = require("express");
const collection = require("../database-config/collections");
const db = require("../database-config/connection")
require('dotenv').config();
let bcrypt = require("bcrypt");
let moment = require('moment');
const { ObjectId } = require("mongodb");

const objectId = require("mongodb").ObjectId;

module.exports = {

    loginAdmin: (adminDetails) => {
        console.log("adminhere");
        console.log(adminDetails);
        return new Promise(async (resolve, reject) => {
            let response = {};
            loginStatus = false;
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminDetails.Email })
            console.log("jinga admin ");
            console.log(admin);
            if (admin) {
                bcrypt.compare(adminDetails.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log(admin);
                        response.admin = admin;
                        response.status = true;
                        resolve(response)
                    } else {
                        console.log('Login Failed');
                        console.log(response);
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('Login Failed');
                resolve({ status: false })
            }


        })

    },
    addAdmin: (adminDetails) => {

        adminDetails.orders = [];
        return new Promise(async (resolve, reject) => {
            let response = {};
            let Restaurant = await db.get().collection(collection.RESTAURANT_COLLECTION).findOne({ Email: adminDetails.Email })

            console.log("jinga admin ");
            if (!Restaurant) {
                adminDetails.Password = await bcrypt.hash(adminDetails.Password, 10)
                console.log(Restaurant);
                adminDetails.BlockStatus = true;
                db.get().collection(collection.RESTAURANT_COLLECTION).insertOne(adminDetails).then((data) => {
                    response.status = true;
                    response = adminDetails;
                    resolve(response)
                })
            } else {
                console.log('admin entry failed');
                resolve({ status: false })
            }


        })

    },


    getAllRestaurants: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.RESTAURANT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    addCoupons: (couponDetails) => {
        console.log(couponDetails);
        couponDetails.dateCreated = moment().format()
        let expiryDate = moment().add(couponDetails.Validity, 'd')
        couponDetails.Count = parseInt(couponDetails.Count)
        couponDetails.expiryDate = expiryDate.format()
        couponDetails.usedUser = [];
        return new Promise(async (resolve, reject) => {
            let response = {};
            let couponExist = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponId: couponDetails.couponId })
            if (!couponExist) {

                await db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails).then((Response) => {
                    response.status = 200
                    resolve({ response, status: true });
                })
            } else {
                resolve({ status: false });
            }
        })
    },

    getAllAgents: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.AGENTS).find().toArray()
            resolve(products)
        })
    },
    blockStatusres: (resId) => {
        return new Promise(async (resolve, reject) => {
            let Agent = await db.get().collection(collection.RESTAURANT_COLLECTION).findOne({ _id: objectId(resId) })
            if (Agent) {
                if (Agent.blockStatus) {
                    Agent.blockStatus = false
                    db.get().collection(collection.RESTAURANT_COLLECTION).updateOne({ _id: objectId(resId) }, { $set: { blockStatus: Agent.blockStatus } })
                        .then((data) => {
                            resolve({ status: true })
                        })

                } else {
                    Agent.blockStatus = true
                    db.get().collection(collection.RESTAURANT_COLLECTION).updateOne({ _id: objectId(resId) }, { $set: { blockStatus: Agent.blockStatus } })
                        .then((data) => {
                            resolve({ status: false })
                        })
                }
            }
        })
    },

    blockStatus: (AgentId) => {
        return new Promise(async (resolve, reject) => {
            let Agent = await db.get().collection(collection.AGENTS).findOne({ _id: objectId(AgentId) })
            if (Agent) {
                if (Agent.BlockStatus) {
                    Agent.BlockStatus = false
                    db.get().collection(collection.AGENTS).updateOne({ _id: objectId(AgentId) }, { $set: { BlockStatus: Agent.BlockStatus } })
                        .then((data) => {
                            resolve({ status: true })
                        })

                } else {
                    Agent.BlockStatus = true
                    db.get().collection(collection.AGENTS).updateOne({ _id: objectId(AgentId) }, { $set: { BlockStatus: Agent.BlockStatus } })
                        .then((data) => {
                            resolve({ status: false })
                        })
                }
            }
        })
    },

    blockStatusUser: (AgentId) => {
        console.log(AgentId, 'hello user');
        return new Promise(async (resolve, reject) => {
            let Agent = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(AgentId) })
            console.log(Agent);
            if (Agent) {
                if (Agent.blockStatus) {
                    Agent.blockStatus = false
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(AgentId) }, { $set: { blockStatus: Agent.blockStatus } })
                        .then((data) => {
                            resolve({ status: true })
                        })

                } else {
                    Agent.blockStatus = true
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(AgentId) }, { $set: { blockStatus: Agent.blockStatus } })
                        .then((data) => {
                            resolve({ status: false })
                        })
                }
            }
        })
    },
    DeleteRestaurants: (ResId) => {
        return new Promise(async (resolve, reject) => {


            db.get().collection(collection.RESTAURANT_COLLECTION).deleteOne({ _id: objectId(ResId) }).then((data) => {
                resolve({ status: true })
            })

        })
    },
    DeleteUser: (ResId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(ResId) }).then((data) => {
                resolve({ status: true })
            })

        })
    },
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            let users = db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    addBanners: (filename) => {
        console.log(filename);
        fileName = {
            name: filename
        }
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BANNER_COLLECTION).insertOne(fileName)
            resolve()
        })


    },
    getBanners: () => {
        return new Promise(async (resolve, reject) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banners)
        })
    },
    totalOrdersCheckOuts: () => {
        return new Promise(async (resolve, reject) => {
            let totalOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ cancelStatus: false }).toArray()
            console.log(totalOrders, 'have agreat orders');
            resolve(totalOrders)
        })
    },
    totalOrdersCancelled: () => {
        return new Promise(async (resolve, reject) => {
            let totalOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ cancelStatus: true }).toArray()
            console.log(totalOrders, 'have agreat orders');
            resolve(totalOrders)
        })
    },
    totalOrdersSales: () => {
        return new Promise(async (resolve, reject) => {
            let totalOrders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        cancelStatus: false
                    }
                }, {
                    $project: {
                        total: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ]).toArray()
            console.log(totalOrders, 'goodddd');
            console.log(totalOrders);
            if (totalOrders.length == 0) {
                total = { total: 0 }
                totalOrders.push(total)
                console.log(totalOrders);
                resolve(totalOrders[0])
            } else {

                resolve(totalOrders[0])
            }
        })
    },
    getAllcoupons: async () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupons)
        })

    },
    deleteCoupon: async (couponId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: ObjectId(couponId) }).then((response) => {
                resolve()
            })
        })

    }
}

