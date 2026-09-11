export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface IEmailProvider {
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>
}
