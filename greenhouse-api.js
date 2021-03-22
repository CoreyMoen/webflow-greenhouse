// From https://gist.github.com/varemenos/2531765
// Originally from: http://jsfiddle.net/accuweaver/1vf6e465/

(function ($) {
    $.getUrlVar = function (key) {
        var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search);
        return result && unescape(result[1]) || "";
    };
})(jQuery);

/**
 * Stuff to execute after document is ready
 */
jQuery(document).ready(function ($) {

    function get_job(job, dep_id, text) {
        text += '<li class="roles-team_role" style="list-style-type:none;" id="' + job.id + '">';
        text += '<a class="roles-team_role-title" href="' + job.absolute_url + '" target="_blank"><h3 class="h5">' + job.title + '</h3></a>';
        text += '<div class="roles-team_role-location">' + job.location.name + '</div>';
        text += '</li>';
        return text;
    }

    function get_department(dep, text, short) {
        if (!short) {
            text += '<li class="roles-team" id="' + dep.id + '">';
            text += '<div class="roles-team_title"><h2 class="h3">' + dep.name + '</h2></div>';
        }
        text += '<ul class="roles-team_role-wrapper">';
        if (dep.jobs.length) {
            $.each(dep.jobs, function (index, job) {
                text = get_job(job, dep.id, text);
            });
        } else {
            text += 'Sorry, we don\'t have open positions in this department.';
        }
        text += '</ul>';
        if (!short) {
            text += '</li>';
        }
        return text;
    }

    //BUILD A DROPDOWN OF DEPARTMENTS
    function build_select_of_departments(dep, text) {
        if (dep.jobs.length) {
            text += '<option value="' + dep.id + '">';
            text += dep.name;
            text += '</option>';
        }
        return text;
    }

    function get_all_jobs() {
        $.ajax({
            url: 'https://api.greenhouse.io/v1/boards/webflow/embed/departments',
            jsonp: 'callback',
            dataType: 'jsonp',
            success: function (deps) {
                var text = '';
                var select = '<select class="input cc-select u-w-100"><option value="all" selected>All Teams</option>';
                text += '<ul id="departments">';
                $.each(deps.departments, function (index, dep) {
                    select = build_select_of_departments(dep, select);
                    if (dep.jobs.length) {
                        text = get_department(dep, text);
                    }
                });
                text += '</ul>';
                select += '</select>';
                $('.roles-select-wrapper').empty().append(select);
                $('.greenhouse-wrapper').append(text).find('#departments').fadeOut(0).fadeIn();
            }
        });
    }

    var dim;
    if (!$.getUrlVar("gh_jid")) {
        //GET ALL JOBS
        get_all_jobs();
    } else {
        var dim = '<div id="wait" style="width: 100%; height: 100%; position: fixed; top: 0; z-index: 9000">';
        dim += '<img src="http://www.workfront.com/wp-content/themes/dragons/images/ajax_loader_gray_32.gif" style="position: fixed; margin: auto; left: 0; right: 0; top: 0; bottom: 0"/>';
        dim += '</div>';
        console.log('has gh_id');
        $('body').append(dim).find('#wait').fadeOut(0).fadeIn(100);
        var check = setInterval(function () {
            if ($(document).find('#grnhse_div').length) {
                $('#grnhse_div').fadeOut(0).fadeIn(200);
                $('#wait').fadeOut(0);
                $('.greenhouse-wrapper').delay(1000).append(back_btn()).find('#back').fadeOut(0).delay(1000).fadeIn(200);
                clearInterval(check);
            }
        }, 50);
    }

    //SORT BY DEPARTMENT
    $('body').on('change', 'select', function () {
        if ($(this).attr('value') != 'all') {
            $.ajax({
                url: 'https://api.greenhouse.io/v1/boards/webflow/embed/department?id=' + $(this).attr('value'),
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function (dep) {
                    var text = get_department(dep, '');
                    $('#departments').empty().append(text).fadeOut(0).fadeIn(200);
                }
            });
        } else {
            get_all_jobs();
        }
    });


    function api_department(id) {
        return $.ajax({
            url: 'https://api.greenhouse.io/v1/boards/webflow/embed/department?id=' + id,
            jsonp: 'callback',
            dataType: 'jsonp'
        });
    }
    console.log($.getUrlVar("dep"));
    if ($.getUrlVar("dep")) {
        console.log("dep = '" + $.getUrlVar("dep"));
        $.ajax({
            url: 'https://api.greenhouse.io/v1/boards/webflow/embed/job?id=' + $.getUrlVar("gh_jid") + '',
            jsonp: 'callback',
            dataType: 'jsonp',
            timeout: 1000,
            error: function () {
                api_department($.getUrlVar("dep")).done(function (dep) {
                    var check = setInterval(function () {
                        if ($(document).find('#grnhse_div').length && $('#grnhse_div').height() < 300) { //if request timed out there is still a chance that server had a delay etc. If position doesn't exist the iframe returns only text and is only 1278px in height. So I make sure that I frame is small which confirms that position wasn't found.
                            $('#grnhse_app').fadeOut(0);
                            var text = '<div id="sorry">';
                            text += '<h3 style="margin-top: 0">Sorry, this position doesn\'t exist anymore</h3>';
                            text += '<p>Please take a look at the available positions in the <b>' + dep.name + '</b> department</p>';
                            text += get_department(dep, '', true);
                            text += '</div>';
                            $('.greenhouse-wrapper').append(text);
                            clearInterval(check);
                        }
                    }, 50);
                });
            }
        });
    }

});
/**
 * Greenhouse
 * 
 * @type Grnhse object
 */
