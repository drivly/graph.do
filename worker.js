import flatten from 'flat'

export const api = {
  icon: '🚀',
  name: 'graph.do',
  description: 'Graph Database on Durable Objects',
  url: 'https://graph.do/api',
  type: 'https://apis.do/database',
  endpoints: {
    listCategories: 'https://graph.do/api',
    getCategory: 'https://graph.do/:type',
  },
  site: 'https://graph.do',
  login: 'https://graph.do/login',
  signup: 'https://graph.do/signup',
  subscribe: 'https://graph.do/subscribe',
  repo: 'https://github.com/drivly/graph.do',
}

export const gettingStarted = [
  `If you don't already have a JSON Viewer Browser Extension, get that first:`,
  `https://extensions.do`,
]

export const examples = {
  listItems: 'https://templates.do/worker',
}

export default {
  fetch: (req, env) => {
    const { hostname, pathname } = new URL(req.url)
    const db = pathname.split('/')[1] 
    return env.GRAPH.get(env.GRAPH.idFromName(hostname + '/' + db)).fetch(req)
  }
}

export class Graph {
  constructor(state, env) {
    this.state = state
//     this.state.blockConcurrencyWhile(async () => {
//       const init = await this.state.storage.get('Aruba')
//       if (!init) {
//         const countries = await fetch('https://countries.do.cf/countries.json').then(res => res.json())
//         countries.map(country => {
//           this.state.storage.put(country.name.common, country)
//           Object.entries(flatten(country, { safe: true })).map(([key, value]) => Array.isArray(value) ? 
//                value.map(arrayValue => this.state.storage.put(`${key}: ${arrayValue} -> ${country.name.common}`, 'https://countries.do.cf/' + country.name.common)) :
//                this.state.storage.put(`${key}: ${value} -> ${country.name.common}`, 'https://countries.do.cf/' + country.name.common))
//         })
//       }
//     })
  }
  async fetch(req) {
    const { pathname, search, searchParams } = new URL(req.url)
    const options = Object.fromEntries(searchParams)
    const country = decodeURI(pathname.split('/')[1])
    const data = country ? await this.state.storage.get(country) : 
                           await this.state.storage.list(options).then(list => Object.fromEntries(list)) 
    return new Response(JSON.stringify({ data }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
  }
}
