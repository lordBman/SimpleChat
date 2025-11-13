import { exportPKCS8, exportSPKI, generateKeyPair, importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose"

const alg = 'RS256'
let { publicKey, privateKey } = await generateKeyPair(alg, { extractable: true })

console.log(publicKey)
console.log(privateKey)

const jwt = await new SignJWT({ name: "Bobby", surname: "Okelekele" })
  .setProtectedHeader({ alg })
  .setIssuedAt()
  .setIssuer('urn:example:issuer')
  .setAudience('urn:example:audience')
  .setExpirationTime('7d')
  .sign(privateKey);

console.log(jwt)

const { payload, protectedHeader } = await jwtVerify(jwt, publicKey)

console.log(protectedHeader)
console.log(payload)

const spiStringPublic = await exportSPKI(publicKey);
console.log(spiStringPublic);

const pkcStringPrivate = await exportPKCS8(privateKey);
console.log(pkcStringPrivate);

console.log(process.env.PRIVATE_KEY);