var Grnhse = Grnhse || {};
/**
 * Settings
 * 
 * @type type
 */
Grnhse.Settings = {
    targetDomain: 'https://boards.greenhouse.io',
    scrollOnLoad: false,
    autoLoad: true,
    boardURI: 'https://boards.greenhouse.io/embed/job_board?for=webflow',
    applicationURI: 'https://boards.greenhouse.io/embed/job_app?for=webflow',
    baseURI: 'http://fiddle.jshell.net/accuweaver/1vf6e465/show/',
    divWidth: '100%'
};
/**
 * Constants 
 * 
 * @type type
 */
Grnhse.Const = {
    JOB_ID: 'gh_jid',
    SOURCE_TOKEN: 'gh_src'
};
/**
 * Configuration
 * 
 * @type type
 */
Grnhse.Config = {
    DivDefault: {
        id: 'grnhse_div',
        width: Grnhse.Settings.divWidth,
        frameborder: '0',
        scrolling: 'no',
        onload: undefined
    }
};
/**
 * Route
 * 
 * @type type
 */
Grnhse.Route = {
    boardUrl: function (source) {
        var helper = Grnhse.UriHelper,
            settings = Grnhse.Settings,
            params = [];
        if (source) {
            params.push('t=' + source);
        }

        return helper.appendParams(settings.boardURI, params);
    },
    applicationUrl: function (source, jobId) {
        var helper = Grnhse.UriHelper,
            settings = Grnhse.Settings,
            params = [];
        if (source) {
            params.push('t=' + source);
        }

        if (jobId) {
            params.push('token=' + jobId);
        }

        return helper.appendParams(settings.applicationURI, params);
    }
};
/**
 * URI helper 
 */
