import uploader from 'ghost/assets/lib/uploader';

var Markdown = Ember.Component.extend({
    didInsertElement: function () {
        this.set('scrollWrapper', this.$().closest('.entry-preview-content'));
    },

    adjustScrollPosition: function () {
        var scrollWrapper = this.get('scrollWrapper'),
            scrollPosition = this.get('scrollPosition');

        scrollWrapper.scrollTop(scrollPosition);
    }.observes('scrollPosition'),

    // fire off 'enable' API function from uploadManager
    // might need to make sure markdown has been processed first
    reInitDropzones: function () {
        function handleDropzoneEvents() {
            var dropzones = $('.js-drop-zone');

            uploader.call(dropzones, {
                editor: true,
                fileStorage: this.get('config.fileStorage')
            });

            dropzones.on('uploadstart', Ember.run.bind(this, 'sendAction', 'uploadStarted'));
            dropzones.on('uploadfailure', Ember.run.bind(this, 'sendAction', 'uploadFinished'));
            dropzones.on('uploadsuccess', Ember.run.bind(this, 'sendAction', 'uploadFinished'));
            dropzones.on('uploadsuccess', Ember.run.bind(this, 'sendAction', 'uploadSuccess'));

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
        }

        Ember.run.scheduleOnce('afterRender', this, handleDropzoneEvents);
    }.observes('markdown')
});

export default Markdown;
