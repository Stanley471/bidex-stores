import nodemailer from 'nodemailer'
import type { IEmailProvider, SendEmailOptions, SendEmailResult } from './emailProvider.interface'

export class SmtpEmailProvider implements IEmailProvider {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const secure = process.env.SMTP_SECURE === 'true'

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      })
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.transporter) {
      // Graceful fallback for local development when SMTP is unconfigured
      console.log(`[SMTP Provider Simulation] To: ${options.to} | Subject: ${options.subject}`)
      return {
        success: true,
        messageId: `simulated-${Date.now()}`,
      }
    }

    try {
      const defaultSender = process.env.SMTP_FROM || 'noreply@ctools.store'
      const info = await this.transporter.sendMail({
        from: options.from || defaultSender,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      })

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send email via SMTP provider.'
      console.error('[SMTP Provider Error]', errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }
  }
}
