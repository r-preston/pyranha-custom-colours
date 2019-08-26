# __pyranha-custom-colours__
 ## _Contents_
  1) Purpose
  2) Overview of method
  3) Source image requirements
  4) Required image info
  5) Adding colours

# Purpose

This project started as an experiment in changing and manipulating colours in bitmap images using JavaScript, for which kayaks were ideal subjects due to their regular nature and bright, contrasting colours.

As the project progressed I decided to target Pyranha kayaks and create a kayak customiser, rendering the appearance of a [custom coloured kayak](http://www.pyranha.com/pdfs/pyranha_custom_colours_2019_r1.pdf) from a single source image. This was inspired by P&H Sea Kayaks [online kayak customiser](http://www.phseakayaks.com/kayakCustomiser.php), however the irregular and varied patterns this was more suited to an on-the-fly approach such that I has been working on rather than the static images used by P&H.

The result is that a source image can be provided and recoloured on-the-fly to create a near photo-realistic sample of what a combination of colours would look like on the full range of Pyranha kayak models.

# Overview of method

See comments in code for full explaination, this is just a brief rundown.

This code works on the principle of _colour rotation_. Each of the image's pixels are converted from standard RGB (red, green, blue) to HSL (hue, saturation, lightness). 
Hue is the apparent colour, usually defined as a point on the perimeter of a circle, starting from red.
                        
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/HSL_color_solid_dblcone.png/800px-HSL_color_solid_dblcone.png" width="400"/>
<img src="https://www.sessions.edu/wp-content/themes/divi-child/color-calculator/wheel-5-ryb.png" width="300"/>

    HSL colour and the hue wheel

The idea is that the code identifies a wedge of the hue wheel for which hues in that wedge are closer to a particular colour of the source image than any other. That wedge can then be 'rotated' around the hue circle to change all pixels with the original hue to the hue of whatever the desired colour is.

The advantage of this method is that it preserves the shadows, highlights and texture of the orignal image\*, leading to a realistic looking result.

\* saturation and lightness are modified to match desired colour, but variations are preserved

# Source image requirements

Each kayak doesn't really have one single source image - each kayak model has 20 different images. The reason for this is:
 - There are five sets of four images for varying widths of image - 800px, 1100px, 1400px, 1700px and ~2000px
 - Each size has four images:
   * Unmodified image - this is an unmodified picture of the kayak
   * Seat trim image - only part of the image to be modified by the seat trim colouring function
   * Grab handle image - only the rescue handles and security points of the kayak, to be recoloured by the grab handle recolouring function
   * Misc image - any part of the original image that shouldn't be changed for any reason.
   
   Each set of 4 images should be the same size so when superimposed each part appears where it should

# Required image info

This should be instering into `PCC-info.js`

### Colours
The RGB colours of the source image colours (main colour, bow splash, stern splash, trim and grab handles) should be inserted into `PCC_INFO.source_info`

### Cutoffs
To prevent potential interference between bow and stern splashes, the proportions of the image's length where the bow splash stops and stern splash starts should be inserted into `PCC_INFO.splash_cutoffs`

# Adding colours

If you wish to add a render colour, you must add it to the appropriate dropdown menu of `index.html` and into `PCC_INFO.colour_options`, `PCC_INFO.grab_colours` or `PCC_INFO.trim_colours`, depending on what the colour is for. Be careful to ensure the `value` of the dropdown menu item matched the `PCC_INFO` entry, as dropdown items without a matching RGB value in `PCC_INFO` will be removed automatically.

