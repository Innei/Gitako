/**
 * This script rewrites code of pjax-api to resolve compatibility issues.
 * This is a bit dirty but really effective.
 */
const fs = require('fs').promises
const path = require('path')

function modify(source = '', pairs = [], loose = true) {
  for (const [original, replace] of pairs) {
    if (source.includes(original)) {
      source = source.replace(original, replace)
      if (source.includes(original)) {
        throw new Error(`More than one original string found`, JSON.stringify(original))
      }
    } else {
      if (!loose) throw new Error(`Original string not found`, JSON.stringify(original))
    }
  }

  return source
}

async function fixPJAXAPI(loose) {
  const pairs = [
    // Firefox
    [
      `void xhr.open(method, requestURL.path, true);`,
      `void xhr.open(method, requestURL.reference, true);`,
    ],
    // Firefox
    [
      `this.document = this.xhr.responseType === 'document' ? this.xhr.responseXML.cloneNode(true) : html_1.parse(this.xhr.responseText).extract();`,
      `this.document = this.xhr.responseType === 'document' ? this.xhr.responseXML : html_1.parse(this.xhr.responseText).extract();`,
    ],
    // Chrome: modifying cross-context history state causes troubles
    // Scroll position can still be restored without this function
    [
      `
            function savePosition() {
                void window.history.replaceState({
                    ...window.history.state,
                    position: {
                        top: window.pageYOffset,
                        left: window.pageXOffset
                    }
                }, document.title);
            }`,
      `
            function savePosition() {
                return;
            }`,
    ],
  ]
  const filePath = path.resolve(__dirname, '..', `node_modules/pjax-api/dist/pjax-api.js`)
  const source = await fs.readFile(filePath, 'utf-8')
  const modified = modify(source, pairs, loose)
  fs.writeFile(filePath, modified, 'utf-8')
}

const loose = process.argv.includes('loose')
fixPJAXAPI(loose)
