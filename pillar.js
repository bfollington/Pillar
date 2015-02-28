Pillar = {} || Pillar;

Pillar.superOf = function(clazz)
{
    return clazz.constructor.__super__;
}

Pillar.extendEvents = function(view) {
    view.events = _.extend({}, Pillar.superOf(view).events, view.events);
}

Pillar.template = function(name)
{
    return $("[data-template='" + name + "']").html();
}

Pillar.Templates = {
    templates: {},

    register: function(name, html)
    {
        this.templates[name] = html;
    },

    get: function(name)
    {
        return this.templates[name];
    },

    smartRegister: function(name)
    {
        this.register(name, Pillar.Templates.template( $("#_" + name + "_template").html() ));
    },

    evalIfFunction: function(obj, attr)
    {
        if (typeof obj[attr] == "function")
        {
            return obj[attr]();
        } else if (typeof obj[attr] != "undefined")
        {
            return obj[attr];
        } else if (typeof obj.get == "function" && typeof obj.get(attr) != "undefined")
        {
            return obj.get(attr);
        } else {
            return "";
        }
    },

    getPlaceholder: function(string)
    {
        return "{{"+string+"}}";
    },

    // TODO: optimisation where we return a function from there, that concats string fragments and an attrs object using .join
    // Need to split final HTML string at {{tokens}};
    compileTemplate: function($template)
    {
        var $html = $template.clone();
        var $elems = $html.find("[data-pillar]").toArray();

        if (typeof $html.attr("data-pillar") != "undefined")
        {
            $elems.unshift($html);
        }

        _.each($elems, function(elem)
        {
            var $el = $(elem);
            var links = $el.attr("data-pillar");
            var toLink = links.split(",");

            $.each(toLink, function(index, property)
            {
                var trimmed = property.trim();
                var splitTerm = trimmed.split("<-");
                var attr = splitTerm[0];
                var valueName = splitTerm[1];

                var specialAttrs = {
                    "extraClass": function($el) {
                        $el.addClass(Pillar.Templates.getPlaceholder(valueName));
                    },
                    "visible": function($el) {
                        $el.attr("data-visible", Pillar.Templates.getPlaceholder(valueName));
                    },
                    "hidden": function($el) {
                        $el.attr("data-hidden", Pillar.Templates.getPlaceholder(valueName));
                    },
                    "text": function($el) {
                        $el.html(Pillar.Templates.getPlaceholder(valueName));
                    }
                };

                if (attr in specialAttrs)
                {
                    specialAttrs[attr]($el);
                } else {
                    $el.attr(attr, Pillar.Templates.getPlaceholder(valueName));
                }
            });

            $el.removeAttr("data-pillar");
            $el.attr("data-pillar-rendered", true);
        });

        var finalString = $html.clone().wrap("<div/>").parent().html();

        var reNoGroup = /\{\{[^}}]+\}\}/g;
        var re = /\{\{([^}}]+)\}\}/g;
        var parts = finalString.split(reNoGroup);
        var matches = finalString.match(re);

        var f = function (attrs)
        {
            var sBuild = [];
            // console.log(parts);
            for (var i = 0; i < parts.length; i++)
            {
                sBuild.push(parts[i]);
                if (i < matches.length)
                {
                    var cleanMatchName = matches[i].replace("{{", "").replace("}}", "");
                    // console.log(matches[i], Pillar.Templates.evalIfFunction(attrs, cleanMatchName));
                    sBuild.push(Pillar.Templates.evalIfFunction(attrs, cleanMatchName));
                }
            }

            return sBuild.join("")
        }

        return f;
    },

    template: function(html)
    {
        return this.compileTemplate($(html));
    },

    renderTemplate: function(template, attrs)
    {
        return template(attrs);
    }
}

Pillar.View = Backbone.View.extend({
    initialize: function(opts)
    {
        Pillar.superOf(this).initialize(opts);
        Pillar.extendEvents(this);

        if (opts)
        {
            if ("template" in opts)
            {
                this.template = opts.template;
            }
        }

        this.init(opts);
    },

    replaceElement: function(html)
    {
        var $oldEl = this.$el;
        this.setElement(html);
        $oldEl.replaceWith(this.$el);
    },

    defaultDraw: function()
    {
        var data = {};
        if (this.model)
        {
            data = this.model.toJSON();
        }
        var html = Mustache.render(this.template, data);
        this.replaceElement(html);
    },

    renderTemplate: Pillar.Templates.renderTemplate,

    _super: function()
    {
        return Pillar.superOf(this).initialize(opts);
    },

    // init is called up the extension stack the way one might expect
    init: function(opts)
    {

    },

    // Render is wrapped to always return this, and provide easy hookins for before and
    // after drawing
    render: function()
    {
        this.beforeDraw();
        this.draw();
        this.afterDraw();
        return this;
    },

    draw: function() {},
    beforeDraw: function() {},
    afterDraw: function() {}
});

Pillar.CollectionView = Pillar.View.extend({
    init: function(opts)
    {
        this.views = [];
    },

    // Remove all existing views from the collection view,
    // since we are about to redraw all of the child views.
    beforeDraw: function()
    {
        _.each(this.views, function(view)
        {
            view.remove();
        });

        this.views = [];
    },

    // Iterate over all models in the collection, drawing each individual model.
    // Shortcut for manually looping over the models.
    // If more control is needed, override draw and this will not be called.
    drawCollection: function(model)
    {

    },

    draw: function()
    {
        this.collection.each(this.drawCollection, this);
    }
});

Pillar.BaseTestView = Pillar.View.extend({

    init: function(opts)
    {
        console.log("Base INIT");
    },

    events: {
        "click": "helloWorld"
    },

    helloWorld: function(e)
    {
        console.log("Hello World");
    }
});

Pillar.TestView = Pillar.BaseTestView.extend({

    init: function(opts)
    {
        console.log("INIT");
    },

    events: {
        "click .all": "whatUp"
    },

    whatUp: function(e)
    {
        console.log("What Up!");
    }
});

Pillar.ExtendedTextView = Pillar.TestView.extend({
    init: function(opts)
    {
        console.log("Child INIT");
    }
});

module.exports = Pillar;
