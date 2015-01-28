# pillar
An extension layer built on Backbone.js, `pillar` provides extended functionality for handling views and templating.

## Views

The primary function of pillar is to enable full extension of views, normally in backbone extending a view does not merge the events of the subclass with the superclass. Nor do the initialize functions stack.

```javascript
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

    Pillar.ExtendedTestView = Pillar.TestView.extend({
        init: function(opts)
        {
            console.log("Child INIT");
        }
    });
```

`Pillar.ExtendedTestView` has the events: `{"click": "helloWorld", "click .all": "whatUp"}`, and when it is initialized "Base INIT", "INIT" and "Child INIT" will print, in that order.

To accomplish view extension, pillar expects you to use `init` and `draw` to extend, rather than `initialize` and `render`.

### Collection Views

Pillar provides `CollectionView`s which allow simple management of subviews.

## Templating

Pillar allows a declarative syntax for populating your html templates.

```html
    <div data-pillar="id<-id">
        <a data-pillar="href<-link, text<-title"></a>
    </div>
```

Rendering this using `{id: 123, link: "http://google.com", title: "Google"}, gives:

```html
    <div id="123">
        <a href="http://google.com">Google</a>
    </div>
```

The templating system is drop-in, and I tend to use it as so:

```javascript
    //Global
    Pillar.Templates.register("my_template", $("#my_template").html());

    // In the view
    template: Pillar.Templates.get("my_template"),

    draw: function(opts)
    {
        var html = this.renderTemplate(this.template, this.model);
        this.replaceElement(html);
    }
```

## Dependencies

Pillar depends on `jquery`, `backbone` and `underscore`.

