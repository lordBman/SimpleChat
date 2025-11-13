import Elysia from "elysia";
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";

const alg = 'RS256';

const JWTPlugin = new Elysia().derive({ as: "global" }, async ()=>({
    encrypt: async <T>(data: T) => {
        const privateKey = await importPKCS8(process.env.PRIVATE_KEY!, alg);

        return await new SignJWT({ data })
          .setProtectedHeader({ alg })
          .setIssuedAt()
          .setExpirationTime('7d')
          .sign(privateKey);
    },
    decrypt: async <T>(token: string) =>{
        const publicKey = await importSPKI(process.env.PUBLIC_KEY!, alg);

        const { payload: { data } } = await jwtVerify(token, publicKey);
        return data as T;
    }
}));

export default JWTPlugin;