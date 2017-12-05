$(document).ready(function () {
    // This will be triggered automatically after the SDK is loaded successfully
    // write your FB fucntions inside this
    window.fbAsyncInit = function () {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                getFacebookUserInfo(true);
            }
        });
    };
});


var options = {
    scope: 'public_profile,email'
};


function onFacebookLogin() {
    localStorage.removeItem('oauth');
    FB.login(function (response) {
        getFacebookUserInfo(true);
    }, options);
}

function onFacebookRegister() {
    FB.login(function (response) {
        getFacebookUserInfo(false);
    }, options);
}

function getFacebookUserInfo(userExists) {
    FB.api('/me?fields=id,email,name,picture', function (response) {
        console.log(response);
        // localStorage.setItem('facebookLoggedIn', true);
        if (userExists) {
            if (localStorage.getItem('oauth') != null && localStorage.getItem('oauth') != "") {
                userAuth();
            } else {
                loginWithFacebookPasswordEmail(response.email, response.id);
            }
        } else {
            console.log('register');
            registerUsingFacebook(response.email, response.id);
        }
    });
}

function logoutFB() {
    FB.logout();
}

function registerUsingFacebook(email, password) {

    $.ajax({
        url: 'https://stark-island-54204.herokuapp.com/cloud/api/beta/register.php',
        data: {
            email: email,
            pw: password
        },
        method: "POST",
        complete: function (transport) {
            console.log(transport.responseText);
            theResp = $.parseJSON(transport.responseText);
            if (theResp['status'] == 'success') {
                window.location = window.location.href;
            } else {
                alert("Sorry that email is already taken or invalid.");
            }
        }
    })
}

function loginWithFacebookPasswordEmail(email, password) {

    $.ajax({
        url: 'https://stark-island-54204.herokuapp.com/cloud/api/beta/login.php',
        data: {
            email: email,
            pw: password
        },
        method: "POST",
        complete: function (transport) {

            theResp = $.parseJSON(transport.responseText);
            if (theResp['status'] == 'success') {
                $('#userBalance').html("$" + numberWithCommas(parseFloat(theResp.mockbalance).toFixed(2)));
                localStorage.setItem('oauth', theResp.oauth);
                userAuth();
                $(".lity-close").click();
            } else {
                alert("Unable to authenticate with facebook. Please try again.");
            }
        }
    })
}

function userAuth() {

    if (localStorage.getItem('oauth') != null && localStorage.getItem('oauth') != "") {
        oauthString = "?oauth=" + localStorage.getItem('oauth');
    } else {
        oauthString = "";
    }
    $.ajax({
        url: 'https://stark-island-54204.herokuapp.com/cloud/api/beta/getUserInfo.php' + oauthString,
        complete: function (transport) {

            theResp = $.parseJSON(transport.responseText);
            if (theResp['status'] == 'success') {
                $('#user').html('Mock Portfolio: ');
                $('#userBalance').html("$" + numberWithCommas(parseFloat(theResp.balanceInfo['totalAssets']).toFixed(2)));
                $('#signer').html("<a href='javascript:logout()' style='font-size:12px;opacity:.8;text-decoration:none; color:#fff'>Logout</>");
                $('#signer2').hide();
            } else {
                localStorage.setItem('oauth', theResp.user[0]['oauth']);
                $('#userBalance').html("$" + numberWithCommas(parseFloat(theResp.balanceInfo['totalAssets']).toFixed(2)));
            }

            if (typeof theResp['orders'] == "object") {
                for (i in theResp['orders']) {
                    thisOrder = theResp['orders'][i];
                    renderActiveOrders(thisOrder['rId'], thisOrder['timestamp'], thisOrder['type'], thisOrder['amount'], thisOrder['price'], thisOrder['symbol']);
                }
            }

        }
    })
}