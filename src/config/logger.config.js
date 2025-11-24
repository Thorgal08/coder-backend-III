import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// stream para escribir logs en archivo
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
);

// formato personalizado para logs
morgan.token('body', (req) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        // no logear passwords
        const body = { ...req.body };
        if (body.password) body.password = '***';
        return JSON.stringify(body);
    }
    return '-';
});

// formato para produccion (archivo)
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// formato para desarrollo (consola con colores)
const developmentFormat = ':method :url :status :response-time ms - :res[content-length]';

// configuracion segun ambiente
const environment = process.env.NODE_ENV || 'development';

let morganMiddleware;

if (environment === 'production') {
    // en produccion: logs a archivo
    morganMiddleware = morgan(productionFormat, { stream: accessLogStream });
} else {
    // en desarrollo: logs a consola con colores
    morganMiddleware = morgan('dev');
}

export default morganMiddleware;
