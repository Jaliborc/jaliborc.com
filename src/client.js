function GetSecuredData(token) {
	console.log('Validating human...')

	$.getJSON('/captcha.php', {token: token}, (data) => {
		console.log('Validated')
		sessionStorage.captcha_data = JSON.stringify(data)
		ApplySecuredData()
	})
}

function ApplySecuredData() {
	let data = JSON.parse(sessionStorage.captcha_data)

	function replaceEmails(string, emails) {
		for (let id in emails)
			string = string.replace(new RegExp(`fake${id}@noscript.com`, 'g'), emails[id])

		return string
	}

	$('div, span, section, nav, article, header, footer, p, a').each((_, dom) => {
		let content = dom.childNodes[0]
		let text = content && content.nodeValue
		if (text && text.includes('@noscript.com'))
			content.nodeValue = replaceEmails(text, data)

		let link = dom.getAttribute('href')
		if (link && link.includes('@noscript.com'))
			dom.setAttribute('href', replaceEmails(link, data))
	})
}

if (sessionStorage.captcha_data)
	ApplySecuredData()
else
	$.getScript('https://www.google.com/recaptcha/api.js', () => {
		$('body').append('<div class="g-recaptcha" data-sitekey="PUBLIC_KEY" data-callback="GetSecuredData" data-size="invisible" style="display:none"></div>')
		grecaptcha.ready(() => grecaptcha.execute())
	})
