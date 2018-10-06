const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const figures = require('figures')

const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
const pageSuffix = '<script src="/captcha.js"></script></body>'

exports.obfuscateHTML = function(out) {
  let emails = new Map()
  let files = fs.readdirSync(out)

  for (file of files) {
    if (path.extname(file) == '.html') {
      let filename = path.join(out, file)
      let html = fs.readFileSync(filename, 'utf8')

      for (email of html.match(emailRegex))
        if (!emails.has(email))
          emails.set(email, emails.size)

      for (entry of emails) {
        let email = entry[0]
        let id = entry[1]

        html = html.replace(/${email}/g, `fake${id}@noscript.com`)
      }

      fs.writeFileSync(filename, html.replace('</body>', pageSuffix), 'utf8')
      console.log(figures(chalk`{green ✔} Obfuscated ${filename}`))
    }
  }

  return {emails: emails}
}

exports.deployCode = function(out, data) {
  let client = exports.readFormatted('src/client.js', data)
  let server = exports.readFormatted('src/server.php', data)

  fs.writeFileSync(path.join(out, 'captcha.php'), server, 'utf8')
  console.log(figures(chalk`{green ✔} Written captcha.php`))

  fs.writeFileSync(path.join(out, 'captcha.js'), require('uglify-es').minify(client).code, 'utf8')
  console.log(figures(chalk`{green ✔} Written captcha.js`))
}

exports.readFormatted = function(file, data) {
  let keys = data.json.basics.recaptcha
  let phpdata = ''
  for (entry of data.emails) {
    let email = entry[0]
    let id = entry[1]

    phpdata += `'${id}'=>'${email}',`
  }

  return fs.readFileSync(file, 'utf8')
               .replace('SECURE_DATA', phpdata.slice(0, -1))
               .replace('PRIVATE_KEY', keys && keys.private)
               .replace('PUBLIC_KEY', keys && keys.public)
}

exports.all = function(out, json) {
  let data = exports.obfuscateHTML(out)

  data.json = json
  exports.deployCode(out, data)
}
