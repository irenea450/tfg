// 📌 Importar módulos necesarios
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs"); // Para encriptar y comparar contraseñas
const conectarDB = require("../conexion/conexion"); // Conexión a la base de datos


// 📌 Estrategia para LOGIN (local-login)
passport.use(
    "local-login",
    new LocalStrategy(
        {
            usernameField: "correo",   // Asegúrate de que este campo coincida con el nombre del campo del formulario
            passwordField: "contraseña", // Aquí cambiamos a 'contraseña'
            passReqToCallback: true,    // Permite acceder a `req` en la función callback
        },
        async (req, correo, contraseña, done) => {
            try {
                const connection = await conectarDB();
                const [rows] = await connection.execute(
                    "SELECT * FROM trabajador WHERE correo = ?",
                    [correo]
                );

                if (rows.length === 0) {
                    return done(null, false, req.flash("loginMensaje", "⚠️ Usuario no encontrado"));
                }

                const user = rows[0]; // 📌 Usuario encontrado
                console.log(user);

                // Compara la contraseña ingresada con la encriptada
                const validPassword = await bcrypt.compare(contraseña, user.contraseña);
                await connection.end();

                if (!validPassword) {
                    return done(null, false, req.flash("loginMensaje", "⚠️ Contraseña incorrecta"));
                }

                return done(null, user); // Usuario autenticado correctamente
            } catch (error) {
                return done(error); // Error en la autenticación
            }
        }
    )
);


/* ---------------------- Registrar trabajadores --------------------- */
passport.use(
    "local-registrarse",
    new LocalStrategy(
        {
            passReqToCallback: true, // Permite recibir `req` para acceder a otros campos del formulario
        },
        async (req, done) => {  // Los parámetros username y password serán obtenidos del body automáticamente
            try {
                // Obtener los datos directamente de `req.body`
                const { rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseña } = req.body;

                console.log(req.body);

                // Verificar que todos los campos estén presentes
                if (!correo || !contraseña || !rol || !nombre || !apellidos || !tlf || !estado || !especialidad) {
                    req.session.error = "⚠️ Todos los campos son obligatorios";
                    return res.redirect('/autenticacion/registrarse'); // Redirige al formulario de registro
                }

                // Llamamos al modelo para registrar al trabajador
                const result = await registrarTrabajador(rol, nombre, apellidos, correo, tlf, estado, especialidad, contraseña);

                if (result.error) {
                    req.session.error = result.error; // Almacena el error en la sesión
                    return res.redirect('/autenticacion/registrarse'); // Redirige de nuevo al formulario de registro
                }

                // Si el registro es exitoso, puedes redirigir al login o donde quieras
                req.session.success = "¡Te has registrado correctamente!";
                res.redirect('/autenticacion/login');



                return done(null, result.user);  // El trabajador fue registrado correctamente


            } catch (error) {
                console.error("❌ Error en registro:", error);
                return done(error); // Manejo de error
            }
        }
    )
);





module.exports = passport; // ✅ Exporta solo `passport`