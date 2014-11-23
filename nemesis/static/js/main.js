var current_user = null;
var lastHash = "";
var ev = null;
var cv = null;
var rv = null;
var wv = null;

$(document).ready(function() {
    $.ajaxSetup({
            cache: false
    });
    if (location.hash.length >= 1) {
        location.hash = "";
    }
    var av = new AuthView($("#login-error"));
    cv = new CollegeListView($("#data-college-list"))
    ev = new EditView($("#data-edit-user"), cv.refresh);
    rv = new RegisterView($("#data-register-users"));
    sv = new SelfView($("#logged-in-user"));
    wv = new WorkingView($("#messages"));
    $("#login").submit(function() {
        wv.start("Logging in...");
        current_user = new User($("#username").val())
        current_user.login($("#password").val(), function(user) {
            var waiting_colleges = user.colleges.length;
            for (var i = 0; i < user.colleges.length; i++) {
                var college = user.colleges[i];
                college.fetch(function (college) {
                    waiting_colleges--;
                    if (waiting_colleges == 0) {
                        cv.render_colleges(user.colleges, !user.is_student);
                    };
                });
            }
            $("#login").hide();
            $("#login-error").hide();
            sv.show(user.username);
            wv.end("Login succeeded");
            if (user.colleges.length > 0) {
                wv.start("Loading college information");
            }
        },
        function(response) {
            av.display_auth_error(response["authentication_errors"]);
            wv.hide();
        });
        return false;
    });

    $("#username").focus();

    hashChangeEventListener = setInterval("hashChangeEventHandler()", 50);
});

$(document).on("click", ".add-row", function(){
    rv.add_row(college_name_from_hash());
});

function hashChangeEventHandler() {
    var newHash = location.hash.split('#')[1];

    if(newHash != lastHash) {
        lastHash = newHash;
        handle_hash();
    }
}

function handle_hash() {
    ev.hide();
    rv.hide();
    cv.set_all_inactive();
    if (location.hash.substring(1,5) == "edit") {
        var username = location.hash.substring(6,location.hash.length);
        rv.hide();
        wv.start("Loading user");
        ev.show(username, current_user);
        cv.set_active(username);
    } else if (location.hash.substring(1,4) == "reg") {
        rv.show(college_name_from_hash());
        cv.set_register_active(college_name_from_hash());
    }
}

function clear_view() {
    location.hash = '';
}

function college_name_from_hash() {
    return location.hash.substring(5,location.hash.length);
}

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

function isEmail(str) {
    return /^.+@.+\...+$/.test(str);
}

setInterval(function() {
    cv.set_all_inactive();
    if (location.hash.substring(1,5) == "edit") {
        var username = location.hash.substring(6,location.hash.length);
        cv.set_active(username);
    } else if (location.hash.substring(1,4) == "reg") {
        cv.set_register_active(college_name_from_hash());
    }
}, 100);
