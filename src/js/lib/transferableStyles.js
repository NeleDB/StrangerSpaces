import pickRandom from 'pure-fun/arrays/pickRandom';

export const getRandomStyle = () => {
  const randomStyleKey =  pickRandom(Object.keys(STYLE_MAPPINGS));
  return STYLE_MAPPINGS[randomStyleKey];
};

// export const STYLE_MAPPINGS = {
//   'Udnie, Francis Picabia': `udnie`,
//   'The Scream, Edvard Munch': `scream`,
//   'La Muse, Pablo Picasso': `la_muse`,
//   'Rain Princess, Leonid Afremov': `rain_princess`,
//   'The Wave, Katsushika Hokusai': `wave`,
//   'The Wreck of the Minotaur, J.M.W. Turner': `wreck`,
//   'Stranger Things': `stranger`
// };

export const STYLE_MAPPINGS = {
  'Stranger Things': `stranger`
};
