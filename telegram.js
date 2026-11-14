// A public channel's page (t.me/s/durov), which shows its latest posts, reads as the channel's name, its description,
// then each post, in the order posted: its head (see commentBlock), with the channel as its author, when it was posted
// and its own page (t.me/durov/540), then its text, a block per paragraph, and its pictures. It links with weight 0.1
// to each page its posts link to, and with weight 1 to the page of the posts before these (?before=…), so a search can
// read further back.
function parseTelegram(_profileId) {
  if (location.hostname !== 't.me' || !location.pathname.startsWith('/s/')) {
    return null
  }
  const name = document.querySelector('.tgme_channel_info_header_title')?.innerText.trim()
  const posts = Array.from(document.querySelectorAll('.tgme_widget_message[data-post]'))
  if (!name && !posts.length) {
    return null
  }
  const description = document.querySelector('.tgme_channel_info_description')?.innerText.trim()
  const content = description ? description.split(/\n\s*\n/).map(text => text.trim()).filter(Boolean) : []
  const channel = `https://t.me/${location.pathname.split('/')[2]}`
  for (const post of posts) {
    content.push(commentBlock({
      author: post.querySelector('.tgme_widget_message_owner_name')?.innerText.trim() || name,
      authorUrl: channel,
      time: isoTime(post.querySelector('.tgme_widget_message_date time')?.getAttribute('datetime')),
      url: `https://t.me/${post.dataset.post}`,
    }))
    for (const photo of post.querySelectorAll('.tgme_widget_message_photo_wrap')) {
      const image = /url\(["']?([^"')]+)/.exec(photo.style.backgroundImage)?.[1]
      if (image) {
        content.push(`![](${image})`)
      }
    }
    const text = post.querySelector('.tgme_widget_message_text')?.innerText.trim()
    if (text) {
      content.push(...text.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean))
    }
  }
  const earlier = document.querySelector('a.tme_messages_more[data-before]')
  return {
    title: name || document.title,
    content,
    links: [
      ...contentLinks(posts.map(post => post.querySelector('.tgme_widget_message_text'))),
      ...(earlier ? [{ url: earlier.href, score: 1 }] : []),
    ],
  }
}

// The parser a scrape calls.
registerParser(parseTelegram)
