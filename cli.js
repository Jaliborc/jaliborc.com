#!/usr/bin/env node

const _ = require('underscore')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const figures = require('figures')

const secure = require('./secure')
const helios = require('instant-helios')
const elegant = require('jsonresume-theme-elegant-jali')
const args = require('minimist')(process.argv.slice(2))

let all = !_.any(_.map(['pug', 'html', 'sass', 'css', 'js', 'assets'], flag => args[flag]))
let json = fs.readJsonSync(args._[0] || require.resolve('instant-helios/resume.json'), 'utf8')
let out = path.join(path.dirname(args._[0] || ''), 'build')
let cv = path.join(out, 'resume.html')

helios.dirs(out)

if ( all || args['assets'] )
  helios.assets(out)
if ( all || args['sass'] || args['css'] )
  helios.css(out, json)
if ( all || args['js'] )
  helios.js(out)
if ( all || args['pug'] || args['html'] ) {
  helios.html(out, json)
  fs.writeFileSync(cv, elegant.render(json))
  console.log(figures(chalk`{green ✔} Written resume.html`))
  secure.all(out, json)
}
