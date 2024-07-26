import jsonwebtoken from 'jsonwebtoken';

// Definindo a chave privada (pode ser lida de variáveis de ambiente)
export const PRIVATE_KEY = 'dass';

// Função para validar o token JWT
export function tokenValidated(req, res, next) {
    const [, token] = req.headers.authorization?.split(' ') || [' ', ' '];

    if (!token) return res.status(401).send('Acesso negado');

    try {
        const payload = jsonwebtoken.verify(token, PRIVATE_KEY);

        // Verifica se há um usuário no payload do token
        if (!payload.user) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        // Adiciona o usuário ao cabeçalho da requisição para uso posterior
        req.user = payload.user;

        return next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Token inválido' });
    }
}
