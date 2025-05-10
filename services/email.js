const nodemailer = require('nodemailer'); // Cambia el import a require
require('dotenv').config(); // Carga las variables de entorno

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "irenedelalamo.alumno@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});



// Función para enviar email de confirmación
const registroEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: '"Clínica Didadent" <irenedelalamo.alumno@gmail.com>',
            to: userEmail,
            subject: 'Registrado en Didadent',
            html: `
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                    <!-- Header con logo -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #007bff;">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">Clínica Dental Didadent</h1>
                            </td>
                        </tr>
                    </table>

                    <!-- Imagen principal con overlay azul más intenso -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td>
                                <div style="position: relative; max-width: 100%;">
                                    <!-- Overlay con texto -->
                                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 123, 255, 0.85);">
                                        <table width="100%" height="100%">
                                            <tr>
                                                <td style="padding: 40px; color: white; text-align: center; vertical-align: middle;">
                                                    <h1 style="font-size: 32px; margin-bottom: 20px; color: white; text-shadow: 1px 1px 3px rgba(0,0,0,0.3);">¡Bienvenido ${userName}!</h1>
                                                    <p style="font-size: 18px; margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto;">
                                                        Gracias por registrarte en nuestro sistema. Ahora puedes gestionar tus citas y acceder a todos nuestros servicios.
                                                    </p>
                                                    <a href="${process.env.BASE_URL}/autenticacion/login" 
                                                        style="background-color: #272727; color: white; padding: 15px 30px; 
                                                                text-decoration: none; font-size: 18px; border-radius: 4px; display: inline-block;
                                                                font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                                                        Iniciar sesión
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Mensaje de bienvenida con fondo blanco -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                        <tr>
                            <td align="center" style="padding: 40px 20px;">
                                <table width="100%" max-width="600">
                                    <tr>
                                        <td style="text-align: center;">
                                            <h2 style="color: #007bff; font-size: 24px; margin-bottom: 20px;">Estamos encantados de tenerte con nosotros</h2>
                                            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                                En Didadent nos comprometemos con tu salud dental. Ahora que formas parte de nuestra familia,
                                                podrás disfrutar de todos nuestros servicios con facilidad desde tu cuenta.
                                            </p>
                                            <p style="color: #495057; font-size: 16px; line-height: 1.6;">
                                                Utiliza el botón superior para acceder a tu cuenta y solicitar tu primera cita.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <!-- Footer con naranja oscuro -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #272727;">
                        <tr>
                            <td align="center" style="padding: 20px; color: white; font-size: 14px;">
                                <p style="margin: 0; font-size: 16px;">Irene Del Álamo Ruano © ${new Date().getFullYear()}</p>
                                <p style="margin: 10px 0 0 0;">
                                    <a href="${process.env.BASE_URL}" style="color: white; text-decoration: underline; font-weight: bold;">Visita nuestro sitio web</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
    };

    /* console.log("Intentando enviar email a:", userEmail);
    console.log("Configuración del transporter:", transporter.options.auth.user); */

    await transporter.sendMail(mailOptions);
    console.log('Email de registro enviado a:', userEmail);
} catch (error) {
    console.error('Error enviando email de registro:', error);
    throw new Error('No se pudo enviar el email de registro');
}
};

module.exports = { registroEmail };