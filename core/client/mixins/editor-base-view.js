import setScrollClassName from 'ghost/utils/set-scroll-classname';

var EditorViewMixin = Ember.Mixin.create({
    // create a hook for jQuery logic that will run after
    // a view and all child views have been rendered,
    // since didInsertElement runs only when the view's el
    // has rendered, and not necessarily all child views.
    //
    // http://mavilein.github.io/javascript/2013/08/01/Ember-JS-After-Render-Event/
    // http://emberjs.com/api/classes/Ember.run.html#method_next
    scheduleAfterRender: function () {
        Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
    }.on('didInsertElement'),

    // all child views will have rendered when this fires
    afterRenderEvent: function () {
        var $previewViewPort = this.$('.js-entry-preview-content');

        // cache these elements for use in other methods
        this.set('$previewViewPort', $previewViewPort);
        this.set('$previewContent', this.$('.js-rendered-markdown'));

        $previewViewPort.scroll(Ember.run.bind($previewViewPort, setScrollClassName, {
            target: this.$('.js-entry-preview'),
            offset: 10
        }));

        // Render all the math equations
        var hash = XXH(0xABCD);
        MathJax.Cache = {};
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,$(".rendered-markdown")[0], function() {
            $("script[type*='math/tex']").each(function(index,dom) {
                var key = hash.update($(dom).attr("type") + $(dom).html()).digest();
                MathJax.Cache[key] = Array(0, $(dom).prev().clone());
            });
        }]);
    },

    removeScrollHandlers: function () {
        this.get('$previewViewPort').off('scroll');
    }.on('willDestroyElement'),

    // updated when gh-codemirror component scrolls
    markdownScrollInfo: null,

    // percentage of scroll position to set htmlPreview
    scrollPosition: Ember.computed('markdownScrollInfo', function () {
        if (!this.get('markdownScrollInfo')) {
            return 0;
        }

        var scrollInfo = this.get('markdownScrollInfo'),
            markdownHeight,
            previewHeight,
            ratio;

        markdownHeight = scrollInfo.height - scrollInfo.clientHeight;
        previewHeight = this.get('$previewContent').height() - this.get('$previewViewPort').height();

        ratio = previewHeight / markdownHeight;

        return scrollInfo.top * ratio;
    })
});

export default EditorViewMixin;
