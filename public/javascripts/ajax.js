


function addToCart(productId){
 $.ajax({
  url:'/addToCart/'+productId,
  method:'get',
  success:(response)=>{
    
    if(response.status){
      console.log('response');
      // let count=document.getElementById('CountCart')
      let count=$('#CountCart').html()
      count=parseInt(count)+1
  //  document.getElementById('CountCart').innerHTML=count
     $('#CountCart').html(count)
    }else{
        location.href='/log'
    }

  }
 })
}

function changeQuantity(cartId,productId,userId,count){
  let quantity=parseInt(document.getElementById(productId).innerHTML)
  count=parseInt(count)
  console.log('have a gg dayyy');
  $.ajax({
    url:"/changeProductQuantity",
    data:{
      user:userId,
      cart:cartId,
      product:productId,
      count:count,
      quantity:quantity

    },
    method:'post',
    success: async(response) => {

      if (response.removeproduct) {
        const Toast = await  Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })
        
        Toast.fire  ({
          icon: 'success',
          title: 'Deleted from the cart'
        })
        setTimeout(function () {

          location.reload()
        },500)
        
      } else {
          console.log(response);
          document.getElementById(productId).innerHTML = quantity + count
          console.log(response.total);
          document.getElementById('Grandtotal').innerHTML=response.totalGross
          document.getElementById('subtotal').innerHTML=response.total
          document.getElementById('deliverytotal').innerHTML=response.totalDeliveryCharge


      }
  }
  })
}

function deleteCusine(productId){
  console.log(productId);
  $.ajax({
    url:"/deleteCusineCart",
    data:{
      product:productId
    },
    method:'get',
    success: (response) => {

    }
  })

}

$('#checkOutForm').submit((e)=>
{
  e.preventDefault();
  $.ajax({
    url:'/PlaceOrder',
    method:'post',
    data:
    $('#checkOutForm').serialize(),
    date:new Date(),
    success: (response) => {
      if(response.codSuccess){
        location.href='/placed'
      }else{
        razorpayPayment(response)
 }
    }

  })
})



function razorpayPayment(order){
  console.log('have a nice day');
  console.log(order);
  var options = {
    "key": "rzp_test_fpNxRVRbM7kSGz", // Enter the Key ID generated from the Dashboard
    "amount": order.amount,
    "currency": "INR",
    "name": "Foodora",
    "description": "Do your Payment here",
    "image": '',
    "order_id":order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response){
      console.log('hello motto raha ha')
        // alert(response.razorpay_payment_id);
        // alert(response.razorpay_order_id);
        // alert(response.razorpay_signature);

        verifyPayment(response,order)
    },
    "prefill": {
        "name": "Foodora",
        "email": "Foodora@gmail.com",
        "contact": "9746882953"
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#1F1F1F"
    }
};
var rzp1 = new Razorpay(options);
// rzp1.on('payment.failed', function (response){
//         alert(response.error.code);
//         alert(response.error.description);
//         alert(response.error.source);
//         alert(response.error.step);
//         alert(response.error.reason);
//         alert(response.error.metadata.order_id);
//         alert(response.error.metadata.payment_id);
// });
rzp1.open();
}
function verifyPayment(payment,order){
  $.ajax({
    url:'/verifyPayment',
    method:'post',
    data:{
      payment,order
    },
    success:(response) => {
      if(response.status){
        location.href='/placed'
      }else{
        const Toast =  Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 500,
          timerProgressBar: true,
          didOpen: (toast) => {
            // toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })
        
        Toast.fire  ({
          icon: 'error',
          title: 'Payment Error'
        })
        setTimeout(function () {

          location.reload()
        },500)

      }
    }
  })

}
function changeStatus(status,orderId){
  console.log(status);
  console.log(orderId);
    $.ajax({
    url:'/RestaurantAdmin/changeOrderStatus',
    method:'post',
    data:{
      status,orderId
    },
    success:(response) => {
    location.reload();
    }
  })

}