import { atom } from 'jotai';

/** filter type controls */
export const userInfo = atom<Record<string,any> | null>(null);

// /** filtered links */
// export const filterAtom = atom((get) => {
//   const links = get(linksAtom)
//   return links.filter((link) => {
//     if (get(filterType) === 'all') return true
//     return link.done === (get(filterType) === 'completed')
//   })
// })

/** active links count */
// export const activeLinkCountAtom = atom((get) => {
//   const links = get(linksAtom)
//   return links.filter((link) => !link.done).length
// })

// /** is any links done */
// export const anyLinksDone = atom((get) => {
//   const links = get(linksAtom)
//   return links.some((link) => link.done)
// })
