import flatten from 'flat'

export const api = {
  icon: '🚀',
  name: 'graph.do',
  description: 'Graph Database on Durable Objects',
  url: 'https://graph.do/api',
  type: 'https://apis.do/database',
  endpoints: {
    resources: 'https://graph.do',
    list: 'https://graph.do/:resource',
    search: 'https://graph.do/:resource?prop=value',
    new: 'https://graph.do/:resource/new?prop=value',
    get: 'https://graph.do/:resource/:id',
    set: 'https://graph.do/:resource/:id/set?prop=value',
    import: 'https://graph.do/:resource/:id/import/:url',
    delete: 'https://graph.do/:resource/:id/delete',
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
  fetch: (req, env) => env.GRAPH.get(env.GRAPH.idFromName(new URL(req.url).hostname)).fetch(req)
}

export class Graph {
  constructor(state, env) {
    this.state = state
    this.env = env
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
    const { user, origin, requestId, method, body, time, pathname, pathSegments, query = {} } = await this.env.CTX.fetch(req).then(res => res.json())
    if (pathname == '/api') return json({ api, gettingStarted, examples, user })
    if (!user.authenticated) return Response.redirect(origin + '/login')
    
    let [ resource, id, action ] = pathSegments
    action = action ? action : body ? 'set' : id == 'new' ? 'set' : 'get'
    id = id == 'new' ? crypto.randomUUID() : id
    
    query.limit = query.limit ? parseInt(query.limit) : 1000
    query.reverse = query.reverse ? query.reverse === 'true' : false
    const start = query.start ?? query.startAfter === undefined
    const end = (query.start ?? query.startAfter === undefined) && query.reverse
    
    let data = id ? await this.state.storage.get(id) :  await this.state.storage.list(query).then(list => Object.fromEntries(list)) 
    if (query.reverse) data = data.reverse()
    
    let links = id ? {
      self: `${origin}/${resource}/${id}`,
      set: data?.localTime || query?.localTime ? `${origin}/${resource}/${id}/set?inCity=${user.city}` : `${origin}/${resource}/${id}/set?localTime=${user.localTime}`,
      delete: `${origin}/${resource}/${id}/delete`
    } : {
      self: req.url,
      start: `${origin}/${resource}`,
      next: `${origin}/${resource}?startAfter=`,
      prev: `${origin}/${resource}?reverse=true&end=`,
      last: `${origin}/${resource}?reverse=true`,
    }
    
    return json({ api, links, data, user })
  }
}

export const json = data => new Response(JSON.stringify(data, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
