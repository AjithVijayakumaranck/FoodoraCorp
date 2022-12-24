

Live : <a href="https://homybooking.online/" target="blank">https://foodoracorp.online</a>


## 🚀 About Project
> This hotel room booking website is designed to help customers book their desired hotel rooms online. Customers can search by date available rooms, view photos, and book the room that best suits their needs. The website also allows customers to manage their bookings. the website provides helpful information about the hotel, its services, and nearby attractions.

## Main Functionality

#### User
  - Sign up and login with otp
  - List of foods and restaurants 
  - Book room with partial payment
  - Payment gateway’s (Razorpay, paypal)
  - List of previous  orders
  - Wallet and history
  - Profile managment
  
  
#### Vendor
  - Signup request to admin, admin can approve or reject
  - Add foods
  - Sales Report 
  - Withdraw amout
  - Panel with Dashbord
  

#### Admin
  - Panel with Dashbord
  - Sales Report and order details
  - Transaction details
  - Block and unblock  vendor, user
  - Slider and coupon managment






## Used 

#### *Node js  |  Mongo DB  |  Express js  |  JavaScript  |  Html5  |  Css*


## Prerequisites

* Node.js >= v16.15.0
* npm >= 
* MongoDB >= ^4.7.0


## Run Locally

Clone the project

```bash
  git clone https://github.com/Ajithvijayakunmarancd/Foodoracorp
```

Go to the project directory

```bash
  cd foodora
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
