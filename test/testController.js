import { BaseController } from 'plump-strut';

import { TestType } from 'plump/test/testType';

export class TestController extends BaseController {
  constructor(plump) {
    super(plump, TestType);
  }
}

TestController.hapiOptions = {
  routes: {
    prefix: '/api/tests',
  },
};
