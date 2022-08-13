let phoneError = document.getElementById('phone-error');
let passwordError = document.getElementById('password-error');
let msgSuccess = document.getElementById('alert-success');
let nameError = document.getElementById('signupnameerr');
let emailError = document.getElementById('emailError');
let submitError = document.getElementById('empty_notice');


function validateName(){
    let name = document.getElementById('signupname').value;
    document.getElementById('signupnameerr').style.color = 'red';
    if (name.length == 0) {
        nameError.innerHTML = 'Name is required';
        return false;
    }

    if (name.match(' '+' ')) {
        nameError.innerHTML = 'space is two';
        return false;
    }

    // if (!name.match(/^[a-zA-Z]+ [a-zA-Z]+$/)) {
    //     nameError.innerHTML = 'Write full name';
    //     return false;
    // }

    nameError.innerHTML = '';
    return true;
}

function validateEmail(){
    let email = document.getElementById('email').value;
    emailError.style.color = 'red';
    if (email.length == 0) {
        emailError.innerHTML = 'Email is required';
        return false;
    }

    if (email == 'info@homy.com') {
        emailError.innerHTML = 'you can\'t use this email';
        return false;
    }

    if (!email.match(/^([a-z0-9_\.\-])+\@(([a-z0-9\-])+\.)+([a-z0-9]{2,4})+$/)) {
        emailError.innerHTML = 'Email invalid';
        return false;
    }

    emailError.innerHTML = '';    
    return true;
}

function validatePhone() {
    let phone = document.getElementById('usermobile').value;

    document.getElementById('phone-error').style.color = 'red';
    if (phone.length == 0) {
        phoneError.innerHTML = 'Phone is required';
        return false;
    }

    if (phone.length !== 10) {
        phoneError.innerHTML = 'Phone no should be 10 digits';
        return false;
    }

    if(!phone.match(/^[0-9]{10}$/)){
        phoneError.innerHTML = 'Only digits please';
        return false;
    }

    phoneError.innerHTML = '';
    return true;
}

function validatePassword(){
    let password = document.getElementById('userpassword').value;
    console.log(password)
    let passError=document.getElementById('passsword-error')
    let required = 5;
    let left = required - password.length;
    
    passError.style.color = 'red';
    
   

    if (password<5) {
        passError.innerHTML = 'Min 5 char required';
        return false;
    }
    passError.innerHTML = '';
    return true;
}
// cusine Validation ---------------->

function validateCusineName(){
    let name = document.getElementById('CusineName').value;
   let cusineError = document.getElementById('cusineNameError')
   cusineError.style.color = 'red';
    if (name.length == 0) {
        cusineError.innerHTML = 'Name is required';
        return false;
    }

    if (name.match(' '+' ')) {
        cusineError.innerHTML = 'White space not required';
        return false;
    }


    cusineError.innerHTML = '';
    return true;
}

function validateCusineDetails(){
    let cDetails = document.getElementById('cusineDetails').value;
   let cusineDetailError = document.getElementById("detailCusineError")
   cusineDetailError.style.color = 'red';
    if (cDetails.length <= 10) {
        cusineDetailError.innerHTML = 'Details  is required min 20 characters';
        return false;
    }

    if (cDetails.match(' '+' ')) {
        cusineDetailError.innerHTML = "dont use unnecessary white spaces";
        return false;
    }


    cusineDetailError.innerHTML = '';
    return true;
}


function validateSignUpForm(event){

    if (!validateName() || !validateEmail() || !validatePhone() || !validatePassword()) {
        event.preventDefault();
        submitError.style.display = 'block';
        submitError.innerHTML = 'Please Fill Required Fields';
        submitError.style.color = 'red';

        setTimeout(function() { submitError.style.display = 'none'; }, 3000);
        return false;
    } else {
        msgSuccess.style.display = 'block';
        msgSuccess.innerHTML = 'This is a success alert—check it out!';
        return true;

    }
}

function validateForm(event) {
    if (!validatePhone() || !validatePassword()) {
        event.preventDefault();
        submitError.style.display = 'block';
        submitError.innerHTML = 'Please Fill Required Fields';
        submitError.style.color = 'red';

        setTimeout(function () { submitError.style.display = 'none'; }, 3000);
        return false;
    } else {
        msgSuccess.style.display = 'block';
        msgSuccess.innerHTML = 'This is a success alert—check it out!';
    }
}

function validateCusineForm(event) 
{
    let submitError= document.getElementById('cussineErrors');

    console.log('code is here')
    if (!validateCusineName() || !validateCusineDetails()) {
        event.preventDefault();
        submitError.style.display = 'block';
        submitError.innerHTML = 'Please Fill Required Fields';
        submitError.style.color = 'red';

        setTimeout(function () { submitError.style.display = 'none'; }, 3000);
        return false;
    } else {
        msgSuccess.style.display = 'block !important';
        msgSuccess.innerHTML = 'This is a success alert—check it out!';
    }
}


// sweet alert


function deleteCartCusine(event,productId)
{   
    console.log(productId);
  event.preventDefault();
// console.log('have a nice day')
Swal.fire({
  title: 'Are you sure?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#ff6c00',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes, delete it!'
}).then((result) => {
  if (result.isConfirmed) {
    location.href=`/deleteCusineCart/${productId}`;
  }
})
}

function deleteCoupons(event,couponId)
{
    // console.log(couponId);
  event.preventDefault();
console.log('have a nice day')
Swal.fire({
  title: 'Are you sure?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#ff6c00',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes, delete it!'
}).then((result) => {
  if (result.isConfirmed) {
    location.href=`/admin/deleteCoupon/${couponId}`;
  }
})
}






