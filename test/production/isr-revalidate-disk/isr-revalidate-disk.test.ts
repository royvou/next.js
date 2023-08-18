import cheerio from 'cheerio'
import { createNextDescribe } from 'e2e-utils'
/* eslint-env jest */
import { waitFor } from 'next-test-utils'

createNextDescribe(
  'isr-disk-cache',
  {
    files: __dirname,
  },
  ({ next }) => {
    it('should revalidate after notFound is returned for fallback: blocking and the page was previously generated ', async () => {
      await next.patchFile(
        'next.config.js',
        `module.exports = {
          experimental: {
            isrMemoryCacheSize: 0,
          }
        }`
      )

      const privateCache =
        'private, no-cache, no-store, max-age=0, must-revalidate'
      const revalidateCache = 's-maxage=1, stale-while-revalidate'

      await next.patchFile('data.txt', '200')

      const fetchPath = '/fallback-blocking/hello'
      let res = await next.fetch(fetchPath)
      let $ = cheerio.load(await res.text())

      expect(res.headers.get('cache-control')).toBe(revalidateCache)
      expect(JSON.parse($('#props').text())?.params.slug).toEqual('hello')

      expect(res.status).toBe(200)

      waitFor(1000)
      res = await next.fetch(fetchPath)
      $ = cheerio.load(await res.text())

      expect(res.headers.get('cache-control')).toBe(revalidateCache)
      expect(JSON.parse($('#props').text())?.params.slug).toEqual('hello')

      expect(res.status).toBe(200)

      // Unpublish data
      await next.patchFile('data.txt', '404')

      await waitFor(1000)
      res = await next.fetch(fetchPath)
      $ = cheerio.load(await res.text())

      expect(res.headers.get('cache-control')).toBe(revalidateCache)
      expect(JSON.parse($('#props').text())?.params.slug).toEqual('hello')

      expect(res.status).toBe(200)

      // Revalidate has executed and now the page is unpublished
      await waitFor(1000)
      res = await next.fetch(fetchPath)
      $ = cheerio.load(await res.text())

      expect(res.headers.get('cache-control')).toBe(privateCache)
      expect(JSON.parse($('#props').text()).notFound).toBe(true)
      expect(res.status).toBe(404)

      // Republish page
      await next.patchFile('data.txt', '200')

      res = await next.fetch(fetchPath)

      $ = cheerio.load(await res.text())

      expect(res.headers.get('cache-control')).toBe(revalidateCache)
      expect(JSON.parse($('#props').text())?.params.slug).toEqual('hello')

      expect(res.status).toBe(200)
    })

    it('should revalidate after redirect is returned for fallback: blocking and the page was previously generated', async () => {
      await next.patchFile(
        'next.config.js',
        `module.exports = {
          experimental: {
            isrMemoryCacheSize: 0,
          }
        }`
      )
      const revalidateCache = 's-maxage=1, stale-while-revalidate'

      const fetchPath = '/fallback-blocking-redirect/hello'
      await next.patchFile('data.txt', '200')

      let res = await next.fetch(fetchPath)
      let $ = cheerio.load(await res.text())

      expect(res.headers.get('cache-control')).toBe(revalidateCache)
      expect(JSON.parse($('#props').text())?.params.slug).toEqual('hello')
      expect(res.status).toBe(200)

      await waitFor(1000)
      res = await next.fetch(fetchPath)
      $ = cheerio.load(await res.text())

      expect(res.headers.get('cache-control')).toBe(revalidateCache)
      expect(JSON.parse($('#props').text())?.params.slug).toEqual('hello')
      expect(res.status).toBe(200)

      // Unpublish data
      await next.patchFile('data.txt', '404')

      await waitFor(1000)
      res = await next.fetch(fetchPath)
      $ = cheerio.load(await res.text())

      expect(res.headers.get('cache-control')).toBe(revalidateCache)
      expect(JSON.parse($('#props').text())?.params.slug).toEqual('hello')
      expect(res.status).toBe(200)

      // Revalidate has executed and now the page is unpublished
      await waitFor(1000)
      res = await next.fetch(fetchPath)
      $ = cheerio.load(await res.text())

      // We expect the redirect to be followed and the redirected page to be /home
      expect(res.headers.get('cache-control')).toBe(revalidateCache)
      expect(JSON.parse($('#props').text())?.slug).toEqual('home')
      expect(res.status).toBe(200)

      // Republish page
      await next.patchFile('data.txt', '200')

      res = await next.fetch(fetchPath)
      $ = cheerio.load(await res.text())

      expect(res.headers.get('cache-control')).toBe(revalidateCache)
      expect(JSON.parse($('#props').text())?.params.slug).toEqual('hello')

      expect(res.status).toBe(200)
    })
  }
)
