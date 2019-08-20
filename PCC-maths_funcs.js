var PCC_MATHS = {
// wrapper object for mathematical functions

magnitude: function magnitude(a)
{
    // returns the magnitude of a 3-vector, |a|
    return Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2));
},

noo: function noo(x)
{
    // N.O.O: Not Over One
    // if x isn't in the range 0-1 returns 0 and 1 respectively
    x = (x < 0 ? 0 : x);
    return (x > 1 ? 1 : x);
},

hue_mod: function hue_mod(hue)
{
    // hue is angle of point on circumference of a circle in degrees, if not in 
    // the range 0-360 returns the angle in this range
    if((hue < 0) || !(hue < 360))
    {
        return hue-(360*Math.floor(hue/360));
    }
    else
    {
        return hue;
    }
},

what_x: function what_x(i, width)
{
    // returns the x-coordinate (zero-indexed) of an iterator 
    // over a grid of given width, where the iterator i is also
    // zero indexed and travels from left to right and top to bottom
    return (i+1)%width;

    // version that returns 2d coordinate [x,y]:
    /*i++;
    return [(i%width),Math.ceil(i/width)];*/
},

least_angle(a, b)
{
    // a, b are angles of two points on the circumference of a circle
    // returns smallest angle between the two
    return Math.min(Math.abs(a-b), 360-Math.abs(a-b));
}

}
