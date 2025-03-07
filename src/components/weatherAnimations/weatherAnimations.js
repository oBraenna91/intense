import Sun from '../../animations/sun.json';
import Rain from '../../animations/rainy.json';
import Overcast from '../../animations/overcast.json';
import SunClouds from '../../animations/sol_og_sky.json';
import Snow from '../../animations/snow.json';

const weatherAnimations = {
    Clear: Sun,
    Clouds: Overcast,
    Rain: Rain,
    Drizzle: Rain,
    Thunderstorm: Rain,
    Snow: Snow,
    Mist: Overcast,
    Haze: Overcast,
    Fog: Overcast,
    SunClouds: SunClouds,
}

export default weatherAnimations;