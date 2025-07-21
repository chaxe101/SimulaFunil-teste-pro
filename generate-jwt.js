// generate-jwt.js
const { SignJWT } = require('jose'); // use require porque seu projeto está com type CommonJS

const secret = new TextEncoder().encode('sua_chave_secreta'); // Substitua pela mesma chave que você colocou no .env (JWT_SECRET)

async function generateToken() {
const jwt = await new SignJWT({ sub: 'user-id-123' }) // Substitua 'user-id-123' pelo ID do seu usuário, se quiser
.setProtectedHeader({ alg: 'HS256' })
.setIssuedAt()
.setExpirationTime('7d')
.sign(secret);

console.log('\n🔐 Seu token JWT:\n');
console.log(jwt + '\n');
}

generateToken();