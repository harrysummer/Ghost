import Ember from 'ember';
import uploader from 'ghost/assets/lib/uploader';

var Preview = Ember.Component.extend({
    config: Ember.inject.service(),

    didInsertElement: function () {
        this.set('scrollWrapper', this.$().closest('.entry-preview-content'));
        Ember.run.scheduleOnce('afterRender', this, this.dropzoneHandler);
    },

    adjustScrollPosition: Ember.observer('scrollPosition', function () {
        var scrollWrapper = this.get('scrollWrapper'),
            scrollPosition = this.get('scrollPosition');

        if (scrollWrapper) {
            scrollWrapper.scrollTop(scrollPosition);
        }
    }),

    dropzoneHandler: function () {
        var dropzones = $('.js-drop-zone');

        uploader.call(dropzones, {
            editor: true,
            fileStorage: this.get('config.fileStorage')
        });

        dropzones.on('uploadstart', Ember.run.bind(this, 'sendAction', 'uploadStarted'));
        dropzones.on('uploadfailure', Ember.run.bind(this, 'sendAction', 'uploadFinished'));
        dropzones.on('uploadsuccess', Ember.run.bind(this, 'sendAction', 'uploadFinished'));
        dropzones.on('uploadsuccess', Ember.run.bind(this, 'sendAction', 'uploadSuccess'));

        // Set the current height so we can listen
        this.sendAction('updateHeight', this.$().height());

        // Render mathjax equations
        var hash = XXH(0xABCD);
        MathJax.Hub.Queue(["PreProcess",MathJax.Hub,$(".rendered-markdown")[0], function() {
            $(".MathJax_Preview").empty();
            $("script[type*='math/tex']").each(function(index,dom){
                var key = hash.update($(dom).attr("type") + $(dom).html()).digest();
                if (typeof(MathJax.Cache) != "undefined" && key in MathJax.Cache) {
                    MathJax.Cache[key][0] = 1;
                    $(dom).before(MathJax.Cache[key][1].clone());
                } else {
                    MathJax.Hub.Queue(["Process", MathJax.Hub, dom, function() {
                        MathJax.Cache[key] = Array(1, $(dom).prev().clone());
                      }]);
                }
            });
            for (var key in MathJax.Cache) {
                if (MathJax.Cache[key][0] == 0)
                    delete MathJax.Cache[key];
                else
                    MathJax.Cache[key][0] = 0;
            }
        }]);
    },

    // fire off 'enable' API function from uploadManager
    // might need to make sure markdown has been processed first
    reInitDropzones: Ember.observer('markdown', function () {
        Ember.run.scheduleOnce('afterRender', this, this.dropzoneHandler);
    })
});

export default Preview;
