var PCC_INFO = {
// wrapper for all information and variables that need to be accessible from any of the page's methods

// stores the location of the colour squares that appear next to dropdown items
// '' means it is hidden, otherwise equal to the ID of the active dropdown
colourbox_location: '',

// how many source images have loaded to ensure all images are ready before the program proceeds
loaded_images: 0,

// should the page layout be desktop friendly or mobile friendly?
page_layout: '',
// does the device use a touchscreen?
touchscreen: false,

/* specifies what size of image to use based on how large the browser window is
   five possible values:
   - max, width > 2000px
   - large, width = 1700px
   - medium, width = 1400px
   - small, width = 1100px
   - tiny, width = 800px
*/
image_size: 'large',

// what was the image size for each kayak last time update_kayak() was run
prev_img_size:
{
    Ripper:    'large',
    Machno:    'large',
    NineR:     'large',
    NineRII:   'large',
    TwelveR:   'large',
    Rebel:     'large',
    Jed:       'large',
    FusionII:  'large',
    FusionDuo: 'large'
},

// main colours of the kayak source images in RGB
source_info:
{
    Ripper: [
        [0, 157, 183], // base colour
        [0, 51, 110], // bow splash
        [0, 51, 110], // stern splash
        [201, 103, 48], // grab handles colour
        [0, 58, 93]  // seat trim colour
    ],
    Machno: [
        [0,   138, 208], // base colour (light blue)
        [0,   74,  188], // bow splash (dark blue) 67
        [0,   74,  188], // stern splash (dark blue) 67
        [165, 56,  22 ], // grab handles colour (red)
        [2,   57,  118]  // seat trim colour (blue)
    ],
    NineRII: [
        [255, 101, 49], // base colour
        [238, 44, 46], // bow splash
        [216, 50, 47], // stern splash
        [0, 130, 150], // grab handles colour
        [4, 101, 163]  // seat trim colour
    ],
    NineR: [
        [1, 144, 197], // base colour
        [22, 66, 187], // bow splash
        [29, 80, 174], // stern splash
        [132, 66, 37], // grab handles colour
        [2, 38, 123]  // seat trim colour
    ],
    Jed: [
        [0, 133, 185], // base colour
        [1, 23, 153], // bow splash
        [0, 20, 140], // stern splash
        [243, 46, 46], // grab handles colour
        [0, 50, 137]  // seat trim colour
    ],
    TwelveR: [
        [171, 49, 19], // base colour
        [149, 25, 30], // bow splash
        [139, 23, 27], // stern splash
        [0, 134, 176], // grab handles colour
        [2, 54, 88]  // seat trim colour
    ],
    Rebel: [
        [0, 150, 192], // base colour
        [0, 81, 164], // bow splash
        [0, 92, 180], // stern splash
        [80, 80, 80], // grab handles colour
        [0, 28, 131]  // seat trim colour
    ],
    FusionII: [
        [220, 62, 18], // base colour
        [193, 26, 24], // bow splash
        [204, 12, 9], // stern splash
        [0, 89, 107], // grab handles colour
        [0, 84, 121]  // seat trim colour
    ],
    FusionDuo: [
        [210, 71, 24], // base colour
        [183, 7, 26], // bow splash
        [182, 1, 12], // stern splash
        [1, 100, 137], // grab handles colour
        [21, 38, 70]  // seat trim colour
    ],
},

// point at which the bow splash stops and stern splash respectively start as a proportion of length
splash_cutoffs:
{
    Ripper:    [0.5416, 0.5416],
    Machno:    [0.4872, 0.4727],
    NineRII:   [0.518,  0.518 ],
    NineR:     [0.5026, 0.5026],
    Jed:       [0.4768, 0.4768],
    TwelveR:   [0.5,    0.5   ],
    Rebel:     [0.5,    0.5   ],
    FusionII:  [0.5,    0.5   ],
    FusionDuo: [0.3733, 0.3733]
},

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
colour_masks:
{
    Ripper:    [
        [], [], [], []
    ],
    Machno:    [
        [], [], [], []
    ],
    NineR:     [
        [], [], [], []
    ],
    NineRII:   [
        [], [], [], []
    ],
    TwelveR:   [
        [], [], [], []
    ],
    Rebel:     [
        [], [], [], []
    ],
    Jed:       [
        [], [], [], []
    ],
    FusionII:  [
        [], [], [], []
    ],
    FusionDuo: [
        [], [], [], []
    ],
},

// the possible hull colour choices (RGB 0-255)
colour_options:
{
    Yellow:	    [226, 209, 2  ],
    Jaffa:	    [243, 110, 40 ],
    Red:	    [200, 0,   20 ],
    Turquoise:	[24,  165, 192],
    Lime:	    [96,  187, 70 ],
    Fuchsia:	[215, 57,  149],
    Purple:	    [64,  40,  134],
    DarkGreen:	[2,   46,  44 ],
    DarkBlue:	[37,  33,  97 ],
    White:	    [210, 210, 210],
    DarkGrey:	[70,  70,  70 ],
    LightGrey:	[110, 110, 110],
    Black:	    [35,  35,  35 ]
},

// the possible grab handle colour choices (RGB 0-255)
grab_colours:
{
    Grey:   [140, 140, 140],
    Red:    [160, 30,  30 ],
    Purple: [144, 38,  143],
    Yellow: [247, 147, 29 ],
    Blue:   [0,   140, 180]
},

// the possible outfitting trim colour choices (RGB 0-255)
trim_colours:
{
    Black:  [10,  10,  10 ],
    Red:    [190, 29,  44 ],
    Yellow: [250, 190, 40 ],
    Blue:   [0,   131, 179]
},

}