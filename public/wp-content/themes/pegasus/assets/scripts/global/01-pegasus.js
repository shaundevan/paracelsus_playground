/**
 *  pegasus
 *
 *  The main pegasus JS object
 *
 *  @since	2.0.0
 *
 */

// Initialise the global pegasus object
let pegasus = {};

// Set as a browser global
window.pegasus = pegasus;

/**
 *  getURL
 *
 *  Get the current URL of the page without any search params
 *
 *  @since	2.0.0
 *
 *  @return	current url
 */
pegasus.getURL = () => {
    return window.location.protocol + '//' + window.location.hostname + window.location.pathname;
};

/**
 *  urlWithParams
 *
 *  Add url parameters onto any url
 *
 *  @since	2.0.0
 *
 *  @param	key      Param key.
 *  @param  value    Param value.
 *  @param  location URL to add params to (Optional)
 *  @return string 	 current url with appended params
 */
pegasus.urlWithParams = (key, value, location = window.location.href) => {
    if (typeof key !== 'string' || typeof value !== 'string') {
        throw new TypeError('Key and value must be strings');
    }

    let url;
    try {
        url = new URL(location);
    } catch (error) {
        throw new Error('Invalid URL');
    }

    let params = new URLSearchParams(url.search);
    params.append(key, value);

    url.search = params.toString();

    return url.toString();
}

/**
 *  ajaxContent
 *
 *  Pull any content from another page
 *
 *  @since	2.0.0
 *
 *  @param	url       The URL to pull the content from.
 *  @param  elements  The selector(s) of the elements to grab.
 *  @param  data      Additional Ajax data to send with the request
 *  @param  callback  A function to run after the ajax request has completed.
 *  @return mixed
 */
pegasus.ajaxContent = (url, elements = [], data = {}, callback) => {

    pegasus.fetchContent(url, data)
        .then(resp => {
            if (!resp.ok) {
                throw Error(resp.statusText);
            }
            return resp.text();
        })
        .then(text => {
            pegasus.ajaxReplaceContent(text, elements);
        })
        .then(() => {
            if (typeof callback !== 'undefined') {
                callback();
            }
        })
        .catch(error => {
            console.error(error);
            if (typeof callback !== 'undefined') {
                callback();
            }
        });

    return this;
}

/**
 *  loadMoreContent
 *
 *  Pull any content from another page and load it beneath the selected component
 *
 *  @since	2.0.0
 *
 *  @param	url        The URL to pull the content from.
 *  @param  container  The container to add the new content into.
 *  @param  elements   The selector(s) of the elements to grab.
 *  @param  data       Additional Ajax data to send with the request
 *  @param  callback   A function to run after the ajax request has completed.
 *  @return mixed
 */
pegasus.loadMoreContent = (url, container, elements = [], data = {}, callback) => {

    pegasus.fetchContent(url, data)
        .then(resp => {
            if (!resp.ok) {
                throw Error(resp.statusText);
            }
            return resp.text();
        })
        .then(text => {
            const parser = new DOMParser(),
                doc = parser.parseFromString(text, 'text/html');

            elements.map(elem => {
                const find = document.querySelector(container),
                    append = doc.querySelectorAll(`${container} ${elem}`);

                append.forEach(el => {
                    find.appendChild(el);
                })
            });
        })
        .then(() => {
            if (typeof callback !== 'undefined') {
                callback();
            }
        })
        .catch(error => {
            console.error(error);
            if (typeof callback !== 'undefined') {
                callback();
            }
        });
}

/**
 *  fetchContent
 *
 *  Returns an ajax fetch request
 *
 *  @since	2.0.0
 *
 *  @param	url       The URL to fetch from.
 *  @param  data      Additional Ajax data to send with the request
 *  @return object 	  Ajax response data
 */
pegasus.fetchContent = async (url, data = {}) => {
    return await fetch(url, pegasus.setAjaxData('GET', data));
}

/**
 *  setAjaxData
 *
 *  Returns an object of Ajax headers
 *
 *  @since	2.0.0
 *
 *  @param	method    The request method required
 *  @param  data      Additional data to merge with the default headers
 *  @return object 	  Ajax request headers
 */
pegasus.setAjaxData = (method, data) => {

    const defaults = {
        method: `${method}`,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
    }

    return pegasus.extend(defaults, data);
}

/**
 *  ajaxReplaceContent
 *
 *  Replaces current DOM elements with elements from a given html document
 *
 *  @since	2.0.0
 *
 *  @param	html      The html document provided as a string
 *  @param  elements  An array of element selectors to overwrite
 *  @return mixed
 */
pegasus.ajaxReplaceContent = (html, elements) => {

    const parser = new DOMParser(),
        doc = parser.parseFromString(html, 'text/html');

    elements.map(elem => {
        const find = document.querySelectorAll("["+elem+"]")[0],
            replace = doc.querySelectorAll("["+elem+"]")[0];

        find.parentNode.replaceChild(replace, find);

    });

    return this
}

/**
 *  extend
 *
 *  Replicates the jQuery $.extend functionality and merges multiple objects.
 *
 *  @since	2.0.0
 *
 *  @return object
 */
