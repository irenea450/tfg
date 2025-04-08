// middlewares/acceso.js
/**
 * Funciones que controlan el acceso a las rutas por cada tipo de usuario
 *  De esta froma los trabajadores solo pueden acceder a una zona independiente de la de los pacientes
 * */

function soloPacientes(req, res, next) {
    if (req.session.loggedin && req.session.tipo === 'paciente') {
        return next();
    }
    res.redirect('/login');
}

function soloTrabajadores(req, res, next) {
    if (req.session.loggedin && req.session.tipo === 'trabajador') {
        return next();
    }
    res.redirect('/login');
}

function estaLogueado(req, res, next) {
    if (req.session.loggedin) {
        return next();
    }
    res.redirect('/login');
}

module.exports = {
    soloPacientes,
    soloTrabajadores,
    estaLogueado
};
