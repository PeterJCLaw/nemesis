var MediaConsentView = function() {
    return function(select_container, confirm_container) {
        var that = this;
        var my_link_node;
        var my_requesting_user;

        this.show_link = function(link_jqnode, requesting_user) {
            my_link_node = link_jqnode;
            my_requesting_user = requesting_user;
            if (!requesting_user.is_mediaconsent_admin) {
                return;
            }

            link_jqnode.html(TemplateExpander.template("media_consent_link").render());
            link_jqnode.addClass("active");
        };

        this.show = function(target_username) {
            if (!my_requesting_user.is_mediaconsent_admin) {
                that.hide();
                return;
            }

            if (target_username != '') {
                var user = new User(target_username);
                user.fetch(function(user) {
                    that.show_confirm(user);
                    that.show_select(target_username);
                });
            } else {
                this.show_select(target_username);
            }
        };

        this.show_select = function(username) {
            if (!my_requesting_user.is_mediaconsent_admin) {
                that.hide();
                return;
            }

            var template = TemplateExpander.template("select_media_consent");
            var text = template.render_with({'username':username});
            select_container.html(text);
            select_container.show();

            $('#mediaconsent_select_form').submit(function(event) {
                var username = $('#mediaconsent_select_username').val();
                window.location.hash = '#mediaconsent-' + username;
                event.preventDefault();
            });
        };

        this.show_confirm = function(user) {
            if (!my_requesting_user.is_mediaconsent_admin) {
                that.hide();
                return;
            }

             user.fetch_colleges(function(user) {
                var template = TemplateExpander.template("confirm_media_consent");

                var disabled = '';
                if (user.has_withdrawn) {
                   disabled = ' disabled="disabled"';
                }
                var withdrawn_text = "";
                if (user.has_withdrawn) {
                    withdrawn_text = "This user has been withdrawn from the competition. "
                                   + "If you have a media consent form for them please contact the schools co-ordinator to discuss their situation.";
                }

                var colleges = user.colleges;
                var college_name = colleges[0].english_name;
                if (colleges.length > 1) {
                    for (var i = 1; i < colleges.length; i++) {
                        college_name += ", " + colleges[i].english_name;
                    }
                }

                var opts = {"user":user,
                    "college_name":college_name,
                        "disabled":disabled,
                  "withdrawn_text":withdrawn_text};
                var text = template.render_with(opts);
                confirm_container.html(text);
                confirm_container.show();

                wv.end("Loaded successfully!");
                $("#mediaconsent-confirm").click(function(event) {
                    that.confirm_mediaconsent(user);
                    event.preventDefault();
                });
            }, true);
        };

        this.hide = function() {
            if (my_link_node) {
                my_link_node.removeClass('active');
            }
            select_container.hide();
            confirm_container.hide();
        };

        this.confirm_mediaconsent = function(user) {
            if (!my_requesting_user.is_mediaconsent_admin) {
                return;
            }
            wv.start("Confirming media consent");
            var details = { 'media_consent': true };
            $.post("user/" + user.username, details, function(response) {
                wv.end("Media consent confirmed for " + user.username + ".");
                window.location.hash = '#mediaconsent'
            });
        };
    };
}();
