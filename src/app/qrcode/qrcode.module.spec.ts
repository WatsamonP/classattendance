import { QrcodeModule } from './qrcode.module';

describe('QrcodeModule', () => {
    let qrcodeModule: QrcodeModule;

    beforeEach(() => {
        qrcodeModule = new QrcodeModule();
    });

    it('should create an instance', () => {
        expect(QrcodeModule).toBeTruthy();
    });
});
