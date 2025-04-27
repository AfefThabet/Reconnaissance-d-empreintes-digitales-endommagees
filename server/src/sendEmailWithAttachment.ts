import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Route POST pour envoyer un email avec pièce jointe
router.post('/api/send-email-with-attachment', async (req, res) => {
  const { to, subject, text, htmlContent } = req.body;

  try {
    // Configuration de Mailtrap
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 587,
      auth: {
        user: 'TON_USER_ID',               // Ton User Mailtrap
        pass: 'TON_PASSWORD'               // Ton Password Mailtrap
      }
    });

    // Chemin de la pièce jointe (par exemple un fichier PDF)
    const attachmentPath = path.join(__dirname, 'docs', 'example.pdf');

    // Construction de l'email avec pièce jointe
    const mailOptions = {
      from: '"TonApp Support" <support@tonapp.com>',
      to: to,
      subject: subject,
      text: text,
      html: htmlContent || '',
      attachments: [
        {
          filename: 'example.pdf',
          path: attachmentPath, // Chemin vers le fichier PDF
          contentType: 'application/pdf', // Type MIME du fichier
        }
      ]
    };

    // Envoi de l'email avec la pièce jointe
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé: ', info.messageId);

    res.status(200).json({ message: 'Email envoyé avec succès avec pièce jointe 🎉' });
  } catch (error) {
    console.error('Erreur d’envoi:', error);
    res.status(500).json({ error: 'Erreur lors de l’envoi de l’email ❌' });
  }
});

export default router;
