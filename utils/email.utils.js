const { v4: uuidv4 } = require('uuid')
const { Resend } = require('resend')
const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')
const htmlToText = require('html-email-to-text')

const resend = new Resend(process.env.RESEND_API_KEY)

const getHtmlTemplate = (templateName, data) => {
  const templateHtml = fs.readFileSync(path.resolve(__dirname, `../templates/${templateName}.html`), 'utf-8')
  const compiledTemplate = handlebars.compile(templateHtml)
  const renderedHtml = compiledTemplate(data)
  return renderedHtml
}

const getRecipient = (recipient) => {
  return (process.env.ENV == 'dev' && process.env.SEND_EMAIL_STAGING == "false") ? 'delivered@resend.dev' : recipient
}

const sendEmailHtml = async (to, subject, templateName, data) => {
  if (process.env.ENV == 'dev' && process.env.SEND_EMAIL_STAGING == "false") return console.log('Email not sent in dev/staging')
  try {
    const unsubscribeUrl = process.env.RESEND_UNSUBSCRIBE_USER_URL
    const htmlTemplate = getHtmlTemplate(templateName, data)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: getRecipient(to),
      subject: subject,
      html: htmlTemplate,
      text: htmlToText(htmlTemplate),
      Headers: {
        'X-Entity-Ref-ID': uuidv4(),
      }
    })
    console.log('Email sent to:', to)
  } catch (error) {
    console.error(error)
  }
}

const sendRegisterEmail = async ({ email, hash }) => {
  const data = {
    email,
    hash
  }
  await sendEmailHtml(email, 'Confirmez votre email', 'registerTokenEmail', data)
}

module.exports = {
  sendRegisterEmail
}