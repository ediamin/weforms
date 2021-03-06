weForms.routeComponents.Tools = {
    template: '#tmpl-wpuf-tools',
    mixins: [weForms.mixins.Tabs, weForms.mixins.Loading],
    data: function() {
        return {
            activeTab: 'export',
            exportType: 'all',
            loading: false,
            forms: [],
            importButton: 'Import',
            currentStatus: 0,
            responseMessage: ''
        };
    },

    computed: {

        isInitial() {
            return this.currentStatus === 0;
        },

        isSaving() {
            return this.currentStatus === 1;
        },

        isSuccess() {
            return this.currentStatus === 2;
        },

        isFailed() {
            return this.currentStatus === 3;
        }
    },

    created: function() {
        this.fetchData();
    },

    methods: {
        fetchData: function() {
            var self = this;

            this.loading = true;

            wp.ajax.send( 'weforms_form_names', {
                data: {
                    _wpnonce: weForms.nonce
                },
                success: function(response) {
                    // console.log(response);
                    self.loading = false;
                    self.forms   = response;
                },
                error: function(error) {
                    self.loading = false;
                    alert(error);
                }
            });
        },

        importForm: function( fieldName, fileList, event ) {
            if ( !fileList.length ) {
                return;
            }

            var formData = new FormData();
            var self = this;

            formData.append( fieldName, fileList[0], fileList[0].name);
            formData.append( 'action', 'weforms_import_form' );
            formData.append( '_wpnonce', weForms.nonce );

            self.currentStatus = 1;

            $.ajax({
                type: "POST",
                url: window.ajaxurl,
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    self.responseMessage = response.data;

                    if ( response.success ) {
                        self.currentStatus = 2;
                    } else {
                        self.currentStatus = 3;
                    }

                    // reset the value
                    $(event.target).val('');
                },

                error: function(errResponse) {
                    console.log(errResponse);
                    self.currentStatus = 3;
                },

                complete: function() {
                    $(event.target).val('');
                }
            });
        },

        importCF7: function(target) {
            var button = $(target);

            button.addClass('updating-message').text( button.data('importing') );

            wp.ajax.send( 'weforms_import_cf7_forms', {
                data: {
                    _wpnonce: weForms.nonce
                },

                success: function(response) {
                    console.log(response);
                },

                error: function(error) {
                    alert(error.message);
                },

                complete: function() {
                    button.removeClass('updating-message').text( button.data('original') );
                }
            });
        }
    }
};
