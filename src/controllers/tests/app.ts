import { App } from '../../app';

export const getExpressApp = async () => {
    const serverApp = new App(3000);
    await serverApp.initializeExpress();

    return serverApp.getExpressApp();
};