Grnhse.UriHelper = {
    base: function () {
        var uriHelper = Grnhse.UriHelper,
            location = uriHelper.currentLocation(),
            settings = Grnhse.Settings;
        return window && location ? uriHelper.pathFromLocation(location) : settings.boardURI;
    },
    // Gives us something stubbable for units
    currentLocation: function () {
        return window.top.location;
    },
    getParam: function (name) {
        var location = Grnhse.UriHelper.currentLocation(),
            uri = location.href,
            start = uri.indexOf(name),
            end;
        if (start === -1) {
            return null;
        }

        start += name.length + 1;
        end = uri.substr(start).search(/(&|#|$)/);
        return uri.substr(start, end);
    },
    appendParams: function (url, params) {
        params.push('b=' + Grnhse.UriHelper.base());
        url += (url.indexOf('?') === -1) ? '?' : '&';
        return url + params.join('&');
    },
    pathFromLocation: function (location) {
        return location.protocol + '//' + location.host + location.pathname;
    }
};
/**
 * Feature detect
 * @type type
 */
Grnhse.BrowserHelper = {
    supportsPostMessage: function () {
        // Feature detect for <IE9
        return !(document.all && !window.atob);
    }
};
/**
 * Div object
 * 
 * @param {type} src
 * @param {type} overrides
 * @returns {undefined}
 */
Grnhse.Div = function (src, overrides) {
    var settings = Grnhse.Settings,
        self = this;
    overrides = overrides || {};
    this.config = Grnhse.Config.DivDefault;
    this.config.src = src;
    this.supportAwfulBrowsers();
    overrides['onload'] = settings.scrollOnLoad ? 'window.scrollTo(0,0)' : undefined;
    mergeOverrides.call(this);
    this.htmlElement = this.build();
    this.render();

    function mergeOverrides() {
        for (var override in overrides) {
            if (overrides.hasOwnProperty(override)) {
                self.config[override] = overrides[override];
            }
        }
    }
};
/**
 * build method
 * @returns Grnhse object.Div.prototype.build.div
 */
Grnhse.Div.prototype.build = function () {
    var div = document.createElement('div'),
        config = this.config;
    for (var key in config) {
        if (config.hasOwnProperty(key)) {
            div.setAttribute(key, config[key]);
        }
    }

    return div;
};
/**
 * Render the HTML
 * 
 * @returns {undefined}
 */
Grnhse.Div.prototype.render = function () {
    var container = document.getElementById('grnhse_app');
    container.innerHTML = '';
    container.appendChild(this.htmlElement);
    this.registerEventHandlers();
};
/**
 * Register the window event handlers
 * 
 * @returns {undefined}
 */
Grnhse.Div.prototype.registerEventHandlers = function () {
    var instance = this;
    if (window.addEventListener) {
        window.addEventListener('message', resize, false);
    } else if (window.attachEvent) {
        window.attachEvent('onmessage', resize);
    }

    function resize(e) {
        if (e.origin === Grnhse.Settings.targetDomain && e.data > 0) {
            instance.htmlElement.setAttribute('height', e.data);
        }
    }
};
// Since IE8 and other old browsers don't support postMessage, 
// just let the div scroll if postMessage is unsupported
Grnhse.Div.prototype.supportAwfulBrowsers = function () {
    var browserHelper = Grnhse.BrowserHelper;
    if (!browserHelper.supportsPostMessage()) {
        this.config['scrolling'] = 'yes';
        this.config['height'] = 1000;
    }
};
/**
 * Load the div
 * 
 * @param {type} jobId
 * @param {type} source
 * @returns {Grnhse.Div}
 */
Grnhse.Div.load = function (jobId, source) {
    var r = Grnhse.Route,
        uriHelper = Grnhse.UriHelper,
        jobId = jobId || uriHelper.getParam(Grnhse.Const.JOB_ID),
        source = source || uriHelper.getParam(Grnhse.Const.SOURCE_TOKEN),
        viewingApplication = !!jobId,
        pathToLoad = viewingApplication ? r.applicationUrl(source, jobId) : r.boardUrl(source);
    return new Grnhse.Div(pathToLoad);
};
//This alias is being introduce for backwards compatibility 
//with the old job board code
var _grnhse = _grnhse || {};
_grnhse.load = Grnhse.Div.load;
(function () {
    if (Grnhse.Settings.autoLoad) {
        var f = window.onload;
        window.onload = function () {
            try {
                if (typeof f === 'function') {
                    f();
                }
            } catch (e) {
                console.error(e);
            } finally {
                Grnhse.Div.load();
            }
        };
    }
})();
