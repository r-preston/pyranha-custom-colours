window.addEventListener("load", function(event)
{
    try
    {
        if(PCC_HELPERS.isIE())
        {
            // you can guarantee someone's going to still be using IE *deep sigh*
            this.alert("ATTENTION - you appear to be using Internet Explorer.\nThis browser is no longer widely "+
                       "supported, which may mean this page does not work properly.\nConsider using a modern "+
                       "browser such as Edge, Firefox or Chrome to ensure everything works as it should.");
        }

        // set the colour options to a random selection. variety is the spice of life
        // false means don't run any of the update functions yet, as the canvases aren't ready
        PCC_MAIN.random_colours(false);

        // check if the colour <option>s have an associated RGB value in PCC_INFO.colour_options (if not, remove them)
        var colour_selects = document.getElementsByClassName("PCC-select-colour");
        for(var i = 0; i < colour_selects.length; i++)
        {
            for(var j = 0; j < colour_selects[i].children.length; j++)
            {
                // does the value exist as a propery (and hence an RGB value)?
                if(!PCC_INFO.colour_options.hasOwnProperty(colour_selects[i].children[j].value))
                {
                    this.console.log("Warning: colour option '"+colour_selects[i].children[j].text+
                                     "' has no RGB value associated with it and was removed");
                    colour_selects[i].removeChild(colour_selects[i].children[j]);
                    j--;
                }
            }
        }
        var grab_select = this.document.getElementById("PCC-grabhandles-form");
        for(var j = 0; j < grab_select.children.length; j++)
        {
            // does the value exist as a propery (and hence an RGB value)?
            if(!PCC_INFO.grab_colours.hasOwnProperty(grab_select.children[j].value))
            {
                this.console.log("Warning: colour option '"+grab_select.children[j].text+
                    "' has no RGB value associated with it and was removed");
                    grab_select.removeChild(grab_select.children[j]);
                j--;
            }
        }
        var trim_select = this.document.getElementById("PCC-seattrim-form");
        for(var j = 0; j < trim_select.children.length; j++)
        {
            // does the value exist as a propery (and hence an RGB value)?
            if(!PCC_INFO.trim_colours.hasOwnProperty(trim_select.children[j].value))
            {
                this.console.log("Warning: colour option '"+trim_select.children[j].text+
                    "' has no RGB value associated with it and was removed");
                    trim_select.removeChild(trim_select.children[j]);
                j--;
            }
        }

        // each of the four source images for a kayak is stored in an <img> element
        // set event listener so that when any are changed they call have_sources_loaded so that processing
        // can start when all four have loaded
        var source_images = document.getElementsByClassName("PCC-src-image");
        for(var i = 0; i < source_images.length; i++)
        {
            // make sure user is alerted in the event of an error
            source_images[i].onerror = function () { PCC_HELPERS.display_error("File not found"); }
            // add event listener that will trigger whenever img.src is changed
            source_images[i].addEventListener("load", function(event) { PCC_MAIN.have_sources_loaded(event); } );
        }    

        // add event listener to clear an error when the user tries to do something else
        var user_inputs = document.getElementsByClassName("PCC-user-input");
        for(var i = 0; i < user_inputs.length; i++)
        {
            user_inputs[i].addEventListener("change", function(event) { PCC_HELPERS.clear_error(); } );
        }

        // adjust scaling depending on the viewport dimensions
        PCC_HELPERS.check_page_scaling();

        // start the process running
        PCC_MAIN.update_kayak();
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC-main.js:window.addEventListener: "+e);
    }
})

window.addEventListener('touchstart', function()
{
    // the user has touched the screen, so enable touchscreen usage
    if(!PCC_INFO.touchscreen)
    {
        // touchscreen device variable
        PCC_INFO.touchscreen = true;
        // dropdown lists can be popups in touchscreen devices, so diable colour indicators for dropdowns
        document.getElementById("PCC-colour-indicator").style.visibility = "hidden";

        // make buttons and links larger 
        var tds = this.document.getElementsByTagName("TD");
        for(var i = 0; i < tds.length; i++)
        {
            tds[i].style.fontSize = "30px";
        }
        this.document.getElementById("PCC-order-form-link").style.fontSize = "36px";
        this.document.getElementById("PCC-order-form-link").style.padding = "10px 0";
        this.document.getElementById("PCC-download-image").style.fontSize = "36px";
        this.document.getElementById("PCC-imgsize-options").style.fontSize = "34px";
        this.document.getElementById("PCC-imgscale-selector").style.fontSize = "36px";
        this.document.getElementById("PCC-appearance-disclaimer").style.fontSize = "22px";
        var selects = this.document.getElementsByClassName("PCC-user-input");
        for(var i = 0; i < selects.length; i++)
        {
            if(selects[i].id !== "PCC-surprise-button")
            {
                selects[i].style.fontSize = "36px";
                selects[i].style.height = "84px";
            }
        }
        
        this.window.requestAnimationFrame(function(){
            var surprise_button = document.getElementById("PCC-surprise-button");
            var tables = document.getElementsByClassName("PCC-choice-table");
            if (PCC_INFO.page_layout === 'mobile')
            {
                surprise_button.style.height = (2*tables[0].offsetHeight).toString()+"px";
                surprise_button.style.marginTop = (-1*tables[0].offsetHeight).toString()+"px";
            }
            else if (PCC_INFO.page_layout === 'desktop')
            {
                surprise_button.style.height = tables[0].offsetHeight.toString()+"px";
                surprise_button.style.marginTop = "0px";
            }
        });
    }
    
})

