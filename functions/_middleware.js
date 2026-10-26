// Cloudflare Pages Function: rewrites the "Guides & Answers" nav dropdown
// on every HTML page from one central list, so adding or removing a guide
// or answer page is ONE edit here instead of one edit per HTML file.
//
// To add a new guide or answer page: add one <li> below (in the right spot)
// and commit this file. No other page on the site needs to change, and no
// separate Cloudflare dashboard step is needed — Pages auto-deploys this
// file the same way it deploys the HTML pages.
//
// This runs server-side (at Cloudflare's edge) before the response reaches
// any browser or search-engine crawler, so Google/Bing see plain, real
// HTML links here -- not something only visible after JavaScript runs.

const GUIDES_AND_ANSWERS_HTML = `
<li><a href="/faq">Ask Damara (FAQ)</a></li>
<li><a href="/coastal-insider-guide">Coastal Insider Guide</a></li>
<li><a href="/listing-playbook">Listing Playbook</a></li>
<li><a href="/moving-from-connecticut-to-delray-beach">Moving from Connecticut to Delray Beach</a></li>
<li><a href="/moving-from-dc-maryland-virginia-to-delray-beach">Moving from the DC Metro Area to Delray Beach</a></li>
<li><a href="/moving-from-new-jersey-to-delray-beach">Moving from New Jersey to Delray Beach</a></li>
<li><a href="/moving-from-new-york-to-delray-beach">Moving from New York to Delray Beach</a></li>
<li><a href="/the-real-delray-beach-guide">The Real Delray Beach Guide</a></li>
<li class="sub-label" role="presentation">Delray Beach Questions</li>
<li><a href="/best-delray-beach-neighborhood-for-me">Best Delray Neighborhood for Me</a></li>
<li><a href="/best-delray-beach-happy-hours">Best Happy Hours</a></li>
<li><a href="/delray-beach-nightlife">Delray Beach Nightlife</a></li>
<li><a href="/does-brightline-stop-in-delray-beach">Does Brightline Stop in Delray?</a></li>
<li><a href="/is-delray-beach-expensive">Is Delray Beach Expensive?</a></li>
<li><a href="/best-delray-beach-restaurants-locals-go">Restaurants Locals Go To</a></li>
<li><a href="/where-to-stay-in-delray-beach-house-hunting">Where to Stay While House Hunting</a></li>
`.trim();

class GuidesDropdownRewriter {
  constructor() {
    this.buttonTextBuffer = '';
    this.nextSubMenuIsGuides = false;
  }

  // Each page has 4 dropdown buttons with the same classes (About & Contact,
  // Buy & Sell, Guides & Answers, Towns & Neighborhoods) -- we track each
  // button's own text so we know which one we're looking at.
  onButtonElement() {
    this.buttonTextBuffer = '';
  }

  onButtonText(text) {
    this.buttonTextBuffer += text.text;
    if (text.lastInTextNode) {
      this.nextSubMenuIsGuides = this.buttonTextBuffer.includes('Guides');
    }
  }

  // The <ul class="sub-menu"> immediately following a "Guides & Answers"
  // button gets its contents replaced. Every other dropdown's menu
  // (About & Contact, Buy & Sell, Towns & Neighborhoods) is left untouched.
  onSubMenuElement(element) {
    if (this.nextSubMenuIsGuides) {
      element.setInnerContent(GUIDES_AND_ANSWERS_HTML, { html: true });
      this.nextSubMenuIsGuides = false;
    }
  }
}

export async function onRequest(context) {
  const response = await context.next();

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    // Leave sitemap.xml, nav.js, images, the IndexNow key file, etc. untouched.
    return response;
  }

  const rewriter = new GuidesDropdownRewriter();

  return new HTMLRewriter()
    .on('button.sub-toggle', {
      element: () => rewriter.onButtonElement(),
      text: (text) => rewriter.onButtonText(text),
    })
    .on('ul.sub-menu', {
      element: (element) => rewriter.onSubMenuElement(element),
    })
    .transform(response);
}
