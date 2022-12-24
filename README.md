<img src="https://homybooking.online/images/main-logo.png" width="200px" />

Live : <a href="https://homybooking.online/" target="blank">https://homybooking.online</a>


## 🚀 About Project
> This hotel room booking website is designed to help customers book their desired hotel rooms online. Customers can search by date available rooms, view photos, and book the room that best suits their needs. The website also allows customers to manage their bookings. the website provides helpful information about the hotel, its services, and nearby attractions.

## Main Functionality

#### User
  - Sign up and login with otp
  - List of Hotel and available rooms with filter
  - Wishlist and coupon
  - Book room with partial payment
  - Payment gateway’s (Razorpay, paypal)
  - List of previous bookings
  - Wallet and history
  - Profile managment
  
  
#### Vendor
  - Signup request to admin, admin can approve or reject
  - Add hotel’s and rooms
  - Hotel and rooms managment
  - Sales Report and booking managment
  - Withdraw amout
  - Panel with Dashbord
  

#### Admin
  - Panel with Dashbord
  - Sales Report and booking details
  - Transaction details
  - Block and unblock hotel, vendor, user
  - Slider and coupon managment



## Login Details

#### Super admin login details

| Username     | Password    | Role          | Link                                   |
| :----------- | :---------- | :------------ | -------------------------------------- |
| `superAdmin` | `admin@123` | Administrator | https://homybooking.online/super_admin |


#### Vendor login details

| Email              | Password     | Role       | Link                              |
| :----------------- | :----------  | :--------  | --------------------------------- |
| `vendor@gmail.com` | `vendor@123` | Sub admin | https://homybooking.online/vendor  |


#### User register
![image](https://user-images.githubusercontent.com/95907424/208875830-1ca97baf-b9a3-4eeb-a693-b3c58a43244d.png)

#### Login with mobile otp
![image](https://user-images.githubusercontent.com/95907424/208876026-4b6c6be4-a45c-4195-acfe-1c6d4db0a872.png)

![image](https://user-images.githubusercontent.com/95907424/208876132-f6252486-0c44-434e-a939-530353bd3d83.png)


## Used 

#### *Node js  |  Mongo DB  |  Express js  |  JavaScript  |  Html5  |  Css*


## Prerequisites

* Node.js >= v16.15.0
* npm >= 
* MongoDB >= ^4.7.0


## Run Locally

Clone the project

```bash
  git clone https://github.com/Faisal-kkn/homybooking.git
```

Go to the project directory

```bash
  cd homybooking
```


Create a .env file and add 👇

```bash
  SERVICEID: twilio service id
  ACCOUNTSSID: twilio accounts id
  AUTHTOKEN: twilio authtoken
  KEYID: Razorpay key id
  KEYSECRET: Razorpay key secret
  CLIENTID: Paypal client id
  CLIENTSECRET: Paypal client secret
  PORT: 3000
  DATABASE: MongoDB database link

```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```

## Used dependencies

```bash
  {
      "bcrypt": "^5.0.1",
      "chart.js": "^3.8.2",
      "dotenv": "^16.0.1",
      "express-handlebars": "^6.0.6",
      "express-session": "^1.17.3",
      "hbs": "^4.2.0",
      "mongodb": "^4.7.0",
      "multer": "^1.4.5-lts.1",
      "paypal-rest-sdk": "^1.8.1",
      "razorpay": "^2.8.2",
      "twilio": "^3.78.0"
  }
```