window.addEventListener("click", function(event)
{
    if(PCC_INFO.touchscreen) { return 0; }
    // handles showing and hiding the colour squares that appear next to dropdowns. this couldn't be added into the select element so is done manually

    // select elements that need colour indicators and their respective lists of RGB values
    var targets = ["PCC-basecolour-form", "PCC-bowsplash-form", "PCC-sternsplash-form", "PCC-grabhandles-form", "PCC-seattrim-form"];
    var colour_lists = [PCC_INFO.colour_options, PCC_INFO.colour_options, PCC_INFO.colour_options, PCC_INFO.grab_colours, PCC_INFO.trim_colours];

    var target_index = targets.indexOf(event.target.id);
    // this is the container for the coloured squares
    var colourbox = document.getElementById("PCC-colour-indicator");

    // if the event (a) is targeted at one of the right dropdowns (b) is not the currently active dropdown and (c) actually has a target...
    if((target_index !== -1) && (event.target.id !== PCC_INFO.colourbox_location) && (event.target.id !== "") )
    {
        // then we want to show the colourbox and fill it with the right coloured squares

        // remove all existing squares
        while(colourbox.firstChild)
        {
            colourbox.removeChild(colourbox.firstChild);
        }
        // get position of the select element that was clicked
        var elem_pos = PCC_HELPERS.get_element_position(event.target);
        // move the colourbox to the right place beside the dropdown and make visible
        if(elem_pos[0] < 26)
        {
            colourbox.style.left = elem_pos[0] + event.target.offsetWidth + 'px';
        }
        else
        {
            colourbox.style.left = elem_pos[0] - 26 + 'px';
        }
        colourbox.style.top = elem_pos[1] + event.target.scrollHeight + 'px';
        colourbox.style.visibility = "visible";
        this.console.log(elem_pos)
        this.console.log(event.x +","+event.y)

        // for each option in the dropdown (which are the children of the <select> element)
        for(var i = 0; i < event.target.children.length; i++)
        {
            // create a div and colour it based on the <option> next to it
            // CSS takes care of the sizing etc
            var colourblob = document.createElement("DIV");
            var clr = colour_lists[target_index][event.target.children[i].value];
            colourblob.style.backgroundColor = "rgb("+clr[0]+","+clr[1]+","+clr[2]+")";
            colourblob.style.width  = "25px";
            colourblob.style.height = "25px";
            this.console.log(event.target.children[i].offsetHeight)
            colourbox.appendChild(colourblob);
        }

        // record the select element currently showing the colourbox
        // this is needed so that another click on the active dropdown hides the colourbox
        PCC_INFO.colourbox_location = event.target.id;
    }
    else
    {
        // otherwise click isn't interesting, hide the colourbox
        colourbox.style.visibility = "hidden";
        PCC_INFO.colourbox_location = '';
    }
})

window.addEventListener("resize", function(event)
{
    // canvases will scale with window, so need to resize wrapper with them
    PCC_HELPERS.check_page_scaling();
    PCC_HELPERS.resize_wrapper();
})

