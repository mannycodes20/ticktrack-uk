// Short guide notes for each species in the Elanco data.
// The names and Latin names come from the API, these notes are our own summary.
export type SpeciesGuide = { lives: string; feeds: string; pets: string }

export const SPECIES_GUIDE: Record<string, SpeciesGuide> = {
  'Marsh tick': {
    lives: 'Wet grassland, marshes and river banks.',
    feeds: 'Mostly small mammals such as voles.',
    pets: 'Dogs walked through boggy ground can pick it up.',
  },
  'Southern rodent tick': {
    lives: 'Burrows and nests, mainly in southern England.',
    feeds: 'Mice, voles and shrews.',
    pets: 'Cats that hunt rodents are the most likely to meet it.',
  },
  'Passerine tick': {
    lives: 'Hedges, gardens and woodland edges.',
    feeds: 'Ground-feeding birds such as blackbirds and robins, which carry it long distances.',
    pets: 'Rarely bites pets, but can be found in gardens with bird feeders.',
  },
  'Fox/badger tick': {
    lives: 'Inside fox and badger dens rather than out in the open.',
    feeds: 'Foxes, badgers and dogs.',
    pets: 'Dogs that dig or put their head into dens can be bitten.',
  },
  'Tree-hole tick': {
    lives: 'Tree holes and nest boxes.',
    feeds: 'Birds that nest in holes, such as tits.',
    pets: 'Rarely bites pets.',
  },
}