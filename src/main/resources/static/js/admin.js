traverson.registerMediaType(TraversonJsonHalAdapter.mediaType,
    TraversonJsonHalAdapter);

var rootUri = '/',
    api = traverson.from(rootUri),
    fields = [{
        name: "amount",
        label: "Количество:",
        control: "input",
        type: "number"
    }, {
        name: "currency",
        label: "Тип валюты:",
        control: "input"
    }, {
        name: "rate",
        label: "Курс:",
        control: "input",
        type: "number"
    }, {
        name: "type",
        label: "Тип ордера:",
        placeholder: "BUY or SELL",
        control: "input"
    }, {
        name: "location",
        label: "Город:",
        control: "input"
    }, {
        name: "create",
        control: "button",
        label: "Создать"
    }, {
        name: "update hide",
        control: "button",
        label: "Обновить"
    }, {
        name: "delete hide",
        control: "button",
        label: "Удалить"
    }, {
        name: "finish hide",
        control: "button",
        label: "Закрыть"
    }, {
        name: "publish hide",
        control: "button",
        label: "Опубликовать"
    }];

var View = Backbone.View.extend({
    el: $(".container"),
    initialize: function () {
        _.bindAll(this, "render");
        this.model.bind("change", this.render);
    },
    render: function() {
        var $tbody = this.$("#ads-list tbody");
        $tbody.empty();
        _.each(this.model.models, function(data) {
            $tbody.append(new adView({ model : data }).render().el);
        }, this);
    },
    events: {
        "click #createNew": function(e) {
            e.preventDefault();
            var user = form.model.get("user");
            form.model.clear();
            form.model.set("user", user);
            form.$el.find(".create").removeClass("hide");
        }
    }
});

var adView = Backbone.View.extend({
    tagName : "tr",
    template : _.template($("#ad-template").html()),
    render : function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    events: {
        "click": function() {
            var idx = this.model.collection.indexOf(this.model);
            this.model.set("idx", idx);
//            this.model.set("location", this.model.get("location").city);
            form.model.set(this.model.toJSON());
            controller.getOperations(this.model);
        }
    }
});

var AdsModel = Backbone.RelationalHalResource.extend({
    initialize: function() {
        var self = this;
        api.jsonHal()
            .follow("ads")
            .getUri(function(err, uri) {
                if (err) {
                    console.log(err);
                    return;
                }
                self.halUrl = uri;
            });
        api.jsonHal()
            .follow("users", "search", "current-user")
            .getResource(function(err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
                self.set("user", res._links.self.href); //TODO
            });
    }
});
var ads = new AdsModel();
var adsCollection = new Backbone.Collection();
view = new View({ model: adsCollection }).render();
var OrdersResource = Backbone.RelationalHalResource.extend({
    initialize: function(options) {
        var self = this;
        console.log(options);
        api.jsonHal()
            .follow("ads", "search", "my")
            .getUri(function(err, uri) {
                if (err) {
                    console.log(err);
                    return;
                }
                self.url = uri;
                self.updateCollection();
            });
    },
    createModel: function() {

    },
    updateCollection: function() {
        var self = this;
        self.fetch().done(function () {
            var models = self.embedded("ads", { all: true });
            models = models.map(function(model) {
                return new AdsModel(model);
            });
            adsCollection.reset(models);
        });
    }
});

var ordersResource = new OrdersResource();

var form = new Backform.Form({
    el: $("#form"),
    model: new AdsModel(),
    fields: fields,
    events: {
        "click .update": function(e) {
            e.preventDefault();
            var self = this;
            this.model.sync("patch", this.model, { url: controller.getLinkUrl("update", this.model.get("idx")) })
                .done(function(result) {
                    ordersResource.updateCollection();
                })
                .fail(function(error) {
                    console.error(error);
                });
            return false;
        },
        "click .create": function(e) {
            e.preventDefault();
            this.model.set("location",{ city: this.model.get("location") }); //TODO nested trick
            this.model.sync("create", this.model)
                .done(function(result) {
                    ordersResource.updateCollection();
                })
                .fail(function(error) {
                    console.error(error);
                });
            this.model.set("location", this.model.get("location").city);
            return false;
        },
        "click .publish": function(e) {
            e.preventDefault();
            this.model.sync("create", this.model, { url: controller.getLinkUrl("publish", this.model.get("idx")) })
                .done(function(result) {
                    ordersResource.updateCollection();
                })
                .fail(function(error) {
                    console.error(error);
                });
            return false;
        },
        "click .finish": function(e) {
            e.preventDefault();
            this.model.set("status", "OUTDATED");
            this.model.sync("create", this.model, { url: controller.getLinkUrl("finish", this.model.get("idx")) })
                .done(function(result) {
                    ordersResource.updateCollection();
                })
                .fail(function(error) {
                    console.error(error);
                });
            return false;
        },
        "click .delete": function(e) {
            e.preventDefault();
            this.model.sync("delete", this.model, { url: controller.getLinkUrl("delete", this.model.get("idx")) })
                .done(function(result) {
                    ordersResource.updateCollection();
                })
                .fail(function(error) {
                    console.error(error);
                });
            return false;
        }
    }
});

form.render();


var Controller = function(view) {
    var self = this;
    self.view = view;
    self.view.model.on("change", function() {
    //    self.view.$el.find(".publish").addClass("hide");
    });
};

Controller.prototype.getOperations =  function(model) {
    if (typeof model == "number") {
        model = this.getFullModel(model);
    }
    model.link("update") ?  this.view.$el.find(".update").removeClass("hide") : this.view.$el.find(".update").addClass("hide");
    model.link("create") ? this.view.$el.find(".create").removeClass("hide") : this.view.$el.find(".create").addClass("hide");
    model.link("publish") ? this.view.$el.find(".publish").removeClass("hide") : this.view.$el.find(".publish").addClass("hide");
    model.link("delete") ? this.view.$el.find(".delete").removeClass("hide") : this.view.$el.find(".delete").addClass("hide");
    model.link("finish") ? this.view.$el.find(".finish").removeClass("hide") : this.view.$el.find(".finish").addClass("hide");
};

Controller.prototype.getLinkUrl = function(action, idx) {
    return this.getFullModel(idx).link(action).href();
};

Controller.prototype.getFullModel = function(idx) {
    return adsCollection.models[idx];
};

Controller.prototype.clear = function() {
    //self.view.model.
};
var controller = new Controller(form);