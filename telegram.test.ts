import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('reference sites', () => {
  it('reads a Telegram channel as its posts, each headed by its time and page, linking to the posts before them', () => {
    const { parseTelegram } = load('telegram.js', ['parseTelegram'])
    visit('https://t.me/s/durov', `<div class="tgme_channel_info_header_title">Pavel Durov</div>
      <a class="tme_messages_more" data-before="540" href="/s/durov?before=540"></a>
      <div class="tgme_widget_message" data-post="durov/541"><div class="tgme_widget_message_text">Telegram turns 13 <a href="https://telegram.org/blog">blog</a></div>
        <a class="tgme_widget_message_date"><time datetime="2026-08-14T13:49:28+00:00"></time></a></div>`)
    expect(parseTelegram()).toEqual({
      title: 'Pavel Durov',
      content: ['<comment depth="0" author="Pavel Durov" author-url="https://t.me/durov" time="2026-08-14T13:49:28.000Z" url="https://t.me/durov/541">', 'Telegram turns 13 blog'],
      links: [{ url: 'https://telegram.org/blog', title: 'blog', score: 0.1 }, { url: 'https://t.me/s/durov?before=540', score: 1 }],
    })
  })
})
