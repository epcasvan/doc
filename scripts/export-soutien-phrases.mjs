
import { createServer } from 'vite'
import { writeFileSync, mkdirSync } from 'fs'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
})
try {
  const { soutienBankById } = await server.ssrLoadModule('/src/francais/soutien/banks.ts')
  const ids = `a,o,i,u,e,y,b,c-k,c-s,d,g-g,g-j,k,p,q,t,f,j,l,m,n,r,s-s,s-z,v,z,w,x-ks,x-gz,h,ch,ph,ou,oi,an,in,on,au,gn,ill`.split(',')
  mkdirSync('public/soutien-phrases/type9', { recursive: true })
  mkdirSync('public/soutien-phrases/type12', { recursive: true })
  mkdirSync('public/soutien-phrases/type14', { recursive: true })
  const type9={}, type12={}, type14={}
  for (const id of ids) {
    const bank = soutienBankById(id)
    if (!bank) { console.log('missing', id); continue }
    type9[id] = bank.scrambles.map(s => ({ word: s.word, sentence: s.sentence }))
    type12[id] = [...bank.countPhrases]
    type14[id] = [...bank.readPhrases]
    writeFileSync(`public/soutien-phrases/type9/${id}.json`, JSON.stringify(type9[id], null, 2)+'\n')
    writeFileSync(`public/soutien-phrases/type12/${id}.json`, JSON.stringify(type12[id], null, 2)+'\n')
    writeFileSync(`public/soutien-phrases/type14/${id}.json`, JSON.stringify(type14[id], null, 2)+'\n')
  }
  writeFileSync('public/soutien-phrases/type9-all.json', JSON.stringify(type9, null, 2)+'\n')
  writeFileSync('public/soutien-phrases/type12-all.json', JSON.stringify(type12, null, 2)+'\n')
  writeFileSync('public/soutien-phrases/type14-all.json', JSON.stringify(type14, null, 2)+'\n')
  console.log('exported', Object.keys(type9).length)
} finally {
  await server.close()
}
