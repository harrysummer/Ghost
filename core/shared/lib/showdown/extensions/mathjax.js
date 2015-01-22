(function(){
    var mathjax = function(converter) {
        return [
            {
                // Preserve the back-slashes inside the mathjax code
                type    : 'lang',
                filter  : function(text) {
                    // first, change all double back slash into something magic
                    var result = text.replace(/\\\\/g, "~S1").replace(/\\~D/g, "~S2");

                    // then, detect for \( ... \), \[ ... \] blocks...
                    var regex = Array(
                        /(~S1\()(([^~]|~[^S]|~S[^1]|~S1[^\)])*)(~S1\))/g,
                        /(~S1\[)(([^~]|~[^S]|~S[^1]|~S1[^\]])*)(~S1\])/g,
                        /(~D~D)(([^~]|~[^~D]|~D[^~]|~D~[^D])*)(~D~D)/g);

                    for (var i = 0; i < regex.length; i++) {
                        result = result.replace(regex[i], function(match, prefix, content, dumb, suffix) {
                            return prefix.replace(/\[/, "\\[").replace(/\(/, "\\(") +
                                content.replace(/~S1/g, "\\\\").replace(/([`*_{}\[\]()>#+-.!\\`])/g, "\\$1") +
                                suffix.replace(/\]/, "\\]").replace(/\)/, "\\)");
                        });
                    }

                    // change double back slash back
                    return result.replace(/~S2/g, "\\~D").replace(/~S1/g, "\\\\");
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.mathjax = mathjax; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = mathjax;
}());
