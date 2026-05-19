interface SendSmsOptions {
  to: string
  message: string
}

export async function sendSms({ to, message }: SendSmsOptions) {
  const phone = to.replace(/\D/g, '').replace(/^0/, '972')

  const response = await fetch('https://api.inforu.co.il/SendMessageXml.ashx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      InforuXML: `<?xml version="1.0" encoding="UTF-8"?>
<Inforu>
  <User>
    <Username>${process.env.INFORU_USERNAME}</Username>
    <ApiToken>${process.env.INFORU_API_TOKEN}</ApiToken>
  </User>
  <Content Type="sms">
    <Message>${message}</Message>
  </Content>
  <Recipients>
    <PhoneNumber>${phone}</PhoneNumber>
  </Recipients>
  <Settings>
    <Sender>${process.env.INFORU_SENDER_ID}</Sender>
  </Settings>
</Inforu>`,
    }),
  })

  if (!response.ok) {
    throw new Error(`SMS send failed: ${response.statusText}`)
  }

  return response.text()
}
