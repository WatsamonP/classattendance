import { AddCourseModule } from './add-course.module';

describe('CourseModule', () => {
  let addCourseModule: AddCourseModule;

  beforeEach(() => {
    addCourseModule = new AddCourseModule();
  });

  it('should create an instance', () => {
    expect(addCourseModule).toBeTruthy();
  });
});
