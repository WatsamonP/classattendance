import { StudentcheckModule } from './studentcheck.module';

describe('StudentcheckModule', () => {
    let studentcheck: StudentcheckModule;

    beforeEach(() => {
        studentcheck = new StudentcheckModule();
    });

    it('should create an instance', () => {
        expect(StudentcheckModule).toBeTruthy();
    });
});
