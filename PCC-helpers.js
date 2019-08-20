var PCC_HELPERS = {
// wrapper object for subsidiary functions

isIE: function isIE()
{
    // is the user misguided enough to be using Internet Explorer (versions 11 and below)
    var ua = window.navigator.userAgent; // Check the userAgent property of the window.navigator object
    var msie = ua.indexOf('MSIE '); // IE 10 or older
    var trident = ua.indexOf('Trident/'); //IE 11

    return (msie > 0 || trident > 0);
},

// methods related to the UI 

get_element_position: function get_element_position(elem)
{
    // returns the (x,y) position of the top right corner of an element relative to the viewport
    var body_rect = document.body.getBoundingClientRect();
    var elem_rect = elem.getBoundingClientRect();
    return [elem_rect.left - body_rect.left, elem_rect.top - body_rect.top];
},

lock_user_input: function lock_user_input(type)
{
    // I don't want the user to be able to change anything while the image is rendering, so lock
    // all the user inputs
    try
    {
        // anything a pesky user could change
        var inputs = ["surprise-button",
                      "kayak-form",
                      "basecolour-form",
                      "bowsplash-form",
                      "sternsplash-form",
                      "grabhandles-form",
                      "seattrim-form"
                    ];
        for(var i = 0; i < inputs.length; i++)
        {
            if(type === "unlock")
            {
                // enables each element
                document.getElementById("PCC-"+inputs[i]).removeAttribute("disabled");
            }
            else if(type === "lock")
            {
                // disables each element
                document.getElementById("PCC-"+inputs[i]).setAttribute("disabled", "disabled");
            }
        }
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_HELPERS.lock_user_input: "+e);
    }
},

resize_wrapper: function resize_wrapper()
{
    /* this function serves two purposes: 
       - changes the vertical height of the wrapper to accomodate kayaks of variable size
       - changes the resolution of source image to use based on viewport size */
    try
    {
        // size information of canvas
        var canvas_rect = document.getElementById("PCC-reference-canvas").getBoundingClientRect();

        // we cannot guarantee that the browser will have rendered the canvas box onto the DOM or that
        // it will have any size at all. So we use requestAnimationFrame to request the page updates before
        // rerunning this method. This ensures that all sizes exist before proceeding
        if (!canvas_rect.width || !canvas_rect.bottom) // if sizes are zero (i.e. page hasn't updated)
        {
            window.requestAnimationFrame(resize_wrapper);
        }
        else
        {
            // gets user preference of resolution to use
            var force_size = document.getElementById("PCC-imgsize-options").value;
            
            if(force_size === "auto")
            {
                // user is letting me decide what res to use (fools *chuckles*)
                // uses smallest possible resolution that is larger than the canvas size
                if(canvas_rect.width > 1700) {
                    PCC_INFO.image_size = 'max' // largest possible res, ~1950-2200px
                } else if(canvas_rect.width > 1400) {
                    PCC_INFO.image_size = 'large' // 1700px source
                } else if(canvas_rect.width > 1100) {
                    PCC_INFO.image_size = 'medium' // 1400px source
                } else if(canvas_rect.width > 800) {
                    PCC_INFO.image_size = 'small' // 1100px source
                } else {
                    PCC_INFO.image_size = 'tiny' // 800px source, for all those potatoes out there
                }
            }
            else
            {
                // user has specified certain resolution
                PCC_INFO.image_size = force_size;
            }

            // amount page has been scrolled down
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var wrapper = document.getElementById("PCC-wrapper");
            // set wrapper to be tall enough to encompass canvas, plus some for the text at the bottom
            wrapper.style.height = canvas_rect.bottom + scrollTop + 30 + 'px';      
        }


    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_HELPERS.resize_wrapper: "+e);
    }
},

display_error: function display_error(message)
{
    // lets the user know that something has gone wrong
    var contact_email = "crymeariver@warwickcanoe.co.uk" // maybe change this to something more appropriate?
    var error_box = document.getElementById("PCC-error-box");
    // dump detailed error onto the console
    console.log("Error: " + message);
    console.log("");
    error_box.innerHTML = "An error has occured - see the console for more details.<br>Try reloading the page, and if the problem persists contact "+contact_email;
    // chances are input was locked, not that unlocking it will do much now an error has happened
    PCC_HELPERS.lock_user_input("unlock");
},

clear_error: function clear_error()
{
    document.getElementById("PCC-error-box").innerHTML = '';
},

// methods relating to image and colour manipulation

rgb_to_hsl: function rgb_to_hsl(R, G, B)
{
    // rgb with R,G,B in the range 0-255
    // hsl with H from 0-360 and S,L from 0-1
    var r = R/255;
    var g = G/255;
    var b = B/255;
    var c_max = Math.max(r, g, b);
    var c_min = Math.min(r, g, b);
    var delta = c_max - c_min;
    // calculate hue, H
    if(delta === 0) {
        var H = 0;
    } else if(c_max === r) {
        var H = 60*(((g - b)/delta)%6);
    } else if(c_max === g) {
        var H = 60*(((b - r)/delta)+2);
    } else if(c_max === b) {
        var H = 60*(((r -g)/delta)+4);
    }
    H = PCC_MATHS.hue_mod(H); // H could be <0 or >360
    // calculate lightness, L
    var L = (c_max + c_min)/2;
    // calculate saturation, S
    if(delta === 0) {
        var S = 0;
    } else {
        var S = delta/(1-Math.abs((2*L)-1));
    }

    return [H, S, L];
},

hsl_to_rgb: function hsl_to_rgb(H, S, L)
{
    // rgb with r,g,b in the range 0-255
    // hsl with h from 0-360 and s,l from 0-1
    // explanation: https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB
    var k = function(n) {return (n+(H/30))%12};
    var a = S*Math.min(L, 1-L);
    var f = function(n)
    {
        return L-(a*Math.max(Math.min(k(n)-3, 9-k(n), 1), -1));
    }
    return [255*f(0), 255*f(8), 255*f(4)];
},

combine_colours: function combine_colours(primary, secondary, include_alpha)
{
    // Thanks to JordanDelcros - https://gist.github.com/JordanDelcros/518396da1c13f75ee057

    // should the method return the new transparency value or not?
    include_alpha = (include_alpha === undefined ? true : include_alpha);

    var rgba1 = [0,0,0,0];
    var rgba2 = [0,0,0,0];
    // convert down to 0-1 range
    for(var j = 0; j < 4; j++)
    {
        rgba1[j] = primary[j]/255;
        rgba2[j] = secondary[j]/255;
    }
    var alpha = 1-((1-rgba1[3])*(1-rgba2[3]));
    var rgba = [255,255,255,255*alpha];
    if(alpha !== 0)
    {
        for(var i = 0; i < 3; i++)
        {
            rgba[i] *= (1/alpha) * ( (rgba1[i]*rgba1[3]) + (rgba2[i]*rgba2[3]*(1-rgba1[3])) );
        }
    }
    else
    {
        rgba = [0,0,0,0];
    }
    if(include_alpha)
    {
        // return RGBA colour
        return rgba;
    }
    else
    {
        // only interested in RGB
        return rgba.slice(0,3);
    }
},

image_to_canvas: function image_to_canvas(img, canvas_name, overwrite)
{
    // write a generic image source onto a canvas
    // this method deliberately doesn't have error handling, as if an error occurs it is 
    // much more useful to know where it was called from

    if(img === undefined) {throw "image is inaccessible or does not exist"}
    
    overwrite = (overwrite === undefined) ? true : overwrite;
    var canvas = document.getElementById("PCC-"+canvas_name);

    if(canvas === undefined) {throw "canvas inaccessible or invalid canvas name"}

    // rescale canvas to be large enough to take image
    // NOTE: this doesn't change the _visible_ width of the canvas, only it's internal size
    // To access the visible size of a canvas on a page, use canvas.scrollWidth or canvas.getBoundingClientRect() instead
    var ctx = canvas.getContext("2d");
    canvas.width = (img.naturalWidth === undefined ? img.width : img.naturalWidth);
    canvas.height = (img.naturalHeight === undefined ? img.height : img.naturalHeight);

    if(overwrite === true)
    {
        // clean the canvas of any previous image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // write image onto canvas
    ctx.drawImage(img, 0, 0, img.width, img.height);

    if(canvas_name === "reference-canvas")
    {
        // reference canvas has changed, new kayak image!

        // resize wrapper to make sure the new kayak fits
        PCC_HELPERS.resize_wrapper();
        // set the width of the visible render canvas ready to be painted
        var main_canvas = document.getElementById("PCC-main-canvas");
        main_canvas.width = canvas.width;
        main_canvas.height = canvas.height;
    }
},

}