pegasus.extend = function(){
    // Variables
    let extended = {};
    let deep = false;
    let i = 0;
    let length = arguments.length;

    // Check if a deep merge
    if (Object.prototype.toString.call( arguments[0] ) === '[object Boolean]') {
        deep = arguments[0];
        i++;
    }

    // Merge the object into the extended object
    let merge = function (obj) {
        for ( let prop in obj ) {
            if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                // If deep merge and property is an object, merge properties
                if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                    extended[prop] = pegasus.extend( true, extended[prop], obj[prop] );
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    };

    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
        let obj = arguments[i];
        merge(obj);
    }

    return extended;

}

/**
 *  onResizeFinished
 *
 *  Add window resize listener, with timeout throttle and onLoad call
 *
 *  @since	2.0.0
 *
 *  @param	callback      The function to run
 *  @param  runOnLoad     Boolean, whether to run on page load
 */
pegasus.onResizeFinished = (callback, runOnLoad) => {
    let resizeTimer;

    window.addEventListener('resize', e => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(callback, 50);
    });

    if (runOnLoad)
        callback.call();
};

/**
 *  scroll
 *
 *  Scroll helper to control scrolling to certain areas on the page when needed.
 *
 *  @since	2.0.0
 *
 *  @param	target            The element to base the scrolling behaviour around.
 *  @param  additionalOffset  The additional offset to apply to the scroll position
 *  @param  behaviour         Where in the document should be scrolled to in relation to the target scrollTo | scrollPast
 *  @return mixed
 */
pegasus.scroll = (target, additionalOffset = 0, behaviour = 'scrollTo') => {
    if(!target || !target instanceof HTMLElement){
        throw new Error('The target element must be an HTML element.');
    }

    const rect = target.getBoundingClientRect(),
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if(behaviour === 'scrollTo'){
        offset = rect.top + scrollTop + additionalOffset;
    }

    if(behaviour === 'scrollPast'){
        offset = (rect.top + target.offsetHeight) + scrollTop + additionalOffset;
    }

    let scrollY = offset;

    if(scrollY > document.body.offsetHeight){
        scrollY = document.body.offsetHeight;
    } else if(scrollY < 0){
        scrollY = 0;
    }

    window.scrollTo({
        top: scrollY,
        behavior: 'smooth'
    });

}

/**
 *  setCookie
 *
 *  Sets a browser cookie
 *
 *  @since	2.0.0
 *
 *  @param	name     Sets cookie name
 *  @param	value    Sets cookie value
 *  @param	exdays    Sets cookie expiry in days
 */
pegasus.setCookie = (name, value, exdays) => {

    const d = new Date();

    d.setTime(d.getTime() + (exdays*24*60*60*1000));

    let expires = "expires="+ d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";

};

/**
 *  getCookie
 *
 *  Gets a browser cookie
 *
 *  @since	2.0.0
 *
 *  @param	name     Get cookie by name
 *  @return string   Returns value of cookie or empty string
 */
pegasus.getCookie = (name) => {

    let cookieName = name + "=";

    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return "";

};

/**
 * stringToHTML
 *
 * Converts a template string into HTML DOM nodes
 *
 * @since  2.0.0

 * @param  string     The template string
 * @return node       The template HTML
 */
pegasus.stringToHTML = function (str) {

    const support = (function () {
        if (!window.DOMParser) return false;
        const parser = new DOMParser();
        try {
            parser.parseFromString('x', 'text/html');
        } catch(err) {
            return false;
        }
        return true;
    })();

    // If DOMParser is supported, use it
    if (support) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(str, 'text/html');
        return doc.body.firstChild;
    }

    // Otherwise, fallback to old-school method
    const dom = document.createElement('div');
    dom.innerHTML = str;
    return dom;

};

/**
 * getElemOffset
 *
 * Returns the top, bottom, and left position of the given element
 *
 * @since  2.0.0

 * @param  node     The element to get the offset of
 * @return object   Object containing top, bottom, and left positions
 */

pegasus.getElemOffset = (el) => {
    if (!el || !el.getBoundingClientRect) return null;
    const rect = el.getBoundingClientRect(),
        scrollLeft = window.scrollX || document.documentElement.scrollLeft,
        scrollTop = window.scrollY || document.documentElement.scrollTop;

    return { top: rect.top + scrollTop, bottom: (rect.top + scrollTop) + rect.height, left: rect.left + scrollLeft }
}

/**
 * parallaxScroll
 * 
 * Parallax scroll effect for elements
 * 
 * @since 2.0.0
 * 
 * @param  elem     The element to apply the parallax effect to
 * @param  speed    The speed of the parallax effect
 * @return void
 */
pegasus.parallaxScroll = (elem, speed = 0.1) => {
    if (!elem) return;

    if(window.innerWidth < 992) return;

    window.addEventListener('scroll', () => {
        const rect = elem.getBoundingClientRect(); // Get the element's position relative to the viewport
        const windowHeight = window.innerHeight; // Get the window height
        const elementCenter = rect.top + rect.height / 2; // Calculate the element's center position

        // Calculate the distance between the element's center and the center of the viewport
        const distanceFromCenter = elementCenter - (windowHeight / 2);
        const translateY = (distanceFromCenter * speed);

        // Apply the parallax effect if the element is within the viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
            elem.style.transform = `translateY(${translateY}px)`;
        }
    }, { passive: true });
};

export { pegasus };