var EditView = function() {
    return function(jquerynode, refresh_callback) {
        var jquerynode = jquerynode;
        var that = this;
        var my_user;
        var my_requesting_user;

        this.show = function(target_username, requesting_user) {
            my_user = new User(target_username);
            my_requesting_user = requesting_user;
            this.refresh_view();
        };

        this.refresh_all = function() {
            this.refresh_view();
            refresh_callback();
        };

        this.refresh_view = function() {
            my_user.fetch(function(user) {
                var template = TemplateExpander.template("user_edit");
                var email_comment = '';
                if (user.new_email !== undefined) {
                    email_comment = " (pending change to " + user.new_email + ")";
                }
                var disabled_fields = {
                    'first_name': '',
                    'last_name': '',
                    'type': '',
                    'update-user': '',
                    'withdraw-user': ''
                };
                var disabled = ' disabled="disabled"';
                if (my_requesting_user.is_student) {
                    disabled_fields['first_name'] = disabled;
                    disabled_fields['last_name'] = disabled;
                }
                if (!my_requesting_user.is_team_leader) {
                   disabled_fields['type'] = disabled;
                }
                if (user.has_withdrawn) {
                   disabled_fields['update-user'] = disabled;
                }
                if (!my_requesting_user.can_withdraw(user)) {
                   disabled_fields['withdraw-user'] = disabled;
                }
                var checked = ' checked="checked"';
                var checked_fields = {
                        'type_student': user.is_student ? checked : '',
                    'type_team_leader': user.is_team_leader ? checked : ''
                };
                var withdrawn_text = "";
                if (user.has_withdrawn) {
                    withdrawn_text = "This user has been withdrawn from the competition and cannot be edited.";
                }
                var opts = {"user":user,
                        "disabled":disabled_fields,
                         "checked":checked_fields,
                   "email_comment":email_comment,
                     "team_select":that.make_team_select(user),
                  "withdrawn_text":withdrawn_text};
                var text = template.render_with(opts);
                jquerynode.html(text);
                jquerynode.show();
                if (user.email === undefined) {
                    // Email is a required field so we need to
                    // completely remove it if the user can't access it.
                    // If we don't then the user will have issues submitting
                    // the form (since the field is required but can't be filled.
                    $("#data-email").remove();
                } else {
                    $("#data-email").show();
                }
                if (user.new_email === undefined) {
                    $("#edit-cancel-email-change").hide();
                } else {
                    $("#edit-cancel-email-change").show()
                                                  .click(function() {
                        that.cancel_email_change();
                    });
                }
                if (my_requesting_user.can_withdraw(user)) {
                    $('#withdraw-user').show().click(function() {
                        that.withdraw_user();
                    });
                }
                wv.end("Loaded user successfully!");
                $("#user_edit_form").submit(function(event) {
                    that.submit_form();
                    event.preventDefault();
                });
            });
        };

        this.make_team_select = function(user) {
            // Only students can have their team edited,
            // only team leaders can actually edit teams.
            if (user.is_student && my_requesting_user.is_team_leader) {
                return TemplateExpander.make_select('new_team', my_requesting_user.teams, user.teams[0]);
            } else {
                return TemplateExpander.make_list(user.teams);
            }
        };

        this.hide = function() {
            jquerynode.hide();
        };

        this.cancel_email_change = function() {
            wv.start("Cancelling outstanding email change");
            $.post("user/" + my_user.username, {'new_email': my_user.email}, function(response) {
                that.refresh_all();
            });
        };

        this.withdraw_user = function () {
            var msg = "Withdrawing a user can only be undone by contacting Student Robotics.\n\n"
                    + "The withdrawn user will no longer be able to access any of Student Robotics' services,\n"
                    + "nor will they be sent any information about events.\n\n"
                    + "Are you sure you want to continue?";
            if (!confirm(msg)) {
                return;
            }
            wv.start("Withdrawing user");
            $.post("user/" + my_user.username, {'withdrawn': true}, function (response) {
                that.refresh_all();
            });
        };

        this.submit_form = function() {
            wv.start("Sending user details");
            var cb_extra = null;
            var details = this.details_on_form();
            if (my_user.username == my_requesting_user.username && 'new_password' in details) {
                cb_extra = function() {
                    var null_cb = function() {};
                    my_requesting_user.login(details['new_password'], null_cb, null_cb);
                };
            }
            $.post("user/" + my_user.username, details, function(response) {
                if (cb_extra != null) {
                    cb_extra();
                }
                that.refresh_all();
            });
        };

        this.details_on_form = function() {
            var details = {};
            if (password_input() != "") {
                details["new_password"] = password_input();
            }

            $("#update-user").find("input[type=text]").each(function(i,element) {
                var $e = $(element);
                details[$e.attr("name")] = $e.val();
            });

            var team_select = $("#update-user select[name=new_team]");
            if (team_select.length > 0) { // students only
                details['new_team'] = team_select.val();
            }

            if (details['new_email'] == my_user.email) {
                // If unchanged, we mustn't send the value -- this cancels any outstanding change requests
                delete details['new_email'];
            }

            var user_type = $("#update-user input[name=type]:checked");
            if (user_type.length > 0) { // blueshirts don't have a displayed type for the moment.
                var new_type = user_type[0].value;
                // only bother signalling changes
                if ((new_type == 'student' && my_user.is_team_leader)
                 || (new_type == 'team-leader' && my_user.is_student)) {
                    details['new_type'] = new_type;
                }
            }

            return details;
        };

        var password_input = function() {
            return $("input[name=new_password]").val();
        };

    };
}();