var PCC_MAIN = {
// wrapper for the primary methods of the page

have_sources_loaded: function have_sources_loaded(event)
{
    // we don't want to start image processing until all source images have loaded
    // this function is called once when each image loads (via event handler) and 
    // activates processing when all images have called it
    try
    {
        // imcrement image loaded count
        PCC_INFO.loaded_images++;
        // number of images that need to load
        if(PCC_INFO.loaded_images === document.getElementsByClassName("PCC-src-image").length)
        {
            // all images load, reset count and continue the process
            PCC_INFO.loaded_images = 0;
            PCC_MAIN.draw_new_kayak_images();
        }
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_MAIN.have_sources_loaded: "+e);
    }
},

update_kayak: function update_kayak()
{
    // this function is called whenever a new set of source images are loaded
    // can either be when a new kayak is chosen or new size of source image is used
    try
    {
        // lock user input to prevent any possible interference or nasty surprises
        PCC_HELPERS.lock_user_input("lock");
        // get human readable name and internal label (no numbers or spaces) of the current kayak
        var selection = document.getElementById("PCC-kayak-form");
        var kayak = selection.options[selection.selectedIndex].text;
        var kayak_label = selection.value;
        
        if(selection === undefined) {throw "user selection inaccessible"}
        if(kayak === undefined) {throw "kayak selection undefined"}

        // if the desired resolution is not the same as last time this was run, we need a new set
        // of colour masks for the new source images
        if(PCC_INFO.image_size !== PCC_INFO.prev_img_size[kayak_label])
        {
            console.log("image size has changed, resetting masks");
            PCC_INFO.colour_masks[kayak_label] = [ [],[],[],[] ];
        }
        // nw current size becomes 'last used' size
        PCC_INFO.prev_img_size[kayak_label] = PCC_INFO.image_size;
    
        // load source files into <img> elements in the document
        // this will trigger the next stage though the img's event listeners
        var source_images = document.getElementsByClassName("PCC-src-image");
        for(var i = 0; i < source_images.length; i++)
        {
            var suffix = source_images[i].id.split("_").pop();
            suffix = (suffix === "" ? kayak : suffix);
            source_images[i].src = "PCC-resource/"+kayak+"/"+PCC_INFO.image_size+"/"+suffix+".png";
        }

        // set the image next to kayak selection to the logo of the kayak and set it to take you to 
        // it's page on the Pyranha website when clicked
        var logo = document.getElementById("PCC-kayak-logo");
        logo.style.backgroundImage = "url('./PCC-resource/"+kayak+"/Logo.png')";
        var link = document.getElementById("PCC-logo-link");
        link.href = "http://www.pyranha.com/kayaks.php?kayak="+kayak.replace(new RegExp(' ', 'g'), "%20");
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_MAIN.update_kayak: "+e);
        PCC_INFO.loaded_images = 0;
    }
},

draw_new_kayak_images: function draw_new_kayak_images()
{
    // images have now loaded into the document, this function now sends them to canvses
    try
    {
        var kayak = document.getElementById("PCC-kayak-form").value;

        if(kayak === undefined) {throw "kayak selection undefined"}
    
        var kayak_image = document.getElementById("PCC-src-image_");
        var grab_image = document.getElementById("PCC-src-image_Grabs");
        var trim_image = document.getElementById("PCC-src-image_Trim");
        var misc_image = document.getElementById("PCC-src-image_Misc");
        
        if(kayak_image === undefined) {throw "kayak image does not exist or is inaccessible"}
        if(grab_image === undefined) {throw "grab handle image does not exist or is inaccessible"}
        if(trim_image === undefined) {throw "trim image does not exist or is inaccessible"}
        if(misc_image === undefined) {throw "misc kayak image does not exist or is inaccessible"}
    
        PCC_HELPERS.image_to_canvas(kayak_image, "reference-canvas");
        PCC_HELPERS.image_to_canvas(grab_image, "grabs-canvas");
        PCC_HELPERS.image_to_canvas(trim_image, "trim-canvas");
        PCC_HELPERS.image_to_canvas(misc_image, "misc-canvas");

        // checks if PCC_INFO.colour_masks has any data by summing the lengths of each subarray
        if(PCC_INFO.colour_masks[kayak].reduce((total, elem) => total + elem.length, 0) === 0)
        {
            // no data, need to create masks
            PCC_MAIN.create_colour_masks();
        }
        else
        {
            // masks already exist, go ahead and recolour
            PCC_MAIN.update_colours();
        }
        // recolour the grabs and trim, these are super quick so no masks needed
        PCC_MAIN.update_grabs();
        PCC_MAIN.update_trim();
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_MAIN.draw_new_kayak_images: "+e);
    }
},

create_colour_masks: function create_colour_masks()
{
    // processing the image from scratch is an intensive and not especially quick process. in order to speed up recolouring, this 
    // function is called once for each set of source images to try and speeed this up.
    // it tries to do as much work as possible towards processing without knowing the eventual colours of the processed image, and 
    // then stores this data in PCC_INFO.colour_masks. when swaping between this kayak this information is preserved to speed up 
    // swapping between kayaks as well.
    try
    {
        // this can take a little while, so show loading message and hide canvases
        document.getElementById("PCC-angry-fish-loading-message").style.display = "block";
        document.getElementById("PCC-canvas-wrapper").style.display = "none";
        document.getElementById("PCC-angry-fish-loading-message-text").innerHTML = "Generating colour masks, this takes a few seconds...";
        // this setTimeout has a delay of 100ms. this is to allow the above DOM changes to take effect before the heavy lifting
        // happens and jams the page. without it the loading message would never appear
        setTimeout(function()
        {
    
        // get data from reference canvas
        var ref_canvas = document.getElementById("PCC-reference-canvas");
        if(ref_canvas === undefined) {throw "source canvas is inaccessible"}
        var ref_ctx = ref_canvas.getContext("2d");
        var imagedata = ref_ctx.getImageData(0, 0, ref_canvas.width, ref_canvas.height).data;
        if(imagedata === undefined) {throw "could not retrieve canvas data"}
    
        var rgb_to_hsl = PCC_HELPERS.rgb_to_hsl;
        var noo = PCC_MATHS.noo;
        var least_angle = PCC_MATHS.least_angle;
    
        // source information
        var kayak = document.getElementById("PCC-kayak-form").value;
        var main_colour   = rgb_to_hsl(...PCC_INFO.source_info[kayak][0]);
        var bow_colour    = rgb_to_hsl(...PCC_INFO.source_info[kayak][1]);
        var stern_colour  = rgb_to_hsl(...PCC_INFO.source_info[kayak][2]);
        // cutoffs are a proportioin of length, so need to scale to match resolution of source
        var cutoffs = PCC_INFO.splash_cutoffs[kayak].map(x => x*ref_canvas.width);
        
        if(cutoffs[0] < 0)
        {
            // if bow cutoff is less than zero, set it to end of image
            cutoffs[0] = ref_canvas.width;
        }
        if(cutoffs[1] > ref_canvas.width)
        {
            // if stern cutoff is beyond end of image reset to zero
            cutoffs[1] = 0;
        }

        /*
        Beginning of image processing - overview of what is going on:

        The recolouring process works on the basis of 'hue rotation'.
        In HSL form, every colour is composed of three parts:
            Hue is the apparent colour. All hues are points on the circumference of a circle, with red at 0/360 degrees, 
              green at 120 and blue at 240. See https://www.quackit.com/pix/stock/color_wheel_hsl.png
            Saturation is how rich a colour appears. 1 is purest, 0 is grey
            Lightness is how light or dark a colour is. 0 is black, 1 is white 
        By only considering hue, the shadows, highlights, edges and texture of theoriginal image are preserved in the
          saturation and lightness components
        What happens in the process is that a 'wedge' of the hue circle around each source colour is rotated around
          the circle so the new centre of the wedge is the target colour
        The lightness and saturation are also sligthly adjusted to account for the different brightnesses of possible
          options and source colours - dark grey is much darker than orange, for example
        */
    
        var hsl;
        var angle;
        var modified;
    
        // These are the cutoff angles for which all colours closer to the source than will be rotated.
        // These are as large as possible so that every colour that less that this radius from a given
        // source colour are closer to this colour than any other. This is essentially adjusting the 
        // sensitivity of the process depending on how 'close' the source colours are to each other
        var bow_comparison_radius  = least_angle(main_colour[0], bow_colour[0]);
        var stern_comparison_radius  = least_angle(main_colour[0], stern_colour[0]);
        var hull_comparison_radius = Math.min(...[bow_colour[0], stern_colour[0]].map(x => least_angle(x, main_colour[0])) );

        /*
        stores colour masks for each kayak
        structure:
            0th array: source image data in HSL format
            1st array: main colour info: hue angle from source only
            2nd array: bow splash info: angle, layer opacity, hull opacity, ratio of 2 previous
            3rd array: stern splash info: angle, layer opacity, hull opacity, ratio of 2 previous
        0, 2 and 3 have same length as canvas data
        1 has length (canvas data)/4
        */
        var hsl_mask   = PCC_INFO.colour_masks[kayak][0];
        var main_mask  = PCC_INFO.colour_masks[kayak][1];
        var bow_mask   = PCC_INFO.colour_masks[kayak][2];
        var stern_mask = PCC_INFO.colour_masks[kayak][3];
        
        for(var i = 0; i < imagedata.length; i += 4)
        {
            // iterate through pixels of source image. i is red, i+1 green, i+2 blue and i+3 opacity
            modified = false;
            if(imagedata[i+3] === 0)
            {
                // pixel is transparent, information about pixel is irrelevant and we can move on
                hsl_mask.push(0, 0, 0, 0);
                main_mask.push(0);
                bow_mask.push(0, 0, 0, 0);
                stern_mask.push(0, 0, 0, 0);
                continue;
            }
            // convert the pixel from standard RGB into HSL
            hsl = rgb_to_hsl(imagedata[i], imagedata[i+1], imagedata[i+2]);

            // angle between pixel hue and source colour hue
            angle = least_angle(hsl[0], main_colour[0]);
            if(angle < hull_comparison_radius)
            {
                // pixel is closer to main colour than any other
                modified = true;
            }
            // this is useful, save for later process
            main_mask.push(angle);
            
            // next if-else deals with the bow splash
            // only consider if less than the bow cutoff
            if(PCC_MATHS.what_x(i/4, ref_canvas.width) < cutoffs[0]*1.05) // 1.05 to account for creating a gradient to avoid unsightly vertical lines
            {
                // angle between pixel hue and source colour hue, keep for later
                angle = least_angle(hsl[0], bow_colour[0]);
                bow_mask.push(angle);
                if(angle < bow_comparison_radius) // is it closer to bow source colour than any other?
                {
                    // opacity makes the boundary between splash and main colour smoother. also add decrease in gradient over cutoff boundary
                    //                  |------- cutoff boundary opacity. looks like _/`` over boundary ------| |--- bow-main colour boundary --|
                    //                  |                                                                     | |                               |
                    var layer_opacity = noo( 21 - ( (20*PCC_MATHS.what_x(i/4, ref_canvas.width))/cutoffs[1] ) )*(1-(angle/bow_comparison_radius));
                    bow_mask.push(layer_opacity, 1-layer_opacity, angle/(bow_comparison_radius*layer_opacity));
                    modified = true;
                }
                else
                {
                    // not close enough to source, only angle important for later comparison
                    bow_mask.push(0, 0, 0);
                }
            }
            else
            {
                // beyond cutoff, bow splash irrelevant
                bow_mask.push(0, 0, 0, 0);
            }
            // next if-else deals with stern splash
            // format is identical to bow splash above, see above for explaining comments
            if(PCC_MATHS.what_x(i/4, ref_canvas.width) > (cutoffs[1]*0.95)) // 0.95 to account for creating a gradient to avoid unsightly vertical lines
            {
                angle = least_angle(hsl[0], stern_colour[0]);
                stern_mask.push(angle);
                if(angle < stern_comparison_radius)
                {
                    var layer_opacity = noo( ( (20*PCC_MATHS.what_x(i/4, ref_canvas.width))/cutoffs[1] ) - 19 )*(1-(angle/stern_comparison_radius));
                    stern_mask.push(layer_opacity, 1-layer_opacity, angle/(stern_comparison_radius*layer_opacity));
                    modified = true;
                }
                else
                {
                    stern_mask.push(0, 0, 0);
                }
            }
            else
            {
                stern_mask.push(0, 0, 0, 0);
            }
            
            if(modified)
            {
                // if the pixel is going to be rotated, keep HSL colour
                hsl_mask.push(...hsl, imagedata[i+3]);
            }
            else
            {
                // colour is not going to be rotated, not similar to any source colour
                // keep RGB to be kept in finished image unmodified
                hsl_mask.push(...imagedata.slice(i, i+4));
            }
        }
    
        // we've done what we can here to make recolouring as fast as possible, time to move on and do it
        PCC_MAIN.update_colours();

        }, 100);
    }
    catch(e)
    {
        // an error has occured, and the fish is not pleased...
        document.getElementById("PCC-angry-fish-loading-message-text").innerHTML = "Oh dear...";
        PCC_HELPERS.display_error("In PCC_MAIN.create_colour_masks: "+e);
    }
},

update_colours: function update_colours()
{
    // recolours the source image to specified colour using information from create_colour_masks
    try
    {
        var kayak = document.getElementById("PCC-kayak-form").value;
        if(PCC_INFO.image_size !== PCC_INFO.prev_img_size[kayak])
        {
            // window has been resized since last colour update, need to go back and update source images first
            console.log("image size has changed, updating kayak images and redoing masks");
            PCC_MAIN.update_kayak();
            // for some reason this interrupts the click event, the next two lines dispatch another
            // click event so that the dropdown option colour squares hide properly
            var evt = new MouseEvent("click", {bubbles: true, cancelable: true, view: window});
            document.getElementById("PCC-wrapper").dispatchEvent(evt);
            return 0;
        }
        // show loading message
        document.getElementById("PCC-angry-fish-loading-message-text").innerHTML = "Recolouring image...";
        document.getElementById("PCC-angry-fish-loading-message").style.display = "block";
        document.getElementById("PCC-canvas-wrapper").style.display = "none";
        // this setTimeout has a delay of 100ms. this is to allow the above DOM changes to take effect before the heavy lifting
        // happens and jams the page. without it the loading message would never appear
        setTimeout(function()
        {

        var hsl_to_rgb = PCC_HELPERS.hsl_to_rgb;
        var rgb_to_hsl = PCC_HELPERS.rgb_to_hsl;
        var hue_mod = PCC_MATHS.hue_mod;
        var noo = PCC_MATHS.noo;
        var least_angle = PCC_MATHS.least_angle;
        var combine_colours = PCC_HELPERS.combine_colours;

        // colours chosen by the user to render in
        var render_colours_rgb = [
            PCC_INFO.colour_options[document.getElementById("PCC-basecolour-form").value],
            PCC_INFO.colour_options[document.getElementById("PCC-bowsplash-form").value],
            PCC_INFO.colour_options[document.getElementById("PCC-sternsplash-form").value]
        ];
        // convert to HSL
        var render_colours = render_colours_rgb.map(x => rgb_to_hsl(...x));

        // set colour boxes above selection
        document.getElementById("PCC-hull-highlight").style.backgroundColor = 
            "rgb("+render_colours_rgb[0][0]+","+render_colours_rgb[0][1]+","+render_colours_rgb[0][2]+")";
        document.getElementById("PCC-bow-highlight").style.backgroundColor = 
            "rgb("+render_colours_rgb[1][0]+","+render_colours_rgb[1][1]+","+render_colours_rgb[1][2]+")";
        document.getElementById("PCC-stern-highlight").style.backgroundColor = 
            "rgb("+render_colours_rgb[2][0]+","+render_colours_rgb[2][1]+","+render_colours_rgb[2][2]+")";
    
        // colours of source image
        var main_colour   = rgb_to_hsl(...PCC_INFO.source_info[kayak][0]);
        var bow_colour    = rgb_to_hsl(...PCC_INFO.source_info[kayak][1]);
        var stern_colour  = rgb_to_hsl(...PCC_INFO.source_info[kayak][2]);

        var hsl        = PCC_INFO.colour_masks[kayak][0];
        var main_mask  = PCC_INFO.colour_masks[kayak][1];
        var bow_mask   = PCC_INFO.colour_masks[kayak][2];
        var stern_mask = PCC_INFO.colour_masks[kayak][3];        
    
        // This is the radius of the wedge that colours are rotated onto
        // This number just comes from looking at a colour wheel and estimating the width of hues
        // Variation in this number doesn't make a huge difference, but 15 seems best
        var destination_radius = 15;
        var new_rgb;
        var modified;
        var new_colour;
    
        // These are the cutoff angles for which all colours closer to the source than will be rotated.
        // These are as large as possible so that every colour that less that this radius from a given
        // source colour are closer to this colour than any other. This is essentially adjusting the 
        // sensitivity of the process depending on how 'close' the source colours are to each other
        var hull_comparison_radius = Math.min(...[bow_colour[0], stern_colour[0]].map(x => least_angle(x, main_colour[0])) );
        var bow_comparison_radius  = least_angle(main_colour[0], bow_colour[0]);
        var stern_comparison_radius  = least_angle(main_colour[0], stern_colour[0]);
    
        // array of pixel data for recoloured image
        var modified_imgdata = new Uint8ClampedArray(hsl.length);

        for(var i = 0; i < hsl.length; i += 4)
        {
            modified = false;
            if(hsl[i+3] === 0) { continue; } // skip transparent pixels
            modified_imgdata[i+3] = hsl[i+3];

            if(main_mask[i/4] < hull_comparison_radius)
            {
                // pixel is closer to main colour than any other
                new_rgb = hsl_to_rgb(
                                    // rotate hue, keeping relative variation the same
                                    hue_mod(render_colours[0][0] + main_mask[i/4]*(destination_radius/hull_comparison_radius)),
                                    // shift saturation, preserving variations
                                    noo(render_colours[0][1] + hsl[i+1] - main_colour[1]),
                                    // shift lightness, preserving variation
                                    noo(render_colours[0][2] + hsl[i+2] - main_colour[2])
                                    );
                // set new colour
                modified_imgdata[i  ] = new_rgb[0];
                modified_imgdata[i+1] = new_rgb[1];
                modified_imgdata[i+2] = new_rgb[2];
                modified = true;
            }
            if(bow_mask[i+1] > 0.05) 
            {
                // bow splash opacity is noticable, the angle check has already been done in create_colour_masks

                // create new colour similar to main colour above 
                new_rgb = hsl_to_rgb(
                                     hue_mod(render_colours[1][0] + bow_mask[i]*(destination_radius/bow_comparison_radius)),
                                     noo(render_colours[1][1] + hsl[i+1] - bow_colour[1]),
                                     noo(render_colours[1][2] + hsl[i+2] - bow_colour[2])
                                    );

                // need to combine main and bow colours
                if(bow_mask[i+3] > 0.1)
                {
                    // opacity significant relative to main colour, paint semitransparent bow colour onto existing colour in new image
                    new_colour = combine_colours(new_rgb.concat([bow_mask[i+1]]), [...modified_imgdata.slice(i, i+3)].concat([bow_mask[i+2]]));
                }
                else
                {
                    // bow colour dominates, no need to waste computation time combining with main colour
                    new_colour = new_rgb;
                }
                
                // set new pixel colour
                modified_imgdata[i  ] = new_colour[0];
                modified_imgdata[i+1] = new_colour[1];
                modified_imgdata[i+2] = new_colour[2];
                modified = true;
            }
            if(stern_mask[i+1] > 0.05)
            {
                // identical format to if statement above, but for stern colour this time
                new_rgb = hsl_to_rgb(
                                     hue_mod(render_colours[2][0] + stern_mask[i]*(destination_radius/stern_comparison_radius)),
                                     noo(render_colours[2][1] + hsl[i+1] - stern_colour[1]),
                                     noo(render_colours[2][2] + hsl[i+2] - stern_colour[2])
                                    );

                if(stern_mask[i+3] > 0.1)
                {
                    new_colour = combine_colours(new_rgb.concat([stern_mask[i+1]]), [...modified_imgdata.slice(i, i+3)].concat([stern_mask[i+2]]));
                }
                else
                {
                    new_colour = new_rgb;
                }
                
                modified_imgdata[i  ] = new_colour[0];
                modified_imgdata[i+1] = new_colour[1];
                modified_imgdata[i+2] = new_colour[2];
                modified = true;
            }
            if(!modified)
            {
                // The pixel is not similar to any of the source colours
                // From create_image_data we know this isn't actually HSL but the original RGB pixel, so we can add this as is to the new image
                modified_imgdata[i  ] = hsl[i  ];
                modified_imgdata[i+1] = hsl[i+1];
                modified_imgdata[i+2] = hsl[i+2];
            }
        }

        // get visible canvas
        var dest_canvas = document.getElementById("PCC-main-canvas");
        if(dest_canvas === undefined) {throw "destination canvas is inaccessible"}
        var dest_ctx = dest_canvas.getContext("2d");
    
        // paint the new pixel data onto the canvas. we're done!
        var imgdata = new ImageData(modified_imgdata, dest_canvas.width);
        dest_ctx.putImageData(imgdata, 0, 0);

        // hide loading message and unlock the UI
        document.getElementById("PCC-angry-fish-loading-message").style.display = "none";
        document.getElementById("PCC-canvas-wrapper").style.display = "block";
        PCC_HELPERS.lock_user_input("unlock");
    
        }, 100);
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_MAIN.update_colours: "+e);
    }
},

random_colours: function random_colours(call_update_functions)
{
    // changes all the colour selections to random values then recolour image (optional)
    try
    {
        call_update_functions = (call_update_functions === undefined) ? true : call_update_functions;
        // colour forms to be randomised
        var selections = ["basecolour-form", "bowsplash-form", "sternsplash-form", "grabhandles-form", "seattrim-form"];
        for(var i = 0; i < selections.length; i++)
        {
            var options = [];
            var selection = document.getElementById("PCC-"+selections[i]);

            if(selection === undefined) {throw "user selection inaccessible"}

            // add each option to array
            for(var j = 0; j < selection.children.length; j++)
            {
                if(selection.children[j].tagName === "OPTION")
                {
                    options.push(selection.children[j].value);
                }
            }

            // set selection to random item from the list
            selection.value = options[Math.floor(Math.random() * options.length)];
        }
        if(call_update_functions)
        {
            // optionally run recolouring functions
            PCC_MAIN.update_colours();
            PCC_MAIN.update_grabs();
            PCC_MAIN.update_trim();
        }
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_MAIN.random_colours: "+e);
    }
},

update_grabs: function update_grabs()
{
    // recolour grab handles 
    try
    {
        var mag = PCC_MATHS.magnitude;

        // colour to change grabs to
        var colour = PCC_INFO.grab_colours[document.getElementById("PCC-grabhandles-form").value];
        // original colour of grabs
        var colour_0 = PCC_INFO.source_info[document.getElementById("PCC-kayak-form").value][3];
        
        // change the colour of the box above the selection
        document.getElementById("PCC-grabs-highlight").style.backgroundColor = 
            "rgb("+colour[0]+","+colour[1]+","+colour[2]+")";
    
        // before colouring grabs need to reset canvas to original image
        // this is not synchronous so wrap in a promise so process can continue when canvas has loaded
        var reset_promise = new Promise(function(resolve, reject)
        {
            var grabs_image = document.getElementById("PCC-src-image_Grabs");
            if(grabs_image === undefined) {throw "grab handles image does not exist or is inaccessible"}

            PCC_HELPERS.image_to_canvas(grabs_image, "grabs-canvas");
            resolve();
        });
    
        reset_promise.then(function()
        {
            // load the now-reset canvas
            var canvas = document.getElementById("PCC-grabs-canvas");
            if(canvas === undefined) {throw "canvas is inaccessible"}
            var ctx = canvas.getContext("2d");
            // pull Uint8ClampedArray of pixels from canvas
            var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            if(imagedata === undefined) {throw "could not retrieve canvas data"}
        
            // process image data
            for(var i = 0; i < imagedata.length; i += 4)
            {
                if(imagedata[i+3] < 20)
                {
                    // ignore transparent pixels
                    continue;
                }
                // ratio to size of pixel's RGB vector to that of the ideal source colour.
                // this gives an estimate of the paleness of the pixel.
                // since the grab is almost certainly uniform in hue this is a good estimate
                var paleness = mag(imagedata.slice(i, i+3))/mag(colour_0);
                // change pixel to new colour with same paleness ratio
                imagedata[i]   = colour[0]*paleness;
                imagedata[i+1] = colour[1]*paleness;
                imagedata[i+2] = colour[2]*paleness;
            }
            
            // paint the modified imagedata to the canvas
            var imgdata = new ImageData(imagedata, canvas.width);
            ctx.putImageData(imgdata, 0, 0);
        });
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_MAIN.update_grabs: "+e);
    }
},

update_trim: function update_trim()
{
    // recolour outfitting trim
    try
    {
        var mag = PCC_MATHS.magnitude;

        // colour to change trim to
        var colour = PCC_INFO.trim_colours[document.getElementById("PCC-seattrim-form").value];
        // original colour of trim
        var colour_0 = PCC_INFO.source_info[document.getElementById("PCC-kayak-form").value][4];

        // change the colour of the box above the selection
        document.getElementById("PCC-trim-highlight").style.backgroundColor = 
            "rgb("+colour[0]+","+colour[1]+","+colour[2]+")";
    
        // before colouring trim need to reset canvas to original image
        // this is not synchronous so wrap in a promise so process can continue when canvas has loaded
        var reset_promise = new Promise(function(resolve, reject)
        {
            var trim_image = document.getElementById("PCC-src-image_Trim");
            if(trim_image === undefined) {throw "grab handles image does not exist or is inaccessible"}
            PCC_HELPERS.image_to_canvas(trim_image, "trim-canvas");
            resolve();
        });
    
        reset_promise.then(function()
        {
            // load the now-reset canvas
            var canvas = document.getElementById("PCC-trim-canvas");
            if(canvas === undefined) {throw "canvas is inaccessible"}
            var ctx = canvas.getContext("2d");
            // pull Uint8ClampedArray of pixels from canvas
            var imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            if(imagedata === undefined) {throw "could not retrieve canvas data"}
        
            // process image data
            for(var i = 0; i < imagedata.length; i += 4)
            {
                if(imagedata[i+3] < 20)
                {
                    continue;
                }
                // ratio to size of pixel's RGB vector to that of the ideal source colour.
                // this gives an estimate of the paleness of the pixel.
                // since the trim is almost certainly uniform in hue this is a good estimate
                var paleness = mag(imagedata.slice(i, i+3))/mag(colour_0);
                // change pixel to new colour with same paleness ratio
                imagedata[i]   = colour[0]*paleness;
                imagedata[i+1] = colour[1]*paleness;
                imagedata[i+2] = colour[2]*paleness;
            }
            
            // paint the modified imagedata to the canvas
            var imgdata = new ImageData(imagedata, canvas.width);
            ctx.putImageData(imgdata, 0, 0);
        });
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_MAIN.update_trim: "+e);
    }
},

download_render: function download_render()
{
    // this function combines all of the canvases to create a PNG image identical to what can be seen on-screen
    try
    {
        // we want to combine these canvases in this order
        var canvases = [document.getElementById("PCC-main-canvas"),
                        document.getElementById("PCC-misc-canvas"),
                        document.getElementById("PCC-grabs-canvas"),
                        document.getElementById("PCC-trim-canvas")];
    
        // create a temporary canvas and set it's width to that of the source canvses
        var image_canvas = document.createElement("CANVAS");
        var image_context = image_canvas.getContext("2d");    
        image_canvas.width = Math.min(...canvases.map(x => x.width));
        image_canvas.height = Math.min(...canvases.map(x => x.height));
    
        for(i = 0; i < canvases.length; i++)
        {
            // draw the content of each canvas to the temporary
            image_context.drawImage(canvases[i], 0, 0);
        }
    
        // create a temporary link to trigger a download from
        var lnk = document.createElement('A'), e;
      
        // get kayak and colour info for the name of the image
        var kayak_selection = document.getElementById("PCC-kayak-form");
        var kayak = kayak_selection.options[kayak_selection.selectedIndex].text;
        var colours = [
            document.getElementById("PCC-basecolour-form"),
            document.getElementById("PCC-bowsplash-form"),
            document.getElementById("PCC-sternsplash-form")
        ].map(x => x.options[x.selectedIndex].text);
    
        // send contents of temporary canvas to the link
        lnk.download = kayak + " ("+colours[0]+" + "+colours[1]+(colours[1] === colours[2] ? "" : " and "+colours[2])+").png";
        lnk.href = image_canvas.toDataURL("image/png;base64");
      
        // create a "fake" click-event to trigger the download
        if(document.createEvent)
        {
            e = document.createEvent("MouseEvents");
            e.initMouseEvent("click", true, true, window,
                            0, 0, 0, 0, 0, false, false, false,
                            false, 0, null);
            lnk.dispatchEvent(e);
        }
        else if(lnk.fireEvent)
        {
            lnk.fireEvent("onclick");
        }
    }
    catch(e)
    {
        PCC_HELPERS.display_error("In PCC_MAIN.download_render: "+e);
    }
}

}